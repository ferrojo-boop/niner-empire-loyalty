import type { getSupabaseAdmin } from './supabase'

export const BUCKET_FOTOS = 'fan-photos'

/** Nombre del objeto dentro del bucket, o null si la URL no es de ahí. */
export function nombreDeObjeto(url: unknown): string | null {
  if (typeof url !== 'string') return null
  const marca = `/${BUCKET_FOTOS}/`
  const corte = url.indexOf(marca)
  if (corte === -1) return null
  const nombre = decodeURIComponent(url.slice(corte + marca.length))
  if (!nombre || nombre.includes('/')) return null
  return nombre
}

/**
 * ¿Esta foto la acaba de subir quien está registrándose?
 *
 * Es lo que ata las dos llamadas del registro con un solo token de Turnstile.
 * El token se gasta en /api/upload-photo, que es la llamada que cuesta
 * almacenamiento; /api/submit no puede volver a validarlo —los tokens son de
 * un solo uso— pero sí puede exigir que la foto venga de una subida real:
 *
 *   - inventar una URL no sirve: el objeto tiene que existir en el bucket
 *   - reusar la foto de otro socio no sirve: ya está referenciada en `fans`
 *   - subir una propia obliga a pasar por Turnstile
 *
 * Con eso, crear una membresía automatizada exige resolver el reto igual que
 * antes, y de paso queda cerrado el hueco de llenar el bucket sin registrarse.
 */
export async function fotoRecienSubida(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  url: unknown
): Promise<boolean> {
  const nombre = nombreDeObjeto(url)
  if (!nombre) return false

  // El esquema `storage` no se expone por PostgREST, así que la existencia se
  // comprueba con la API de Storage. `search` hace coincidencia parcial, por eso
  // se compara el nombre exacto sobre lo que devuelve.
  const { data: encontrados, error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .list('', { search: nombre, limit: 100 })

  if (error || !encontrados?.some((o) => o.name === nombre)) return false

  const { data: yaUsada } = await supabase
    .from('fans')
    .select('fan_id')
    .eq('foto_url', url)
    .limit(1)
    .maybeSingle()

  return !yaUsada
}
