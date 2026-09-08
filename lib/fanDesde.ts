// Rango válido de "Fan desde", en un solo lugar.
//
// 1946 es el año en que nacieron los 49ers, y es lo que exige el CHECK
// `fans_fan_desde_check` en la base. El formulario lo tenía como atributos
// min/max del <input>, que son validación nativa del navegador y **no aplican
// aquí**: el formulario avanza con un onClick, no con un submit. Así que un
// año fuera de rango pasaba derecho hasta el INSERT, que lo rechazaba con un
// error genérico y el socio solo veía "Error al guardar tus datos".

export const PRIMER_ANO = 1946

export function ultimoAno(): number {
  return new Date().getFullYear()
}

export function anoValido(valor: unknown): boolean {
  const n = typeof valor === 'string' ? Number(valor) : valor
  return (
    typeof n === 'number' &&
    Number.isInteger(n) &&
    n >= PRIMER_ANO &&
    n <= ultimoAno()
  )
}

export function mensajeAnoInvalido(): string {
  return `Escribe el año en que te hiciste fan, entre ${PRIMER_ANO} y ${ultimoAno()}.`
}
