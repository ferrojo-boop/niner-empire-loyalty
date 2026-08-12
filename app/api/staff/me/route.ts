import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/requireStaff'

// Le dice a la app de staff si la sesión actual tiene permiso, para mostrar el
// escáner o mandar a iniciar sesión. El permiso real igual se revalida en cada
// registro de visita, así que esto es solo para la interfaz.
export async function GET(req: NextRequest) {
  const staff = await requireStaff(req)

  if (!staff) {
    return NextResponse.json({ isStaff: false }, { status: 401 })
  }

  return NextResponse.json({ isStaff: true, nombre: staff.nombre })
}
