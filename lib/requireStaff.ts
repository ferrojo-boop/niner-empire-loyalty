import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from './supabase'

export interface StaffUser {
  userId: string
  nombre: string
}

/**
 * Verifica que quien llama sea staff activo del club.
 *
 * El candado vive aquí, en el servidor, y no en la interfaz: aunque alguien
 * llame al endpoint directo con curl o escanee el QR con su cámara, sin una
 * sesión válida de staff no se escribe nada.
 *
 * Devuelve null si no hay sesión, el token es inválido, o el usuario existe
 * en Supabase Auth pero no está dado de alta como staff activo.
 */
export async function requireStaff(req: NextRequest): Promise<StaffUser | null> {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) return null

  const supabase = getSupabaseAdmin()

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData?.user) return null

  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('user_id, nombre, activo')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (staffError || !staff || !staff.activo) return null

  return { userId: staff.user_id, nombre: staff.nombre }
}
