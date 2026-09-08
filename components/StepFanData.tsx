'use client'

import { FanFormData } from '@/lib/types'
import { PRIMER_ANO, ultimoAno, anoValido, mensajeAnoInvalido } from '@/lib/fanDesde'

interface StepFanDataProps {
  data: FanFormData
  onChange: (partial: Partial<FanFormData>) => void
  onNext: () => void
}

const currentYear = ultimoAno()

export function StepFanData({ data, onChange, onNext }: StepFanDataProps) {
  // El año se valida aquí y no solo con min/max del input: esos atributos son
  // validación nativa de submit, y este formulario avanza con onClick.
  const anoFueraDeRango = data.fanDesde !== '' && !anoValido(data.fanDesde)

  const isValid =
    data.nombre.trim() !== '' &&
    data.email.trim() !== '' &&
    data.whatsapp.trim() !== '' &&
    data.fanDesde !== '' &&
    !anoFueraDeRango

  return (
    <div className="flex flex-col gap-5">
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
        <label htmlFor="whatsapp" className="text-sm font-bold text-[var(--niners-cream)]">
          WhatsApp *
        </label>
        <input
          id="whatsapp"
          type="tel"
          required
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
          min={PRIMER_ANO}
          max={currentYear}
          placeholder="Ej. 1995"
          aria-invalid={anoFueraDeRango}
          aria-describedby={anoFueraDeRango ? 'fan-desde-error' : undefined}
          className="rounded-lg px-4 py-3 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--niners-gold)]"
        />
        {anoFueraDeRango && (
          <p id="fan-desde-error" role="alert" className="text-sm font-bold text-[var(--niners-gold-light)]">
            {mensajeAnoInvalido()}
          </p>
        )}
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
          Completa nombre, correo, WhatsApp y año para continuar
        </p>
      )}
    </div>
  )
}
