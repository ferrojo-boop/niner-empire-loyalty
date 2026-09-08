import { extractCardIdentifier } from '../supabaseBrowser'

const NUEVO = 'NEL-1788729281989-a3f1c2d0'
const VIEJO = 'NEL-1786592406325'

describe('extractCardIdentifier', () => {
  describe('QR escaneado (el camino normal en la puerta)', () => {
    it('acepta la URL con el formato actual', () => {
      expect(extractCardIdentifier(`https://niner-empire-loyalty.vercel.app/checkin/${NUEVO}`)).toBe(NUEVO)
    })

    it('acepta la URL con el formato viejo', () => {
      expect(extractCardIdentifier(`https://niner-empire-loyalty.vercel.app/checkin/${VIEJO}`)).toBe(VIEJO)
    })
  })

  describe('fan_id tecleado a mano', () => {
    // Esto se rompió al agregarle el sufijo aleatorio al fan_id: el patrón
    // anterior solo aceptaba dígitos después de NEL-.
    it('acepta el formato actual, con sufijo', () => {
      expect(extractCardIdentifier(NUEVO)).toBe(NUEVO)
    })

    it('sigue aceptando el formato viejo', () => {
      expect(extractCardIdentifier(VIEJO)).toBe(VIEJO)
    })

    // El sufijo se guarda en minúsculas: mayusculizarlo haría que no se
    // encuentre al socio, que es peor que rechazar la entrada.
    it('devuelve el sufijo en minúsculas aunque se teclee en mayúsculas', () => {
      expect(extractCardIdentifier('nel-1788729281989-A3F1C2D0')).toBe(NUEVO)
    })

    it('normaliza el prefijo a mayúsculas', () => {
      expect(extractCardIdentifier('nel-1786592406325')).toBe(VIEJO)
    })
  })

  describe('folio impreso en la tarjeta', () => {
    it.each([
      ['NE-MX-009', '9'],
      ['NE - MX - 009', '9'],
      ['009', '9'],
      ['9', '9'],
    ])('acepta %s', (entrada, esperado) => {
      expect(extractCardIdentifier(entrada)).toBe(esperado)
    })
  })

  describe('entradas que no son una tarjeta', () => {
    it.each(['', '   ', 'hola', 'https://otro-sitio.com/x', 'NEL-', 'NEL-abc'])(
      'rechaza %p',
      (entrada) => {
        expect(extractCardIdentifier(entrada)).toBeNull()
      }
    )
  })
})
