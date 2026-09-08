// Verificación de Cloudflare Turnstile en el servidor.
//
// El widget del navegador no protege nada por sí solo: un bot no ejecuta el
// widget, llama la API directo. Lo que protege es esto —el servidor exigiendo
// un token que solo Cloudflare puede emitir— así que si algún día hay que
// elegir qué conservar, es esta parte y no el widget.

const URL_VERIFICACION = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type ResultadoTurnstile =
  | { ok: true; motivo: 'valido' | 'sin-configurar' | 'cloudflare-inalcanzable' }
  | { ok: false; motivo: 'sin-token' | 'rechazado' }

/**
 * Comprueba el token contra Cloudflare.
 *
 * Dos casos se dejan pasar a propósito, y conviene entender por qué:
 *
 * 1. `sin-configurar`: si no hay TURNSTILE_SECRET_KEY, no se bloquea nada. Así
 *    el despliegue puede ir antes que la variable sin tumbar el registro. La
 *    protección se enciende sola en cuanto la variable existe.
 *
 * 2. `cloudflare-inalcanzable`: si la petición a Cloudflare falla, se deja
 *    pasar. Es una decisión deliberada para este proyecto: el momento de más
 *    registros es la puerta de un watch party, y dejar a cien personas sin
 *    poder registrarse porque Cloudflare tuvo un mal rato es peor que la
 *    ventana de exposición, que además es recuperable borrando los registros
 *    falsos. Un token presente pero inválido sí se rechaza siempre.
 */
export async function verificarTurnstile(
  token: unknown,
  ip?: string | null
): Promise<ResultadoTurnstile> {
  const secreto = process.env.TURNSTILE_SECRET_KEY
  if (!secreto) return { ok: true, motivo: 'sin-configurar' }

  if (typeof token !== 'string' || token.trim() === '') {
    return { ok: false, motivo: 'sin-token' }
  }

  const cuerpo = new URLSearchParams({ secret: secreto, response: token })
  if (ip) cuerpo.set('remoteip', ip)

  try {
    const res = await fetch(URL_VERIFICACION, { method: 'POST', body: cuerpo })
    const datos = (await res.json()) as { success?: boolean }
    return datos.success === true
      ? { ok: true, motivo: 'valido' }
      : { ok: false, motivo: 'rechazado' }
  } catch {
    console.error('Turnstile inalcanzable; se deja pasar el registro')
    return { ok: true, motivo: 'cloudflare-inalcanzable' }
  }
}

/** IP del visitante detrás del proxy de Vercel. */
export function ipDelVisitante(headers: Headers): string | null {
  const reenviada = headers.get('x-forwarded-for')
  return reenviada ? reenviada.split(',')[0].trim() : null
}
