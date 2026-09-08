import { REGLAS, LARGO_MINIMO, passwordValida, reglasFallidas, motivoDeSupabase } from '../politicaPassword'

describe('política de contraseña del staff', () => {
  it('acepta una contraseña que cumple todo', () => {
    expect(passwordValida('NinerEmpire2026!')).toBe(true)
  })

  // El mínimo anterior eran 8 caracteres sin exigir variedad: "password" pasaba.
  it('rechaza las que pasaban con la regla anterior', () => {
    for (const debil of ['password', 'niner123', '12345678', 'Niner123']) {
      expect(passwordValida(debil)).toBe(false)
    }
  })

  it.each([
    ['corta', 'Abc1!', 'largo'],
    ['sin minúscula', 'NINEREMPIRE2026!', 'minuscula'],
    ['sin mayúscula', 'ninerempire2026!', 'mayuscula'],
    ['sin número', 'NinerEmpireMex!', 'digito'],
    ['sin símbolo', 'NinerEmpire2026', 'simbolo'],
  ])('señala exactamente qué falta en una %s', (_caso, valor, reglaEsperada) => {
    const fallidas = reglasFallidas(valor).map((r) => r.id)
    expect(fallidas).toContain(reglaEsperada)
    expect(passwordValida(valor)).toBe(false)
  })

  it('el mínimo es de al menos 12, como recomienda Supabase', () => {
    expect(LARGO_MINIMO).toBeGreaterThanOrEqual(12)
  })

  it('cada regla trae un texto para mostrar', () => {
    for (const r of REGLAS) {
      expect(typeof r.texto).toBe('string')
      expect(r.texto.length).toBeGreaterThan(0)
    }
  })

  describe('motivos que devuelve Supabase', () => {
    it('traduce la contraseña filtrada', () => {
      expect(motivoDeSupabase(['pwned'])).toMatch(/filtraciones/i)
    })
    it('traduce el largo y la variedad', () => {
      expect(motivoDeSupabase(['length'])).toMatch(/caracteres/i)
      expect(motivoDeSupabase(['characters'])).toMatch(/mayúsculas|símbolo/i)
    })
    it('devuelve null cuando no hay motivo', () => {
      expect(motivoDeSupabase(undefined)).toBeNull()
      expect(motivoDeSupabase([])).toBeNull()
    })
  })
})
