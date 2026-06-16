import html2canvas from 'html2canvas'

export async function generateAndDownloadCard(nombre: string): Promise<void> {
  const element = document.getElementById('fan-card')
  if (!element) throw new Error('fan-card element not found')

  const canvas = await html2canvas(element, {
    width: 1012,
    height: 638,
    scale: 1,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
  })

  const link = document.createElement('a')
  const safeName = nombre.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  link.download = `niner-empire-${safeName}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
