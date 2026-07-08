'use client'

import { useRef } from 'react'
import { FanFormData } from '@/lib/types'
import { CameraIcon, SpinnerIcon } from './icons'

interface StepCameraProps {
  data: FanFormData
  onChange: (partial: Partial<FanFormData>) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function StepCamera({ data, onChange, onSubmit, isSubmitting }: StepCameraProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    onChange({ photoFile: file, photoPreviewUrl: previewUrl })
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <h2 className="text-2xl font-black text-[var(--niners-cream)] text-center">
        ¡Tómate una foto de fan!
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {data.photoPreviewUrl ? (
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.photoPreviewUrl}
            alt="Tu foto de fan"
            className="w-40 h-40 rounded-full object-cover border-4 border-[var(--niners-gold)]"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="text-sm text-[var(--niners-cream)] underline cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)] rounded"
          >
            Cambiar foto
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          aria-label="Tomar foto de fan"
          className="w-40 h-40 rounded-full border-4 border-dashed border-[var(--niners-gold)] flex flex-col items-center justify-center gap-2 text-[var(--niners-gold-light)] hover:bg-[var(--niners-red-bright)] transition-colors cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)]"
        >
          <CameraIcon size={36} />
          <span className="text-sm font-bold text-[var(--niners-cream)]">Tomar foto</span>
        </button>
      )}

      <button
        onClick={onSubmit}
        disabled={!data.photoFile || isSubmitting}
        aria-live="polite"
        className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all
          flex items-center justify-center gap-2
          bg-[var(--niners-gold)] text-black border-2 border-[var(--niners-gold)]
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-[var(--niners-gold-light)] enabled:cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)]"
      >
        {isSubmitting ? (
          <>
            <SpinnerIcon size={20} />
            Generando tu tarjeta...
          </>
        ) : (
          'Generar mi tarjeta'
        )}
      </button>
    </div>
  )
}
