'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FanCard } from '@/components/FanCard'
import { DownloadIcon, ShareIcon, SpinnerIcon, WarningIcon } from '@/components/icons'
import { toSquareDataUrl } from '@/lib/squareCrop'
import QRCode from 'qrcode'

const CARD_W = 889
const CARD_H = 1921
// La tarjeta se captura al doble para que el PNG salga a la resolución nativa
// del arte original (1778x3842). Foto y QR se preparan a ese mismo tamaño para
// que no se reescalen hacia arriba al rasterizar.
const CAPTURE_SCALE = 2
const PHOTO_PX = 450 * CAPTURE_SCALE
const QR_PX = 409 * CAPTURE_SCALE

interface FanData {
  fan_id: string
  nombre: string
  foto_url: string
  member_number: number
}

export default function TarjetaPage() {
  const { fanId } = useParams<{ fanId: string }>()
  const [fan, setFan] = useState<FanData | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [scale, setScale] = useState(0.4)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [cardBlob, setCardBlob] = useState<Blob | null>(null)
  const [photoSquareUrl, setPhotoSquareUrl] = useState('')

  useEffect(() => {
    setScale(Math.min(1, (window.innerWidth - 32) / CARD_W))

    async function load() {
      try {
        const res = await fetch(`/api/fan/${fanId}`)
        if (!res.ok) throw new Error('No se encontró el miembro')
        const data: FanData = await res.json()
        setFan(data)

        const qr = await QRCode.toDataURL(
          `${window.location.origin}/checkin/${fanId}`,
          { width: QR_PX, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } }
        )
        setQrDataUrl(qr)

        // Se deja la foto ya cuadrada antes de pintarla en la tarjeta; si falla,
        // se usa la original y el CSS la recorta al menos en pantalla.
        try {
          setPhotoSquareUrl(await toSquareDataUrl(data.foto_url, PHOTO_PX))
        } catch {
          setPhotoSquareUrl(data.foto_url)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fanId])

  // Se genera la imagen de la tarjeta en cuanto está lista, en vez de esperar
  // al clic del usuario: navigator.share() en iOS Safari solo funciona si se
  // llama casi de inmediato tras el gesto del usuario, y renderizar con
  // html2canvas en ese momento tarda demasiado y "expira" ese permiso.
  useEffect(() => {
    if (!fan || !qrDataUrl || !photoSquareUrl) return
    let cancelled = false
    const timer = setTimeout(() => {
      getCardBlob()
        .then((blob) => {
          if (cancelled) return
          setCardBlob(blob)
          // Se archiva en Supabase para que el fan pueda recuperarla luego con
          // su correo. Es best-effort: si falla, la tarjeta igual funciona aquí.
          const form = new FormData()
          form.append('card', blob, `${fanId}.png`)
          form.append('fanId', String(fanId))
          fetch('/api/save-card', { method: 'POST', body: form }).catch(() => {})
        })
        .catch(() => {
          // si falla, se reintentará al hacer clic en los botones
        })
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [fan, qrDataUrl, photoSquareUrl, fanId])

  async function waitForImages(el: HTMLElement) {
    const imgs = Array.from(el.querySelectorAll('img'))
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true })
              img.addEventListener('error', () => resolve(), { once: true })
            })
      )
    )
  }

  async function getCardBlob() {
    const { default: html2canvas } = await import('html2canvas')
    // Se captura la copia oculta a tamaño real (no la vista previa, que está
    // reducida con CSS transform: scale() para caber en pantalla — capturarla
    // directamente producía una imagen deformada/borrosa en móvil).
    const el = document.getElementById('fan-card-capture')
    if (!el) throw new Error('No se encontró la tarjeta')
    await waitForImages(el)
    const canvas = await html2canvas(el, { useCORS: true, scale: CAPTURE_SCALE, backgroundColor: null })
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('No se pudo generar la imagen de la tarjeta')
    return blob
  }

  // En móvil (sobre todo iOS Safari) el atributo download de un <a> no siempre
  // guarda el archivo, así que se intenta primero con el share sheet nativo.
  // Si el share falla (p. ej. se perdió la activación del gesto), se cae de
  // inmediato a la descarga directa dentro del mismo clic.
  async function shareOrDownload(filename: string, shareTitle: string) {
    setSaving(true)
    setSaveError('')
    try {
      const blob = cardBlob ?? (await getCardBlob())
      const file = new File([blob], filename, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: shareTitle })
          return
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === 'AbortError') return // usuario canceló el share sheet
          // el share falló (p. ej. activación de usuario expirada): sigue con descarga directa
        }
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.download = filename
      a.href = url
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch {
      setSaveError('No se pudo guardar la tarjeta. Intenta de nuevo o toma una captura de pantalla.')
    } finally {
      setSaving(false)
    }
  }

  function handleDownload() {
    return shareOrDownload(`niner-empire-${fan?.nombre ?? 'tarjeta'}.png`, 'Mi Tarjeta Niner Empire México')
  }

  function handleSaveToPhotos() {
    return shareOrDownload('tarjeta-niner-empire.png', 'Mi Tarjeta Niner Empire México')
  }

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#1A1A1A]" aria-live="polite">
        <p className="flex items-center gap-2 text-[#B3995D] text-xl font-bold motion-safe:animate-pulse">
          <SpinnerIcon size={22} />
          Generando tu tarjeta...
        </p>
      </main>
    )
  }

  if (error || !fan) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-[#1A1A1A] px-6" role="alert">
        <WarningIcon size={40} className="text-red-400" />
        <p className="text-red-400 text-xl font-bold text-center">{error || 'Error inesperado'}</p>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col items-center bg-[#1A1A1A] py-8 px-4">
      <h1 className="text-[#B3995D] text-2xl font-black tracking-widest mb-6 text-center uppercase">
        ¡Ya eres miembro!
      </h1>

      {/* Tarjeta escalada para pantalla */}
      <div
        style={{
          width: `${CARD_W * scale}px`,
          height: `${CARD_H * scale}px`,
          overflow: 'hidden',
          flexShrink: 0,
          marginBottom: '32px',
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: `${CARD_W}px`, height: `${CARD_H}px` }}>
          <FanCard
            id="fan-card-preview"
            nombre={fan.nombre}
            fanId={fan.fan_id}
            memberNumber={fan.member_number}
            photoUrl={photoSquareUrl}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </div>

      {/* Copia oculta a tamaño real, usada solo para generar la imagen a descargar/compartir */}
      <div style={{ position: 'fixed', top: 0, left: '-99999px' }} aria-hidden="true">
        <FanCard
          id="fan-card-capture"
          nombre={fan.nombre}
          fanId={fan.fan_id}
          memberNumber={fan.member_number}
          photoUrl={photoSquareUrl}
          qrDataUrl={qrDataUrl}
        />
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleSaveToPhotos}
          disabled={saving}
          className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider
            flex items-center justify-center gap-2 cursor-pointer
            bg-[#B3995D] text-black border-2 border-[#B3995D]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-[#D4B878] transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
        >
          {saving ? <SpinnerIcon size={20} /> : <ShareIcon size={20} />}
          {saving ? 'Guardando...' : 'Guardar en Fotos'}
        </button>
        <button
          onClick={handleDownload}
          disabled={saving}
          className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider
            flex items-center justify-center gap-2 cursor-pointer
            bg-transparent text-[#B3995D] border-2 border-[#B3995D]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-[#B3995D] hover:text-black transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3995D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
        >
          {saving ? <SpinnerIcon size={20} /> : <DownloadIcon size={20} />}
          {saving ? 'Guardando...' : 'Descargar'}
        </button>
      </div>

      {saveError && (
        <p role="alert" className="mt-4 flex items-center gap-2 text-red-400 text-sm font-bold text-center max-w-xs">
          <WarningIcon size={18} className="shrink-0" />
          {saveError}
        </p>
      )}

      <p className="mt-6 text-gray-400 text-sm text-center">
        Muestra el QR en cada visita al club para acumular puntos
      </p>
    </main>
  )
}
