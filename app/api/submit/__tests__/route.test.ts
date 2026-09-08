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

// Guarda lo que la ruta mandó a insertar, el correo con el que buscó, y todos
// los fan_id que intentó: eso último es lo que permite afirmar que al reintentar
// genera uno distinto en vez de repetir el que ya chocó.
const espia: {
  insertado?: Record<string, unknown>
  buscado?: string
  idsIntentados: string[]
  fotosBorradas: string[]
} = { idsIntentados: [], fotosBorradas: [] }

// `alta` acepta un arreglo para simular intentos sucesivos: el primer elemento
// responde al primer insert, el segundo al segundo, y el último se repite si la
// ruta insiste. Así se puede probar el reintento por choque de fan_id.
//
// `fotoEnUso` responde a la consulta por foto_url que hace la limpieza antes de
// borrar: con data distinta de null, la foto pertenece a alguien y no se toca.
function clienteFalso(
  alta: Resultado | Resultado[],
  busqueda: Resultado = { data: null, error: null },
  fotoEnUso: Resultado = { data: null, error: null }
) {
  const cola = Array.isArray(alta) ? [...alta] : [alta]
  return {
    from: () => ({
      insert: (fila: Record<string, unknown>) => {
        espia.insertado = fila
        espia.idsIntentados.push(String(fila.fan_id))
        const respuesta = cola.length > 1 ? cola.shift()! : cola[0]
        return { select: () => ({ single: async () => respuesta }) }
      },
      select: () => ({
        // La ruta consulta por 'email' (buscar la membresía existente) y por
        // 'foto_url' (comprobar si la foto está en uso antes de borrarla).
        eq: (columna: string, valor: string) => {
          const resultado = columna === 'foto_url' ? fotoEnUso : busqueda
          if (columna !== 'foto_url') espia.buscado = valor
          const maybeSingle = async () => resultado
          return {
            order: () => ({ limit: () => ({ maybeSingle }) }),
            limit: () => ({ maybeSingle }),
          }
        },
      }),
    }),
    storage: {
      from: () => ({
        remove: async (nombres: string[]) => {
          espia.fotosBorradas.push(...nombres)
          return { data: null, error: null }
        },
      }),
    },
  }
}

