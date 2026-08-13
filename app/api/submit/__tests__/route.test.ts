/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

// insert() no se espera directo: la ruta encadena .select('member_number')
// .single() para recuperar el folio que asigna la base, así que el doble tiene
// que devolver el builder completo y no una promesa.
jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { member_number: 42 },
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

describe('POST /api/submit', () => {
  it('returns 200 and a fan ID on success', async () => {
    const body = {
      nombre: 'Fernando Rojo',
      email: 'fer@example.com',
      whatsapp: '+521234567890',
      fanDesde: 1995,
      urlFoto: 'https://example.com/photo.jpg',
    }

    const req = new NextRequest('http://localhost/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.fanId).toBeDefined()
    expect(typeof json.fanId).toBe('string')
    expect(json.memberNumber).toBe(42)
  })

  it('returns 400 when required fields are missing', async () => {
    const req = new NextRequest('http://localhost/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Test' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
