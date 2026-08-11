import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Guarda el PNG de la tarjeta ya generada para que el fan pueda recuperarla
// después con su correo, sin depender de que su navegador la vuelva a armar.
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const card = formData.get('card') as File | null
  const fanId = formData.get('fanId') as string | null

  if (!card || !fanId) {
    return NextResponse.json({ error: 'Missing card or fanId' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const fileName = `${fanId}.png`

  const arrayBuffer = await card.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: 'image/png' })

  // upsert: si el fan vuelve a abrir su tarjeta, se reemplaza la versión guardada.
  const { error: uploadError } = await supabase.storage
    .from('fan-cards')
    .upload(fileName, blob, { contentType: 'image/png', upsert: true })

  if (uploadError) {
    console.error('Card upload error:', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('fan-cards').getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('fans')
    .update({ tarjeta_url: data.publicUrl })
    .eq('fan_id', fanId)

  if (updateError) {
    console.error('Card URL save error:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ url: data.publicUrl })
}
