import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

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

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, email, fanDesde, urlFoto } = body
  const whatsapp = body.whatsapp ?? ''
  const jugadorFavorito = body.jugadorFavorito ?? ''

  if (!nombre || !email || !fanDesde || !urlFoto) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

      return NextResponse.json(
        { error: 'ya-registrado', fanId: existente?.fan_id ?? null },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: (error as ErrorPostgres).message }, { status: 500 })
  }

  return NextResponse.json({ fanId, memberNumber: inserted!.member_number })
}
