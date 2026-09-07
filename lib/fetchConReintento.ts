// En datos móviles la conexión no es lenta, es intermitente: se cae, cambia de
// antena y se recupera sola en un par de segundos. El registro son dos llamadas
// seguidas —subir la foto y guardar los datos— y sin reintento cualquier
// tropiezo mata el alta completa: el socio ve un error, pierde el registro y su
// foto queda huérfana. Con la antena saturada por la multitud de un watch
// party, ese tropiezo no es hipotético.

/** Falla de red, no del servidor: se cortó la conexión o expiró el intento. */
export class ErrorDeRed extends Error {
  constructor(mensaje = 'Se interrumpió la conexión') {
    super(mensaje)
    this.name = 'ErrorDeRed'
  }
}

// Dos reintentos con espera creciente. Suficiente para cubrir un cambio de
// antena sin dejar al socio mirando una pantalla congelada: en el peor caso
// añade 2.4 s antes de rendirse.
const ESPERAS_MS = [600, 1800]

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * `fetch` que reintenta lo que puede salir bien en el siguiente intento.
 *
 * Reintenta cuando la red falla (fetch lanza) y cuando el servidor responde
 * 5xx. **No** reintenta un 4xx: esos son respuestas deliberadas —correo ya
 * registrado, campos faltantes— y repetirlas daría exactamente lo mismo.
 *
 * Si se agotan los intentos devuelve la última respuesta 5xx que haya llegado,
 * para que quien llama la trate como error del servidor. Solo lanza `ErrorDeRed`
 * cuando nunca hubo respuesta, que es el caso que sí conviene contarle al socio
 * como "revisa tu señal".
 */
export async function fetchConReintento(
  url: string,
  init?: RequestInit,
  esperas: number[] = ESPERAS_MS
): Promise<Response> {
  let ultimaRespuesta: Response | null = null

  for (let intento = 0; intento <= esperas.length; intento++) {
    try {
      const res = await fetch(url, init)
      if (res.status < 500) return res
      ultimaRespuesta = res
    } catch {
      ultimaRespuesta = null
    }

    if (intento < esperas.length) await dormir(esperas[intento])
  }

  if (ultimaRespuesta) return ultimaRespuesta
  throw new ErrorDeRed()
}
