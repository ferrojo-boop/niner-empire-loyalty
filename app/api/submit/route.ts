import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, email, fanDesde, urlFoto } = body
  const whatsapp = body.whatsapp ?? ''

  if (!nombre || !email || !fanDesde || !urlFoto) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const fanId = `NEL-${Date.now()}`
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from('fans').insert({
    fan_id: fanId,
    nombre,
    email,
    whatsapp: whatsapp || null,
    fan_desde: fanDesde,
    foto_url: urlFoto,
    ano_registro: new Date().getFullYear(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ fanId })
}
