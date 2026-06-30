import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { fanId: string } }) {
  const supabase = getSupabaseAdmin()

  const { data: fan, error } = await supabase
    .from('fans')
    .select('fan_id, nombre, foto_url, member_number')
    .eq('fan_id', params.fanId)
    .single()

  if (error || !fan) {
    return NextResponse.json({ error: 'Fan no encontrado' }, { status: 404 })
  }

  return NextResponse.json(fan)
}
