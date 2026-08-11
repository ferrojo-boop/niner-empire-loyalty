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
