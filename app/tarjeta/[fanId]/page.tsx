'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FanCard } from '@/components/FanCard'
import QRCode from 'qrcode'

const CARD_W = 863
const CARD_H = 1217

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
          { width: 209, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } }
        )
        setQrDataUrl(qr)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fanId])

  async function getCanvas() {
    const { default: html2canvas } = await import('html2canvas')
    const el = document.getElementById('fan-card')
    if (!el) throw new Error('No se encontró la tarjeta')
    return html2canvas(el, { useCORS: true, scale: 1, backgroundColor: null })
  }

  async function handleDownload() {
    setSaving(true)
    try {
      const canvas = await getCanvas()
      const a = document.createElement('a')
      a.download = `niner-empire-${fan?.nombre ?? 'tarjeta'}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveToPhotos() {
    setSaving(true)
    try {
      const canvas = await getCanvas()
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      )
      const file = new File([blob], 'tarjeta-niner-empire.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Mi Tarjeta Niner Empire México' })
      } else {
        // Fallback para desktop
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.download = 'tarjeta-niner-empire.png'
        a.href = url
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#1A1A1A]">
        <p className="text-[#B3995D] text-xl font-bold animate-pulse">Generando tu tarjeta...</p>
      </main>
    )
  }

  if (error || !fan) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#1A1A1A]">
        <p className="text-red-400 text-xl font-bold">{error || 'Error inesperado'}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#1A1A1A] py-8 px-4">
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
            nombre={fan.nombre}
            fanId={fan.fan_id}
            memberNumber={fan.member_number}
            photoUrl={fan.foto_url}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleSaveToPhotos}
          disabled={saving}
          className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider
            bg-[#B3995D] text-black border-2 border-[#B3995D]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-[#D4B878] transition-colors"
        >
          {saving ? 'Guardando...' : '📸 Guardar en Fotos'}
        </button>
        <button
          onClick={handleDownload}
          disabled={saving}
          className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider
            bg-transparent text-[#B3995D] border-2 border-[#B3995D]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-[#B3995D] hover:text-black transition-colors"
        >
          {saving ? 'Guardando...' : '⬇️ Descargar'}
        </button>
      </div>

      <p className="mt-6 text-gray-500 text-sm text-center">
        Muestra el QR en cada visita al club para acumular puntos
      </p>
    </main>
  )
}
