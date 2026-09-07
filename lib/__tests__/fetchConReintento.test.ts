import { fetchConReintento, ErrorDeRed } from '../fetchConReintento'

// Esperas en 0 para que las pruebas no tarden lo que tardaría un socio real.
const SIN_ESPERA = [0, 0]

// jsdom no define Response, y la función solo lee .status: basta un objeto.
const respuesta = (status: number) => ({ status }) as Response

describe('fetchConReintento', () => {
  afterEach(() => jest.restoreAllMocks())

  it('devuelve la respuesta sin reintentar cuando sale bien a la primera', async () => {
    const f = jest.fn().mockResolvedValue(respuesta(200))
    global.fetch = f as unknown as typeof fetch

    const res = await fetchConReintento('/x', undefined, SIN_ESPERA)

    expect(res.status).toBe(200)
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('reintenta cuando la red falla y devuelve el intento que sí llega', async () => {
    const f = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(respuesta(200))
    global.fetch = f as unknown as typeof fetch

    const res = await fetchConReintento('/x', undefined, SIN_ESPERA)

    expect(res.status).toBe(200)
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('reintenta un 500 del servidor', async () => {
    const f = jest.fn().mockResolvedValueOnce(respuesta(500)).mockResolvedValue(respuesta(200))
    global.fetch = f as unknown as typeof fetch

    const res = await fetchConReintento('/x', undefined, SIN_ESPERA)

    expect(res.status).toBe(200)
    expect(f).toHaveBeenCalledTimes(2)
  })

  // Un 409 es el correo ya registrado: repetirlo daría exactamente lo mismo y
  // solo retrasaría el aviso que el socio necesita ver.
  it('no reintenta un 4xx, que es una respuesta deliberada', async () => {
    const f = jest.fn().mockResolvedValue(respuesta(409))
    global.fetch = f as unknown as typeof fetch

    const res = await fetchConReintento('/x', undefined, SIN_ESPERA)

    expect(res.status).toBe(409)
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('lanza ErrorDeRed cuando nunca hubo respuesta', async () => {
    const f = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    global.fetch = f as unknown as typeof fetch

    await expect(fetchConReintento('/x', undefined, SIN_ESPERA)).rejects.toBeInstanceOf(ErrorDeRed)
    // El intento original más los dos reintentos.
    expect(f).toHaveBeenCalledTimes(3)
  })

  // Si el servidor insiste en 500 no es problema de señal: se devuelve la
  // respuesta para que quien llama la trate como error del servidor y no le
  // diga al socio que revise su conexión.
  it('devuelve el último 500 en vez de lanzar ErrorDeRed', async () => {
    const f = jest.fn().mockResolvedValue(respuesta(500))
    global.fetch = f as unknown as typeof fetch

    const res = await fetchConReintento('/x', undefined, SIN_ESPERA)

    expect(res.status).toBe(500)
    expect(f).toHaveBeenCalledTimes(3)
  })
})
