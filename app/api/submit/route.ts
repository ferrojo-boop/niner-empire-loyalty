import { NextRequest, NextResponse } from 'next/server'
import { appendFanRow } from '@/lib/sheets'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, email, fanDesde, urlFoto } = body
  const whatsapp = body.whatsapp ?? ''

  if (!nombre || !email || !fanDesde || !urlFoto) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const fanId = `NEL-${Date.now()}`
  const fechaHora = new Date().toISOString()

  await appendFanRow({ id: fanId, nombre, email, whatsapp, fanDesde, urlFoto, fechaHora })

  return NextResponse.json({ fanId })
}
