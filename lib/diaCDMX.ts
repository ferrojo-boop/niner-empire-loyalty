// El corte del día para "una asistencia por watch party" tiene que ser la
// medianoche de la Ciudad de México, no la del servidor.
//
// Vercel y Supabase corren en UTC, y la medianoche UTC son las 18:00 en CDMX.
// Calcular el día con la zona del servidor partía la jornada justo a la mitad
// del domingo de NFL: los juegos de la tarde caen antes de las 18:00 y el
// Sunday Night después, así que un socio que pasaba lista en ambos recibía dos
// asistencias. Y al revés, quien registraba un sábado por la noche quedaba
// bloqueado el domingo por la mañana, siendo dos watch parties distintos.

export const ZONA = 'America/Mexico_City'

/**
 * Diferencia en milisegundos entre la zona y UTC en ese instante.
 * Negativa para CDMX (UTC-6).
 */
function desfaseDeZona(instante: Date, zona: string): number {
  const formato = new Intl.DateTimeFormat('en-US', {
    timeZone: zona,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const p = Object.fromEntries(
    formato.formatToParts(instante).map((parte) => [parte.type, parte.value])
  ) as Record<string, string>

  const comoSiFueraUTC = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    // en-US con hour12:false devuelve 24 en vez de 0 para la medianoche
    Number(p.hour) % 24,
    Number(p.minute),
    Number(p.second)
  )

  return comoSiFueraUTC - instante.getTime()
}

/**
 * Instante UTC en que empezó el día actual en la Ciudad de México.
 *
 * Se calcula en dos pasos porque el desfase de la medianoche puede no ser el
 * mismo que el de ahora: México no cambia de horario desde 2022, así que hoy
 * la segunda pasada no corrige nada, pero deja la función correcta si algún
 * día vuelven a moverlo.
 */
export function inicioDelDiaCDMX(ahora: Date = new Date()): Date {
  const primerDesfase = desfaseDeZona(ahora, ZONA)

  const comoLocal = new Date(ahora.getTime() + primerDesfase)
  const medianocheLocal = Date.UTC(
    comoLocal.getUTCFullYear(),
    comoLocal.getUTCMonth(),
    comoLocal.getUTCDate()
  )

  const aproximado = new Date(medianocheLocal - primerDesfase)
  const desfaseReal = desfaseDeZona(aproximado, ZONA)

  return new Date(medianocheLocal - desfaseReal)
}
