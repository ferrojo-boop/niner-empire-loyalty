'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Cliente de Supabase para el navegador, con la llave pública (anon).
 * Solo se usa para el login del staff: guarda la sesión y renueva el token.
 * Nunca toca la service_role, que vive únicamente en el servidor.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  _client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
  return _client
}

/**
 * Convierte lo que el staff escaneó o tecleó en un identificador que el
 * endpoint de check-in entiende. Acepta tres formas:
 *
 *   - La URL completa del QR:  https://dominio/checkin/NEL-1786491329461
 *   - El folio impreso en la tarjeta:  NE - MX - 009  (o solo 009)
 *   - El fan_id suelto:  NEL-1786491329461
 *
 * El folio es el importante para capturar a mano: es el único número que el
 * staff puede leer de un vistazo en la tarjeta del socio.
 */
export function extractCardIdentifier(scanned: string): string | null {
  const value = scanned.trim()
  if (!value) return null

  const fromUrl = value.match(/\/checkin\/([^/?#\s]+)/i)
  if (fromUrl) return decodeURIComponent(fromUrl[1])

  if (/^NEL-\d+$/i.test(value)) return value.toUpperCase()

  // Folio de la tarjeta, con o sin el prefijo y con o sin ceros a la izquierda.
  const folio = value.match(/^(?:ne\s*[-–—]?\s*mx\s*[-–—]?\s*)?0*(\d{1,9})$/i)
  if (folio) return folio[1]

  return null
}
