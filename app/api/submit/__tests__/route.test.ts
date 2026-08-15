/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

// El cliente se arma por prueba porque cada caso necesita que la base responda
// distinto (alta exitosa, correo repetido, error de verdad). El doble tiene que
// devolver el builder completo y no una promesa: la ruta encadena
// .insert().select('member_number').single(), y en el camino del correo repetido
// vuelve a consultar con .select().eq().order().limit().maybeSingle().
const mockClient = jest.fn()
jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => mockClient(),
}))

type Resultado = { data: unknown; error: unknown }

// Guarda lo que la ruta mandó a insertar y el correo con el que buscó, para
// poder afirmar que ambos van normalizados a minúsculas.
const espia: { insertado?: Record<string, unknown>; buscado?: string } = {}

function clienteFalso(alta: Resultado, busqueda: Resultado = { data: null, error: null }) {
  return {
    from: () => ({
      insert: (fila: Record<string, unknown>) => {
        espia.insertado = fila
        return { select: () => ({ single: async () => alta }) }
      },
      select: () => ({
        eq: (_col: string, valor: string) => {
          espia.buscado = valor
          return {
            order: () => ({
              limit: () => ({ maybeSingle: async () => busqueda }),
            }),
          }
        },
      }),
    }),
  }
}

beforeEach(() => {
  delete espia.insertado
  delete espia.buscado
})

function peticion(body: unknown) {
  return new NextRequest('http://localhost/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const fanValido = {
  nombre: 'Fernando Rojo',
  email: 'fer@example.com',
  whatsapp: '+521234567890',
  fanDesde: 1995,
  urlFoto: 'https://example.com/photo.jpg',
}

describe('POST /api/submit', () => {
  it('returns 200 and a fan ID on success', async () => {
    mockClient.mockReturnValue(clienteFalso({ data: { member_number: 42 }, error: null }))

    const res = await POST(peticion(fanValido))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.fanId).toBeDefined()
    expect(typeof json.fanId).toBe('string')
    expect(json.memberNumber).toBe(42)
  })

  it('returns 400 when required fields are missing', async () => {
    mockClient.mockReturnValue(clienteFalso({ data: { member_number: 1 }, error: null }))

    const res = await POST(peticion({ nombre: 'Test' }))
    expect(res.status).toBe(400)
  })

  it('normaliza el correo a minúsculas antes de guardarlo', async () => {
    mockClient.mockReturnValue(clienteFalso({ data: { member_number: 7 }, error: null }))

    const res = await POST(peticion({ ...fanValido, email: '  Fer.Rojo@Example.COM ' }))

    expect(res.status).toBe(200)
    expect(espia.insertado?.email).toBe('fer.rojo@example.com')
  })

  it('busca la membresía existente con el correo normalizado', async () => {
    mockClient.mockReturnValue(
      clienteFalso(
        {
          data: null,
          error: {
            code: '23505',
            message: 'duplicate key value violates unique constraint "fans_email_key"',
          },
        },
        { data: { fan_id: 'NEL-1' }, error: null }
      )
    )

    await POST(peticion({ ...fanValido, email: 'Fer.Rojo@Example.COM' }))

    expect(espia.buscado).toBe('fer.rojo@example.com')
  })

  it('returns 409 with the existing card when the email is already registered', async () => {
    mockClient.mockReturnValue(
      clienteFalso(
        {
          data: null,
          error: {
            code: '23505',
            message:
              'duplicate key value violates unique constraint "fans_email_key"',
          },
        },
        { data: { fan_id: 'NEL-1786491329461' }, error: null }
      )
    )

    const res = await POST(peticion(fanValido))
    const json = await res.json()

    expect(res.status).toBe(409)
    expect(json.error).toBe('ya-registrado')
    expect(json.fanId).toBe('NEL-1786491329461')
  })

  it('still returns 409 when the existing card cannot be found', async () => {
    mockClient.mockReturnValue(
      clienteFalso(
        {
          data: null,
          error: {
            code: '23505',
            message:
              'duplicate key value violates unique constraint "fans_email_key"',
          },
        },
        { data: null, error: null }
      )
    )

    const res = await POST(peticion(fanValido))
    const json = await res.json()

    expect(res.status).toBe(409)
    expect(json.fanId).toBeNull()
  })

  it('returns 500 on a unique violation that is not the email', async () => {
    mockClient.mockReturnValue(
      clienteFalso({
        data: null,
        error: {
          code: '23505',
          message: 'duplicate key value violates unique constraint "fans_fan_id_key"',
        },
      })
    )

    const res = await POST(peticion(fanValido))
    expect(res.status).toBe(500)
  })
})
