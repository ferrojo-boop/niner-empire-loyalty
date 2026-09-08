import { verificarTurnstile, ipDelVisitante } from '../turnstile'

const conRespuesta = (success: boolean) =>
  jest.fn().mockResolvedValue({ json: async () => ({ success }) })

describe('verificarTurnstile', () => {
  const original = process.env.TURNSTILE_SECRET_KEY
  afterEach(() => {
    // Asignar undefined guardaría la cadena "undefined", que es truthy.
    if (original === undefined) delete process.env.TURNSTILE_SECRET_KEY
    else process.env.TURNSTILE_SECRET_KEY = original
    jest.restoreAllMocks()
  })

  // Permite desplegar antes de configurar la variable sin tumbar el registro.
  it('deja pasar si no hay secreto configurado', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    const f = jest.fn()
    global.fetch = f as unknown as typeof fetch

    const r = await verificarTurnstile('lo-que-sea')

    expect(r).toEqual({ ok: true, motivo: 'sin-configurar' })
    expect(f).not.toHaveBeenCalled() // ni siquiera llama a Cloudflare
  })

  it('rechaza cuando falta el token', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secreto'
    for (const vacio of [undefined, null, '', '   ', 123]) {
      const r = await verificarTurnstile(vacio)
      expect(r).toEqual({ ok: false, motivo: 'sin-token' })
    }
  })

  it('acepta el token que Cloudflare aprueba', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secreto'
    global.fetch = conRespuesta(true) as unknown as typeof fetch

    const r = await verificarTurnstile('token-bueno')

    expect(r).toEqual({ ok: true, motivo: 'valido' })
  })

  it('rechaza el token que Cloudflare reprueba', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secreto'
    global.fetch = conRespuesta(false) as unknown as typeof fetch

    const r = await verificarTurnstile('token-falso')

    expect(r).toEqual({ ok: false, motivo: 'rechazado' })
  })

  it('manda el secreto y el token a Cloudflare, con la IP', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secreto'
    const f = conRespuesta(true)
    global.fetch = f as unknown as typeof fetch

    await verificarTurnstile('token-bueno', '189.1.2.3')

    const [url, init] = f.mock.calls[0]
    expect(url).toContain('challenges.cloudflare.com')
    const enviado = (init as { body: URLSearchParams }).body
    expect(enviado.get('secret')).toBe('secreto')
    expect(enviado.get('response')).toBe('token-bueno')
    expect(enviado.get('remoteip')).toBe('189.1.2.3')
  })

  // Decisión deliberada: el momento de más registros es la puerta de un watch
  // party. Dejar a cien personas fuera porque Cloudflare tuvo un mal rato es
  // peor que la ventana de exposición, que se limpia borrando registros falsos.
  it('deja pasar si Cloudflare no responde', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secreto'
    global.fetch = jest.fn().mockRejectedValue(new Error('red caída')) as unknown as typeof fetch
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const r = await verificarTurnstile('token-bueno')

    expect(r).toEqual({ ok: true, motivo: 'cloudflare-inalcanzable' })
  })

  // Pero un token presente e inválido se rechaza siempre, haya o no incidente.
  it('nunca deja pasar un token inválido', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secreto'
    global.fetch = conRespuesta(false) as unknown as typeof fetch

    expect((await verificarTurnstile('falso')).ok).toBe(false)
  })
})

describe('ipDelVisitante', () => {
  it('toma la primera IP de x-forwarded-for', () => {
    const h = new Headers({ 'x-forwarded-for': '189.1.2.3, 10.0.0.1, 172.16.0.1' })
    expect(ipDelVisitante(h)).toBe('189.1.2.3')
  })

  it('devuelve null si no viene la cabecera', () => {
    expect(ipDelVisitante(new Headers())).toBeNull()
  })
})