beforeEach(() => {
  delete espia.insertado
  delete espia.buscado
  espia.idsIntentados = []
  espia.fotosBorradas = []
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
          message: 'duplicate key value violates unique constraint "fans_member_number_key"',
        },
      })
    )

    const res = await POST(peticion(fanValido))
    expect(res.status).toBe(500)
    // Un choque que no es de fan_id no se reintenta: generar otro id no lo
    // arreglaría, así que se responde de una vez.
    expect(espia.idsIntentados).toHaveLength(1)
  })

  // El fan_id se generaba con `NEL-${Date.now()}` y la tabla tiene UNIQUE(fan_id):
  // dos altas en el mismo milisegundo chocaban y la segunda moría con un 500,
  // dejando además la foto huérfana en Storage. Con el QR proyectado y todos
  // registrándose a la vez, eso pasaba con frecuencia.
  const choqueDeFanId = {
    data: null,
    error: {
      code: '23505',
      message: 'duplicate key value violates unique constraint "fans_fan_id_key"',
    },
  }

  it('el fan_id lleva sufijo aleatorio, no solo el timestamp', async () => {
    mockClient.mockReturnValue(clienteFalso({ data: { member_number: 9 }, error: null }))

    const res = await POST(peticion(fanValido))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.fanId).toMatch(/^NEL-\d+-[0-9a-f]{8}$/)
  })

  it('dos altas seguidas nunca reciben el mismo fan_id', async () => {
    mockClient.mockReturnValue(clienteFalso({ data: { member_number: 1 }, error: null }))

    const a = await (await POST(peticion(fanValido))).json()
    const b = await (await POST(peticion(fanValido))).json()

    expect(a.fanId).not.toBe(b.fanId)
  })

  it('reintenta con otro fan_id cuando el primero ya existe', async () => {
    mockClient.mockReturnValue(
      clienteFalso([choqueDeFanId, { data: { member_number: 55 }, error: null }])
    )

    const res = await POST(peticion(fanValido))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.memberNumber).toBe(55)
    expect(espia.idsIntentados).toHaveLength(2)
    // Lo importante: el reintento usa un id nuevo, no repite el que ya chocó.
    expect(espia.idsIntentados[0]).not.toBe(espia.idsIntentados[1])
    expect(json.fanId).toBe(espia.idsIntentados[1])
  })

  it('se rinde con 500 si el fan_id sigue chocando', async () => {
    mockClient.mockReturnValue(clienteFalso(choqueDeFanId))

    const res = await POST(peticion(fanValido))

    expect(res.status).toBe(500)
    // Reintenta un número acotado de veces en vez de quedarse en ciclo.
    expect(espia.idsIntentados).toHaveLength(3)
    expect(new Set(espia.idsIntentados).size).toBe(3)
  })

  // El widget del navegador no protege nada: un bot llama esta ruta directo.
  // Lo que protege es que el servidor exija un token que solo Cloudflare emite.
  describe('candado antibot', () => {
    const original = process.env.TURNSTILE_SECRET_KEY
    afterEach(() => {
      // Asignar undefined guardaría la cadena "undefined", que es truthy y
      // dejaría la protección encendida para las pruebas siguientes.
      if (original === undefined) delete process.env.TURNSTILE_SECRET_KEY
      else process.env.TURNSTILE_SECRET_KEY = original
      jest.restoreAllMocks()
    })

    it('rechaza con 403 el registro sin token cuando la protección está activa', async () => {
      process.env.TURNSTILE_SECRET_KEY = 'secreto'
      mockClient.mockReturnValue(clienteFalso({ data: { member_number: 1 }, error: null }))

      const res = await POST(peticion(fanValido)) // sin turnstileToken

      expect(res.status).toBe(403)
      // Lo importante: no llegó a tocar la base ni a consumir folio.
      expect(espia.idsIntentados).toHaveLength(0)
    })

    it('rechaza con 403 el token que Cloudflare reprueba', async () => {
      process.env.TURNSTILE_SECRET_KEY = 'secreto'
      global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ success: false }) }) as unknown as typeof fetch
      mockClient.mockReturnValue(clienteFalso({ data: { member_number: 1 }, error: null }))

      const res = await POST(peticion({ ...fanValido, turnstileToken: 'inventado' }))

      expect(res.status).toBe(403)
      expect(espia.idsIntentados).toHaveLength(0)
    })

    it('deja pasar el token que Cloudflare aprueba', async () => {
      process.env.TURNSTILE_SECRET_KEY = 'secreto'
      global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ success: true }) }) as unknown as typeof fetch
      mockClient.mockReturnValue(clienteFalso({ data: { member_number: 77 }, error: null }))

      const res = await POST(peticion({ ...fanValido, turnstileToken: 'bueno' }))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.memberNumber).toBe(77)
    })

    // Sin la variable configurada no se bloquea nada: así el despliegue puede ir
    // antes que el secreto sin dejar el registro caído.
    it('no bloquea si la protección no está configurada', async () => {
      delete process.env.TURNSTILE_SECRET_KEY
      mockClient.mockReturnValue(clienteFalso({ data: { member_number: 5 }, error: null }))

      const res = await POST(peticion(fanValido))

      expect(res.status).toBe(200)
    })
  })

  // El formulario sube la foto y luego guarda los datos. Si lo segundo no
  // prospera, la foto queda en Storage sin que ningún socio la referencie: no
  // hay forma de saber a quién era, así que ocupa espacio para siempre.
  describe('limpieza de la foto cuando el alta no prospera', () => {
    const fotoSubida = 'https://x.supabase.co/storage/v1/object/public/fan-photos/1788-luis.jpg'
    const conFoto = { ...fanValido, urlFoto: fotoSubida }

    const choqueDeCorreo = {
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint "fans_email_key"',
      },
    }

    it('borra la foto cuando el correo ya estaba registrado', async () => {
      mockClient.mockReturnValue(
        clienteFalso(choqueDeCorreo, { data: { fan_id: 'NEL-1' }, error: null })
      )

      const res = await POST(peticion(conFoto))

      expect(res.status).toBe(409)
      expect(espia.fotosBorradas).toEqual(['1788-luis.jpg'])
    })

    it('borra la foto cuando el alta falla de verdad', async () => {
      mockClient.mockReturnValue(
        clienteFalso({ data: null, error: { code: '08006', message: 'connection failure' } })
      )

      const res = await POST(peticion(conFoto))

      expect(res.status).toBe(500)
      expect(espia.fotosBorradas).toEqual(['1788-luis.jpg'])
    })

    it('no borra nada cuando el alta sí prospera', async () => {
      mockClient.mockReturnValue(clienteFalso({ data: { member_number: 3 }, error: null }))

      const res = await POST(peticion(conFoto))

      expect(res.status).toBe(200)
      expect(espia.fotosBorradas).toEqual([])
    })

    // urlFoto llega del cliente. Sin esta guarda, una petición armada a mano con
    // la foto de otro socio la borraría y su tarjeta ya no se podría rearmar.
    it('no borra una foto que otro socio está usando', async () => {
      mockClient.mockReturnValue(
        clienteFalso(
          choqueDeCorreo,
          { data: { fan_id: 'NEL-1' }, error: null },
          { data: { fan_id: 'NEL-victima' }, error: null }
        )
      )

      const res = await POST(peticion(conFoto))

      expect(res.status).toBe(409)
      expect(espia.fotosBorradas).toEqual([])
    })

    it('ignora una url que no apunta al bucket de fotos', async () => {
      mockClient.mockReturnValue(
        clienteFalso(choqueDeCorreo, { data: { fan_id: 'NEL-1' }, error: null })
      )

      const res = await POST(peticion({ ...fanValido, urlFoto: 'https://otro-sitio.com/x.jpg' }))

      expect(res.status).toBe(409)
      expect(espia.fotosBorradas).toEqual([])
    })
  })
})
