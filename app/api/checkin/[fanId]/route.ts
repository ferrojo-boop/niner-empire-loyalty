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

  // El staff puede identificar al socio de dos formas:
  //   - Escaneando el QR, que trae el fan_id largo (NEL-1786491329461)
  //   - Tecleando el folio impreso en la tarjeta (NE - MX - 009), que es lo
  //     único legible a simple vista en la puerta
  // Se aceptan ambas, más el número pelón (9 ó 009).
  const identificador = decodeURIComponent(params.fanId).trim()
  const comoFolio = identificador.match(/^(?:ne\s*[-–—]?\s*mx\s*[-–—]?\s*)?0*(\d{1,9})$/i)

  const consulta = supabase.from('fans').select('id, nombre, member_number, foto_url')
  const { data: fan, error: fanError } = comoFolio
    ? await consulta.eq('member_number', Number(comoFolio[1])).maybeSingle()
    : await consulta.eq('fan_id', identificador).maybeSingle()

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
