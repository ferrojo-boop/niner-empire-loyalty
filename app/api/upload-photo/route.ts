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
  const safeName = (nombre ?? 'fan').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const ext = photo.type === 'image/png' ? 'png' : 'jpg'
  const fileName = `${timestamp}-${safeName}.${ext}`

  const arrayBuffer = await photo.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: photo.type || 'image/jpeg' })

  // cacheControl de un año, no el default de una hora: la foto es lo único que
  // /tarjeta descarga del bucket, y el socio abre su tarjeta muchas veces a lo
  // largo de la temporada. El nombre lleva timestamp y nunca se sobrescribe
  // (upsert: false), así que la URL es inmutable y cachearla no puede servir
  // una versión vieja. Cada vista repetida sale del caché y no gasta egress.
  const { error } = await supabase.storage
    .from('fan-photos')
    .upload(fileName, blob, {
      contentType: blob.type,
      upsert: false,
      cacheControl: '31536000',
    })

  if (error) {
    console.error('Storage upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('fan-photos').getPublicUrl(fileName)

  return NextResponse.json({ url: data.publicUrl })
}
