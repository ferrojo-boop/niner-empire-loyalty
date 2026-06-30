import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(_req: NextRequest, { params }: { params: { fanId: string } }) {
  const supabase = getSupabaseAdmin()

  const { data: fan, error: fanError } = await supabase
    .from('fans')
    .select('id, nombre, member_number')
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
      totalVisits: totalCount ?? 0,
    })
  }

  const { error: visitError } = await supabase
    .from('visits')
    .insert({ fan_id: fan.id })

  if (visitError) {
    return NextResponse.json({ error: visitError.message }, { status: 500 })
  }

  return NextResponse.json({
    alreadyCheckedIn: false,
    nombre: fan.nombre,
    memberNumber: fan.member_number,
    totalVisits: (totalCount ?? 0) + 1,
  })
}
