/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

// La ruta sube con la llave de servicio, así que el doble tiene que ser
// getSupabaseAdmin: si se mockea otro nombre, el import queda undefined.
jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn().mockReturnValue({
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/fan-photos/test.jpg' },
        }),
      }),
    },
  }),
}))

function peticion(campos: Record<string, string> = {}) {
  const formData = new FormData()
  formData.append('photo', new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' }))
  formData.append('nombre', 'Fernando')
  for (const [k, v] of Object.entries(campos)) formData.append(k, v)
  return new NextRequest('http://localhost/api/upload-photo', { method: 'POST', body: formData })
}

describe('POST /api/upload-photo', () => {
  it('returns a public URL on success', async () => {
    const res = await POST(peticion())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.url).toBe('https://example.com/fan-photos/test.jpg')
  })

  // El candado antibot está aquí y no en /api/submit porque esta es la llamada
  // que cuesta almacenamiento: sin él un bot podía llenar el bucket sin llegar
  // siquiera a crear socios.
  describe('candado antibot', () => {
    const original = process.env.TURNSTILE_SECRET_KEY
    afterEach(() => {
      // Asignar undefined guardaría la cadena "undefined", que es truthy.
      if (original === undefined) delete process.env.TURNSTILE_SECRET_KEY
      else process.env.TURNSTILE_SECRET_KEY = original
      jest.restoreAllMocks()
    })

    it('rechaza con 403 la subida sin token', async () => {
      process.env.TURNSTILE_SECRET_KEY = 'secreto'

      const res = await POST(peticion())

      expect(res.status).toBe(403)
    })

    it('rechaza con 403 el token que Cloudflare reprueba', async () => {
      process.env.TURNSTILE_SECRET_KEY = 'secreto'
      global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ success: false }) }) as unknown as typeof fetch

      const res = await POST(peticion({ turnstileToken: 'inventado' }))

      expect(res.status).toBe(403)
    })

    it('deja subir con el token que Cloudflare aprueba', async () => {
      process.env.TURNSTILE_SECRET_KEY = 'secreto'
      global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ success: true }) }) as unknown as typeof fetch

      const res = await POST(peticion({ turnstileToken: 'bueno' }))

      expect(res.status).toBe(200)
    })

    it('no bloquea si la protección no está configurada', async () => {
      delete process.env.TURNSTILE_SECRET_KEY

      const res = await POST(peticion())

      expect(res.status).toBe(200)
    })
  })
})
