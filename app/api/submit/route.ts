import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verificarTurnstile, ipDelVisitante } from '@/lib/turnstile'
import { anoValido, mensajeAnoInvalido } from '@/lib/fanDesde'

// Cuántas veces se reintenta el alta si el fan_id ya existe. Con el sufijo
// aleatorio un choque es casi imposible, así que esto es cinturón y tirantes:
// lo que no queremos es que un socio pierda su registro por mala suerte.
const MAX_INTENTOS = 3

/**
 * Identificador del socio: el que va en el QR y en las URLs.
 *
 * Conserva el timestamp porque es cómodo —se lee, y ordena por antigüedad—
 * pero le agrega 8 hex aleatorios. Antes era solo `NEL-${Date.now()}` y la
 * tabla tiene UNIQUE (fan_id): dos altas en el mismo milisegundo chocaban y
 * la segunda moría con un 500 genérico, dejando además la foto huérfana en
 * Storage. Con la gente llegando de a poco el riesgo era mínimo, pero al
 * proyectar el QR y pedir que todos se registren a la vez —que es justo el
 * plan— con 100 personas en 10 segundos pasaba cerca del 39% de las veces.
 */
function nuevoFanId(): string {
  return `NEL-${Date.now()}-${randomUUID().slice(0, 8)}`
}

interface ErrorPostgres {
  code?: string
  message?: string
}

function choqueDe(error: unknown, restriccion: string): boolean {
  const e = error as ErrorPostgres | null
  return e?.code === '23505' && String(e?.message ?? '').includes(restriccion)
}

const BUCKET_FOTOS = 'fan-photos'

/**
 * Borra la foto que se acaba de subir cuando el alta no prosperó.
 *
 * El formulario sube la foto y luego guarda los datos. Si lo segundo falla
 * —correo repetido es el caso frecuente, y no es siquiera un error— la foto
 * ya está en Storage y nadie la va a referenciar nunca: ocupa espacio que no
 * se puede reclamar porque no hay forma de saber a quién pertenecía.
 *
 * Es best-effort: si la limpieza falla, el socio igual recibe su respuesta.
 * Una foto de más pesa 337 KB; dejar al socio sin saber qué pasó cuesta más.
 */
async function borrarFotoHuerfana(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  urlFoto: unknown
): Promise<void> {
  try {
    if (typeof urlFoto !== 'string') return

    const marca = `/${BUCKET_FOTOS}/`
    const corte = urlFoto.indexOf(marca)
    if (corte === -1) return

    const nombre = decodeURIComponent(urlFoto.slice(corte + marca.length))
    if (!nombre || nombre.includes('/')) return

    // Nunca borrar una foto en uso. urlFoto llega del cliente, así que podría
    // apuntar a la de otro socio: sin esta comprobación, una petición armada a
    // mano borraría la foto de alguien más y su tarjeta ya no se podría rearmar.
    const { data: enUso } = await supabase
      .from('fans')
      .select('fan_id')
      .eq('foto_url', urlFoto)
      .limit(1)
      .maybeSingle()

    if (enUso) return

    await supabase.storage.from(BUCKET_FOTOS).remove([nombre])
  } catch {
    // Silencio a propósito: la limpieza nunca debe tumbar la respuesta al socio.
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, email, fanDesde, urlFoto } = body
  const whatsapp = body.whatsapp ?? ''
  const jugadorFavorito = body.jugadorFavorito ?? ''

  if (!nombre || !email || !fanDesde || !urlFoto) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // El año se valida aquí y no se deja que lo rechace el CHECK de la base: ese
  // camino devolvía un 500 genérico que el socio leía como "Error al guardar
  // tus datos", y encima fetchConReintento lo reintentaba tres veces, gastando
  // un folio por intento. Un 400 no se reintenta y dice qué corregir.
  if (!anoValido(fanDesde)) {
    return NextResponse.json({ error: mensajeAnoInvalido() }, { status: 400 })
  }

  // El candado antibot vive aquí y no en el widget: un bot no ejecuta el widget,
  // llama esta ruta directo. Se comprueba antes de tocar la base para que un
  // registro automatizado no consuma folio ni escriba nada.
  const turnstile = await verificarTurnstile(body.turnstileToken, ipDelVisitante(req.headers))
  if (!turnstile.ok) {
    return NextResponse.json(
      { error: 'No pudimos verificar que eres una persona. Recarga la página e inténtalo de nuevo.' },
      { status: 403 }
    )
  }

  const supabase = getSupabaseAdmin()

  // El correo se guarda siempre en minúsculas. UNIQUE(email) en Postgres
  // distingue mayúsculas, así que sin esto "Fan@correo.com" y "fan@correo.com"
  // entraban como dos socios distintos y el candado de duplicados no servía.
  const correo = email.trim().toLowerCase()

  let fanId = ''
  let inserted: { member_number: number } | null = null
  let error: unknown = null

  for (let intento = 0; intento < MAX_INTENTOS; intento++) {
    fanId = nuevoFanId()

    const resultado = await supabase
      .from('fans')
      .insert({
        fan_id: fanId,
        nombre,
        email: correo,
        whatsapp: whatsapp || null,
        fan_desde: fanDesde,
        jugador_favorito: jugadorFavorito || null,
        foto_url: urlFoto,
        ano_registro: new Date().getFullYear(),
      })
      .select('member_number')
      .single()

    inserted = resultado.data as { member_number: number } | null
    error = resultado.error

    // Solo se reintenta el choque de fan_id, que es el que sí se arregla
    // generando otro. Cualquier otro error se maneja abajo tal cual.
    if (!choqueDe(error, 'fans_fan_id_key')) break
  }

  if (error) {
    // 23505 = unique_violation. El único caso que le pasa seguido a un fan es
    // volver a registrarse con el mismo correo: no es un error que deba resolver,
    // es que ya tiene su membresía y lo que necesita es el camino a su tarjeta.
    if (choqueDe(error, 'fans_email_key')) {
      // Comparación exacta, no ilike: los correos ya se guardan normalizados, y
      // en ilike el guion bajo es comodín de un carácter — "fer_rojo@x.com"
      // habría hecho match con la membresía de otra persona.
      const { data: existente } = await supabase
        .from('fans')
        .select('fan_id')
        .eq('email', correo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // El socio ya tenía membresía, así que la foto que acaba de subir no la
      // va a usar nadie. Es el camino por el que más huérfanas se acumulan.
      await borrarFotoHuerfana(supabase, urlFoto)

      return NextResponse.json(
        { error: 'ya-registrado', fanId: existente?.fan_id ?? null },
        { status: 409 }
      )
    }

    await borrarFotoHuerfana(supabase, urlFoto)

    return NextResponse.json({ error: (error as ErrorPostgres).message }, { status: 500 })
  }

  return NextResponse.json({ fanId, memberNumber: inserted!.member_number })
}
