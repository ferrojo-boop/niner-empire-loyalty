/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
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
