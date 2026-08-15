/**
 * @jest-environment jsdom
 */
import { compressPhoto } from '../compressPhoto'

// jsdom no trae canvas real, así que se sustituyen las tres piezas que usa
// compressPhoto: la carga de <img>, el contexto 2D y toBlob.
function prepararEntorno({
  ancho,
  alto,
  blob,
  fallaCanvas = false,
  fallaCarga = false,
}: {
  ancho: number
  alto: number
  blob: Blob | null
  fallaCanvas?: boolean
  fallaCarga?: boolean
}) {
  Object.defineProperty(global.Image.prototype, 'src', {
    configurable: true,
    set() {
      Object.defineProperty(this, 'naturalWidth', { value: ancho, configurable: true })
      Object.defineProperty(this, 'naturalHeight', { value: alto, configurable: true })
      setTimeout(() => (fallaCarga ? this.onerror?.(new Event('error')) : this.onload?.(new Event('load'))), 0)
    },
  })

  const dibujado = { width: 0, height: 0 }

  jest
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(function (this: HTMLCanvasElement) {
      if (fallaCanvas) return null
      dibujado.width = this.width
      dibujado.height = this.height
      return { imageSmoothingQuality: '', drawImage: jest.fn() } as unknown as CanvasRenderingContext2D
    } as typeof HTMLCanvasElement.prototype.getContext)

  jest
    .spyOn(HTMLCanvasElement.prototype, 'toBlob')
    .mockImplementation((cb: BlobCallback) => cb(blob))

  return dibujado
}

function archivo(bytes: number, name = 'IMG_0001.HEIC', type = 'image/heic') {
  return new File([new Uint8Array(bytes)], name, { type })
}

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:foto')
  global.URL.revokeObjectURL = jest.fn()
})

afterEach(() => jest.restoreAllMocks())

describe('compressPhoto', () => {
  it('deja el lado corto en 1080 y entrega un JPEG más ligero', async () => {
    const dibujado = prepararEntorno({
      ancho: 3024,
      alto: 4032,
      blob: new Blob([new Uint8Array(250_000)], { type: 'image/jpeg' }),
    })

    const salida = await compressPhoto(archivo(4_000_000))

    expect(dibujado).toEqual({ width: 1080, height: 1440 })
    expect(salida.type).toBe('image/jpeg')
    expect(salida.name).toBe('IMG_0001.jpg')
    expect(salida.size).toBeLessThan(4_000_000)
  })

  it('no deja que una foto panorámica se pase de 1920 en el lado largo', async () => {
    const dibujado = prepararEntorno({
      ancho: 6000,
      alto: 2000,
      blob: new Blob([new Uint8Array(100_000)], { type: 'image/jpeg' }),
    })

    await compressPhoto(archivo(5_000_000))

    expect(dibujado).toEqual({ width: 1920, height: 640 })
  })

  it('no agranda una foto que ya es chica', async () => {
    const dibujado = prepararEntorno({
      ancho: 400,
      alto: 600,
      blob: new Blob([new Uint8Array(10_000)], { type: 'image/jpeg' }),
    })

    await compressPhoto(archivo(50_000))

    expect(dibujado).toEqual({ width: 400, height: 600 })
  })

  it('conserva el original si comprimir no lo hace más chico', async () => {
    prepararEntorno({
      ancho: 800,
      alto: 800,
      blob: new Blob([new Uint8Array(90_000)], { type: 'image/jpeg' }),
    })

    const original = archivo(80_000, 'chica.jpg', 'image/jpeg')
    expect(await compressPhoto(original)).toBe(original)
  })

  // El registro en la puerta del evento importa más que ahorrar megas: si algo
  // del canvas falla, se sube la foto tal cual en vez de romper el alta.
  it('devuelve el original si el canvas no está disponible', async () => {
    prepararEntorno({ ancho: 3024, alto: 4032, blob: null, fallaCanvas: true })

    const original = archivo(4_000_000)
    expect(await compressPhoto(original)).toBe(original)
  })

  it('devuelve el original si la foto no se puede decodificar', async () => {
    prepararEntorno({ ancho: 0, alto: 0, blob: null, fallaCarga: true })

    const original = archivo(4_000_000)
    expect(await compressPhoto(original)).toBe(original)
  })
})
