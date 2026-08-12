import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { requireStaff } from '@/lib/requireStaff'

export async function POST(req: NextRequest, { params }: { params: { fanId: string } }) {
  // Solo el staff del club registra visitas. Cualquier otra cámara que lea el
  // QR llega hasta aquí y se va sin escribir nada.
  const staff = await requireStaff(req)
  if (!staff) {
    return NextResponse.json(
      { error: 'Solo el staff del club puede registrar visitas' },
      { status: 401 }
    )
  }

  const supabase = getSupabaseAdmin()

  const { data: fan, error: fanError } = await supabase
    .from('fans')
    .select('id, nombre, member_number, foto_url')
    .eq('fan_id', params.fanId)
    .single()

  if (fanError || !fan) {
    return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
  }

  // Verificar si ya hay visita hoy
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: todayCount } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('fan_id', fan.id)
    .gte('checked_in_at', today.toISOString())

  const { count: totalCount } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('fan_id', fan.id)

  if ((todayCount ?? 0) > 0) {
    return NextResponse.json({
      alreadyCheckedIn: true,
      nombre: fan.nombre,
      memberNumber: fan.member_number,
      fotoUrl: fan.foto_url,
      totalVisits: totalCount ?? 0,
      registradoPor: staff.nombre,
    })
  }

  const { error: visitError } = await supabase
    .from('visits')
    .insert({ fan_id: fan.id, checked_in_by: staff.userId })

  if (visitError) {
    return NextResponse.json({ error: visitError.message }, { status: 500 })
  }

  return NextResponse.json({
    alreadyCheckedIn: false,
    nombre: fan.nombre,
    memberNumber: fan.member_number,
    fotoUrl: fan.foto_url,
    totalVisits: (totalCount ?? 0) + 1,
    registradoPor: staff.nombre,
  })
}
