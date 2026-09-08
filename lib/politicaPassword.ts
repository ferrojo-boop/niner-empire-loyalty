// Reglas de contraseña para las cuentas de staff.
//
// Estas cuentas son las que registran asistencias, así que su contraseña es la
// credencial más sensible del proyecto: la del socio no existe, y la del panel
// de Supabase la controla el administrador.
//
// Las reglas se comprueban aquí Y en Supabase Auth. Esta copia existe para dar
// una razón concreta mientras la persona escribe, en vez de un rechazo seco al
// enviar; la de Supabase es la que manda.
//
// ⚠️ Si se cambia el mínimo aquí, hay que cambiarlo también en el panel de
// Supabase (Authentication → Sign In / Providers → Email). Si esta copia queda
// más floja que la del servidor, la persona verá todo en verde y aun así será
// rechazada, sin saber por qué.

export const LARGO_MINIMO = 12

export interface ReglaPassword {
  id: string
  texto: string
  cumple: (v: string) => boolean
}

export const REGLAS: ReglaPassword[] = [
  {
    id: 'largo',
    texto: `Al menos ${LARGO_MINIMO} caracteres`,
    cumple: (v) => v.length >= LARGO_MINIMO,
  },
  { id: 'minuscula', texto: 'Una letra minúscula', cumple: (v) => /[a-z]/.test(v) },
  { id: 'mayuscula', texto: 'Una letra mayúscula', cumple: (v) => /[A-Z]/.test(v) },
  { id: 'digito', texto: 'Un número', cumple: (v) => /\d/.test(v) },
  {
    id: 'simbolo',
    texto: 'Un símbolo (!@#$%…)',
    // Mismo conjunto de símbolos que acepta Supabase Auth.
    cumple: (v) => /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/.test(v),
  },
]

export function reglasFallidas(valor: string): ReglaPassword[] {
  return REGLAS.filter((r) => !r.cumple(valor))
}

export function passwordValida(valor: string): boolean {
  return reglasFallidas(valor).length === 0
}

/** Traduce el motivo que devuelve Supabase a algo que el staff entienda. */
export function motivoDeSupabase(reasons: readonly string[] | undefined): string | null {
  if (!reasons?.length) return null
  if (reasons.includes('pwned')) {
    return 'Esa contraseña aparece en filtraciones públicas conocidas. Elige otra.'
  }
  if (reasons.includes('length')) return `La contraseña necesita al menos ${LARGO_MINIMO} caracteres.`
  if (reasons.includes('characters')) {
    return 'Falta variedad: combina mayúsculas, minúsculas, números y un símbolo.'
  }
  return null
}
