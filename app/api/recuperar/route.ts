import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Ingresa un correo electrónico válido' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // El correo se guarda normalizado a minúsculas al registrar, así que aquí se
  // normaliza igual y se compara exacto. Antes esto usaba ilike, que además de
  // ser innecesario trataba el guion bajo como comodín: quien tuviera un correo
  // tipo "fer_rojo@x.com" podía recibir la tarjeta de otra persona.
  const { data: fan, error } = await supabase
    .from('fans')
    .select('fan_id, nombre, tarjeta_url')
    .eq('email', email.trim().toLowerCase())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'No pudimos buscar tu tarjeta. Intenta de nuevo.' }, { status: 500 })
  }

  if (!fan) {
    return NextResponse.json(
      { error: 'No encontramos una membresía con ese correo. Revisa que esté bien escrito.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    fanId: fan.fan_id,
    nombre: fan.nombre,
    tarjetaUrl: fan.tarjeta_url,
  })
}
