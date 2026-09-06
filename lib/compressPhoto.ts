// Reduce la foto del fan antes de subirla a Storage.
//
// Por qué existe: el <input type="file"> entrega el archivo tal como salió de la
// cámara — entre 3 y 5 MB en cualquier celular moderno. A ese ritmo el bucket se
// llena en poco más de cien registros, y en el 4G saturado de un watch party la
// subida tarda tanto que la gente abandona el formulario.
//
// La tarjeta solo necesita un cuadro de 900 px (PHOTO_PX en /tarjeta), así que
// basta con dejar el lado corto en 1080 —margen suficiente para ese recorte— y
// recomprimir a JPEG. Una foto de 4 MB baja a ~450 KB sin diferencia visible.
// (Medido el 2026-09-05 sobre las fotos ya guardadas en el bucket: 400 y 511 KB.)
//
// Al pasar la imagen por <img> el navegador ya aplicó la orientación EXIF, así
// que las fotos verticales no se suben giradas.

const SHORT_SIDE = 1080
const LONG_SIDE_MAX = 1920
const QUALITY = 0.85

/**
 * Devuelve una versión ligera de la foto.
 *
 * Nunca lanza: si el navegador no puede decodificar el archivo o el canvas
 * falla, devuelve el original. Vale más un registro pesado que un registro
 * perdido en la puerta del evento.
 */
export async function compressPhoto(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const img = await loadImage(objectUrl)
    const { width, height } = targetSize(img.naturalWidth, img.naturalHeight)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await canvasToBlob(canvas)

    // Si el resultado no es más chico (fotos ya pequeñas, o PNG que al pasar a
    // JPEG no ganan nada), se queda el original.
    if (!blob || blob.size >= file.size) return file

    return new File([blob], toJpgName(file.name), { type: 'image/jpeg' })
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * Escala para que el lado corto quede en SHORT_SIDE, sin pasarse de
 * LONG_SIDE_MAX en el lado largo. Las fotos que ya son más chicas no se
 * agrandan: estirarlas solo sumaría peso sin sumar detalle.
 */
function targetSize(w: number, h: number): { width: number; height: number } {
  const short = Math.min(w, h)
  const long = Math.max(w, h)

  let scale = Math.min(1, SHORT_SIDE / short)
  if (long * scale > LONG_SIDE_MAX) scale = LONG_SIDE_MAX / long

  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', QUALITY)
  })
}

function toJpgName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'foto'
  return `${base}.jpg`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo leer la foto'))
    img.src = src
  })
}
