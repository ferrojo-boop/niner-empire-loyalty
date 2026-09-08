import { anoValido, PRIMER_ANO, ultimoAno } from '../fanDesde'

describe('anoValido', () => {
  it('acepta años dentro del rango que exige la base', () => {
    for (const a of [PRIMER_ANO, 1995, 2010, ultimoAno()]) {
      expect(anoValido(a)).toBe(true)
    }
  })

  // El caso real que rompió un registro en producción: un año de 3 dígitos,
  // que pasaba el "no está vacío" del formulario y moría en el CHECK de la base
  // con un 500 genérico.
  it('rechaza años fuera de rango', () => {
    for (const a of [195, 0, 1945, ultimoAno() + 1, 3000, -1995]) {
      expect(anoValido(a)).toBe(false)
    }
  })

  it('rechaza lo que no es un año entero', () => {
    for (const a of ['', '  ', 'mil', null, undefined, 1995.5, NaN, {}]) {
      expect(anoValido(a)).toBe(false)
    }
  })

  it('acepta el año escrito como texto, que es como llega del input', () => {
    expect(anoValido('1995')).toBe(true)
    expect(anoValido('195')).toBe(false)
  })
})
