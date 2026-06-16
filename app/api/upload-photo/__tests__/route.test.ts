/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn().mockReturnValue({
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

describe('POST /api/upload-photo', () => {
  it('returns a public URL on success', async () => {
    const file = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('nombre', 'Fernando')

    const req = new NextRequest('http://localhost/api/upload-photo', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.url).toBe('https://example.com/fan-photos/test.jpg')
  })
})
