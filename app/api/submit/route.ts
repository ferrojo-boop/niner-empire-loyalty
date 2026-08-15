import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, email, fanDesde, urlFoto } = body
  const whatsapp = body.whatsapp ?? ''
  const jugadorFavorito = body.jugadorFavorito ?? ''

  if (!nombre || !email || !fanDesde || !urlFoto) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const fanId = `NEL-${Date.now()}`
  const supabase = getSupabaseAdmin()

  // El correo se guarda siempre en minúsculas. UNIQUE(email) en Postgres
  // distingue mayúsculas, así que sin esto "Fan@correo.com" y "fan@correo.com"
  // entraban como dos socios distintos y el candado de duplicados no servía.
  const correo = email.trim().toLowerCase()

  const { data: inserted, error } = await supabase
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

  if (error) {
    // 23505 = unique_violation. El único caso que le pasa seguido a un fan es
    // volver a registrarse con el mismo correo: no es un error que deba resolver,
    // es que ya tiene su membresía y lo que necesita es el camino a su tarjeta.
    if (error.code === '23505' && error.message.includes('fans_email_key')) {
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

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ fanId, memberNumber: inserted.member_number })
}
