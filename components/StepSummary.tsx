'use client'

import { FanFormData } from '@/lib/types'
import { EditIcon, SpinnerIcon } from './icons'

interface StepSummaryProps {
  data: FanFormData
  onEditData: () => void
  onEditPhoto: () => void
  onSubmit: () => void
  isSubmitting: boolean
  error: string | null
}

export function StepSummary({ data, onEditData, onEditPhoto, onSubmit, isSubmitting, error }: StepSummaryProps) {
  return (
    <div className="flex flex-col gap-6 items-center">
      <h2 className="text-2xl font-black text-[var(--niners-cream)] text-center">
        Revisa tus datos
      </h2>

      {data.photoPreviewUrl && (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.photoPreviewUrl}
            alt="Tu foto de fan"
            className="w-32 h-32 rounded-full object-cover border-4 border-[var(--niners-gold)]"
          />
          <button
            onClick={onEditPhoto}
            className="flex items-center gap-1 text-sm text-[var(--niners-cream)] underline cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)] rounded"
          >
            <EditIcon size={14} />
            Cambiar foto
          </button>
        </div>
      )}

      <div className="w-full flex flex-col gap-3 bg-black/20 rounded-xl p-4">
        <SummaryRow label="Nombre completo" value={data.nombre} />
        <SummaryRow label="Correo electrónico" value={data.email} />
        <SummaryRow label="WhatsApp" value={data.whatsapp} />
        <SummaryRow label="Fan desde" value={String(data.fanDesde)} />
        <SummaryRow label="Jugador favorito" value={data.jugadorFavorito} />

        <button
          onClick={onEditData}
          className="self-start flex items-center gap-1 text-sm text-[var(--niners-cream)] underline cursor-pointer mt-1
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)] rounded"
        >
          <EditIcon size={14} />
          Editar mis datos
        </button>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
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

      {error && (
        <p role="alert" className="text-[var(--niners-cream)] bg-black/30 rounded-lg px-4 py-2 text-sm font-bold text-center">
          {error}
        </p>
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-bold text-[var(--niners-gold-light)] uppercase tracking-wider">{label}</span>
      <span className="text-[var(--niners-cream)] font-semibold break-words">{value}</span>
    </div>
  )
}
