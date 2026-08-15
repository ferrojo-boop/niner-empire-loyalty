export interface FanFormData {
  nombre: string
  email: string
  whatsapp: string
  fanDesde: number | ''
  jugadorFavorito: string
  photoFile: File | null
  photoPreviewUrl: string | null
}

export type FormStep = 1 | 2 | 3 | 4

/**
 * Error que se le muestra al fan al final del registro. Cuando el correo ya
 * tenía membresía, `fanId` trae la tarjeta existente para poder ofrecerle el
 * enlace en vez de dejarlo atorado en un mensaje sin salida.
 */
export interface SubmitError {
  mensaje: string
  fanId?: string
}
