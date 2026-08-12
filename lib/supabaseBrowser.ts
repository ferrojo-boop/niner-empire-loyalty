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
 * Saca el fanId de lo que traiga el QR. La tarjeta codifica una URL completa
 * (https://dominio/checkin/NEL-123), pero se acepta también el id pelón por si
 * el staff lo teclea a mano.
 */
export function extractFanId(scanned: string): string | null {
  const value = scanned.trim()
  if (!value) return null

  const fromUrl = value.match(/\/checkin\/([^/?#\s]+)/i)
  if (fromUrl) return decodeURIComponent(fromUrl[1])

  // Un fanId suelto, tal cual se genera al registrarse.
  if (/^NEL-\d+$/i.test(value)) return value.toUpperCase()

  return null
}
