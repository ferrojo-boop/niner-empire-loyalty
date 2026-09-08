import { inicioDelDiaCDMX } from '../diaCDMX'

// Las pruebas usan instantes UTC explícitos, así que dan igual en cualquier
// máquina. CDMX es UTC-6 fijo desde que México dejó el horario de verano.
const utc = (iso: string) => new Date(iso)

// Formatea el instante como fecha de CDMX, para leer los asertos sin cuentas.
const diaCDMX = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)

describe('inicioDelDiaCDMX', () => {
  it('devuelve la medianoche de CDMX, que en UTC son las 06:00', () => {
    // 2026-09-07 14:00 CDMX = 2026-09-07 20:00 UTC
    const inicio = inicioDelDiaCDMX(utc('2026-09-07T20:00:00Z'))
    expect(inicio.toISOString()).toBe('2026-09-07T06:00:00.000Z')
  })

  // El bug que se está arreglando: las 18:00 CDMX son medianoche UTC, así que
  // con la lógica anterior el domingo se partía justo entre el juego de la
  // tarde y el Sunday Night.
  it('mantiene el mismo día antes y después de las 18:00 CDMX', () => {
    const tarde = inicioDelDiaCDMX(utc('2026-09-07T23:00:00Z')) // 17:00 CDMX
    const noche = inicioDelDiaCDMX(utc('2026-09-08T01:00:00Z')) // 19:00 CDMX

    expect(noche.getTime()).toBe(tarde.getTime())
    expect(diaCDMX(tarde)).toBe('2026-09-07')
  })

  // El otro lado del mismo bug: sábado por la noche y domingo por la mañana
  // caían en el mismo "día UTC" y la segunda asistencia quedaba bloqueada.
  it('separa la noche del sábado de la mañana del domingo', () => {
    const sabadoNoche = inicioDelDiaCDMX(utc('2026-09-06T01:00:00Z')) // sáb 19:00 CDMX
    const domingoManana = inicioDelDiaCDMX(utc('2026-09-06T17:00:00Z')) // dom 11:00 CDMX

    expect(sabadoNoche.getTime()).not.toBe(domingoManana.getTime())
    expect(diaCDMX(sabadoNoche)).toBe('2026-09-05')
    expect(diaCDMX(domingoManana)).toBe('2026-09-06')
  })

  it('corta en la medianoche real de CDMX', () => {
    const antes = inicioDelDiaCDMX(utc('2026-09-08T05:59:00Z')) // 23:59 CDMX del 7
    const despues = inicioDelDiaCDMX(utc('2026-09-08T06:01:00Z')) // 00:01 CDMX del 8

    expect(diaCDMX(antes)).toBe('2026-09-07')
    expect(diaCDMX(despues)).toBe('2026-09-08')
    expect(despues.getTime() - antes.getTime()).toBe(24 * 60 * 60 * 1000)
  })

  it('el inicio del día nunca queda en el futuro', () => {
    for (const iso of [
      '2026-09-07T06:00:00Z',
      '2026-09-07T05:59:59Z',
      '2026-01-15T12:00:00Z',
      '2026-07-04T23:30:00Z',
    ]) {
      const ahora = utc(iso)
      expect(inicioDelDiaCDMX(ahora).getTime()).toBeLessThanOrEqual(ahora.getTime())
    }
  })
})
