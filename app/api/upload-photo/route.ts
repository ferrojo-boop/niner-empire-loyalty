import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const photo = formData.get('photo') as File
  const nombre = formData.get('nombre') as string

  if (!photo) {
    return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const timestamp = Date.now()
  const safeName = nombre.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const fileName = `${timestamp}-${safeName}.jpg`

  const arrayBuffer = await photo.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error } = await supabase.storage
    .from('fan-photos')
    .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('fan-photos').getPublicUrl(fileName)

  return NextResponse.json({ url: data.publicUrl })
}
