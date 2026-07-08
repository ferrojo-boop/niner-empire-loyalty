'use client'

import { FanFormData } from '@/lib/types'

interface StepFanDataProps {
  data: FanFormData
  onChange: (partial: Partial<FanFormData>) => void
  onNext: () => void
}

const currentYear = new Date().getFullYear()

export function StepFanData({ data, onChange, onNext }: StepFanDataProps) {
  const isValid = data.nombre.trim() !== '' && data.email.trim() !== '' && data.fanDesde !== ''

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-black text-[var(--niners-cream)] text-center">
        ¡Regístrate como Fan!
      </h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="text-sm font-bold text-[var(--niners-cream)]">
          Nombre completo *
        </label>
        <input
          id="nombre"
          type="text"
          required
          autoComplete="name"
          value={data.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="Tu nombre"
          className="rounded-lg px-4 py-3 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--niners-gold)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-bold text-[var(--niners-cream)]">
          Correo electrónico *
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="tu@correo.com"
          className="rounded-lg px-4 py-3 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--niners-gold)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="whatsapp" className="text-sm font-bold text-[var(--niners-cream)] flex items-center gap-2">
          WhatsApp
          <span className="text-xs bg-[var(--niners-gold)] text-black px-2 py-0.5 rounded-full font-black">
            RECOMENDADO
          </span>
        </label>
        <input
          id="whatsapp"
          type="tel"
          autoComplete="tel"
          value={data.whatsapp}
          onChange={(e) => onChange({ whatsapp: e.target.value })}
          placeholder="+52 55 1234 5678"
          className="rounded-lg px-4 py-3 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--niners-gold)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fanDesde" className="text-sm font-bold text-[var(--niners-cream)]">
          Fan desde el año *
        </label>
        <input
          id="fanDesde"
          type="number"
          required
          inputMode="numeric"
          value={data.fanDesde}
          onChange={(e) => onChange({ fanDesde: Number(e.target.value) })}
          min={1946}
          max={currentYear}
          placeholder="Ej. 1995"
          className="rounded-lg px-4 py-3 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--niners-gold)]"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        aria-describedby={!isValid ? 'fan-data-hint' : undefined}
        className="mt-2 py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all
          bg-[var(--niners-red-bright)] text-white border-2 border-[var(--niners-gold)]
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-[var(--niners-gold)] hover:text-black enabled:cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)]"
      >
        Siguiente →
      </button>
      {!isValid && (
        <p id="fan-data-hint" className="text-xs text-[var(--niners-cream)]/80 text-center -mt-3">
          Completa nombre, correo y año para continuar
        </p>
      )}
    </div>
  )
}
