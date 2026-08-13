'use client'

import { useRef } from 'react'
import { FanFormData } from '@/lib/types'
import { CameraIcon, GalleryIcon } from './icons'

interface StepCameraProps {
  data: FanFormData
  onChange: (partial: Partial<FanFormData>) => void
  onNext: () => void
}

export function StepCamera({ data, onChange, onNext }: StepCameraProps) {
  // Dos inputs distintos: el de cámara lleva capture="user", que en celular abre
  // la cámara frontal directo; el de galería lo omite a propósito, que es lo que
  // hace que el sistema muestre el carrete en vez de la cámara.
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Si el input se resetea sin elegir nada, conservamos la foto que ya había.
    if (!file) return
    if (data.photoPreviewUrl) URL.revokeObjectURL(data.photoPreviewUrl)
    onChange({ photoFile: file, photoPreviewUrl: URL.createObjectURL(file) })
    // Sin esto, volver a elegir el mismo archivo no dispara change y parece que
    // el botón no hizo nada.
    e.target.value = ''
  }

  const secondaryLink =
    'text-sm text-[var(--niners-cream)] underline cursor-pointer inline-flex items-center gap-1.5 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)] rounded'

  return (
    <div className="flex flex-col gap-6 items-center">
      <h2 className="text-2xl font-black text-[var(--niners-cream)] text-center">
        Tu foto de fan
      </h2>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
        data-testid="camera-input"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="gallery-input"
      />

      {data.photoPreviewUrl ? (
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.photoPreviewUrl}
            alt="Tu foto de fan"
            className="w-40 h-40 rounded-full object-cover border-4 border-[var(--niners-gold)]"
          />
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => cameraRef.current?.click()} className={secondaryLink}>
              <CameraIcon size={15} />
              Tomar otra
            </button>
            <button type="button" onClick={() => galleryRef.current?.click()} className={secondaryLink}>
              <GalleryIcon size={15} />
              Elegir otra
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            aria-label="Tomar foto de fan con la cámara"
            className="w-40 h-40 rounded-full border-4 border-dashed border-[var(--niners-gold)] flex flex-col items-center justify-center gap-2 text-[var(--niners-gold-light)] hover:bg-[var(--niners-red-bright)] transition-colors cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)]"
          >
            <CameraIcon size={36} />
            <span className="text-sm font-bold text-[var(--niners-cream)]">Tomar foto</span>
          </button>

          <div className="flex items-center gap-3 w-full max-w-[220px]">
            <span className="h-px flex-1 bg-[var(--niners-gold)] opacity-30" />
            <span className="text-xs uppercase tracking-widest text-[var(--niners-cream)] opacity-60">o</span>
            <span className="h-px flex-1 bg-[var(--niners-gold)] opacity-30" />
          </div>

          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm
              border-2 border-[var(--niners-gold)] text-[var(--niners-cream)] cursor-pointer
              hover:bg-[var(--niners-red-bright)] transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)]"
          >
            <GalleryIcon size={18} />
            Subir desde mis fotos
          </button>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!data.photoFile}
        className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all
          flex items-center justify-center gap-2
          bg-[var(--niners-gold)] text-black border-2 border-[var(--niners-gold)]
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-[var(--niners-gold-light)] enabled:cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)]"
      >
        Revisar mis datos →
      </button>
    </div>
  )
}
