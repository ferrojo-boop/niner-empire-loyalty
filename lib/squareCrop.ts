// Recorta una foto a un cuadrado centrado y la devuelve como data URL.
//
// Por qué existe esto: la tarjeta se rasteriza con html2canvas, que NO soporta
// `object-fit: cover`. En pantalla el CSS recorta bien la foto, pero en el PNG
// descargado html2canvas la estira para llenar el círculo, deformando caras en
// fotos verticales. Si la imagen ya llega cuadrada, no hay nada que estirar.
//
// Además, al pasar por <img> el navegador ya aplicó la orientación EXIF, así que
// las fotos tomadas con celular no salen giradas.
export async function toSquareDataUrl(src: string, size: number): Promise<string> {
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo preparar la foto')

  // Recorte centrado tipo "cover": se toma el cuadrado más grande que cabe en
  // la foto y se escala al tamaño pedido, conservando la proporción original.
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - side) / 2
  const sy = (img.naturalHeight - side) / 2

  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)

  return canvas.toDataURL('image/jpeg', 0.95)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la foto'))
    img.src = src
  })
}
