'use client'

import { useState } from 'react'
import { FanFormData } from '@/lib/types'
import { CheckIcon, WarningIcon, XIcon } from './icons'

interface StepTriviaProps {
  data: FanFormData
  onChange: (partial: Partial<FanFormData>) => void
  onCorrect: () => void
}

const OPTIONS = [3, 4, 5, 6]
const CORRECT_ANSWER = 5

export function StepTrivia({ data, onChange, onCorrect }: StepTriviaProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [isWrong, setIsWrong] = useState(false)

  const isCorrect = selected === CORRECT_ANSWER
  const canContinue = isCorrect && data.jugadorFavorito.trim() !== ''

  function handleSelect(option: number) {
    setSelected(option)
    setIsWrong(option !== CORRECT_ANSWER)
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <h2 className="text-2xl font-black text-[var(--niners-cream)] text-center">
        Pregunta de Fan
      </h2>
      <p className="text-xl font-bold text-white text-center leading-snug">
        ¿Cuántos Super Bowls ha ganado San Francisco?
      </p>

      <div className="grid grid-cols-2 gap-4 w-full" role="group" aria-label="Opciones de respuesta">
        {OPTIONS.map((option) => {
          const isSelected = selected === option
          const isCorrectSelected = isSelected && option === CORRECT_ANSWER
          const isWrongSelected = isSelected && option !== CORRECT_ANSWER
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              aria-pressed={isSelected}
              className={`relative py-5 rounded-xl text-3xl font-black border-2 transition-all cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)]
                ${isCorrectSelected
                  ? 'bg-green-700 border-green-400 text-white scale-105'
                  : isWrongSelected
                  ? 'bg-red-950 border-red-400 text-white'
                  : 'bg-[var(--niners-red)] border-[var(--niners-gold)] text-white hover:bg-[var(--niners-red-bright)]'
                }`}
            >
              {option}
              {isCorrectSelected && <CheckIcon size={20} className="absolute top-2 right-2" />}
              {isWrongSelected && <XIcon size={20} className="absolute top-2 right-2" />}
            </button>
          )
        })}
      </div>

      {isWrong && (
        <p role="alert" className="motion-safe:animate-pulse flex items-center gap-2 text-[var(--niners-cream)] bg-black/30 rounded-lg px-4 py-2 text-center font-bold">
          <WarningIcon size={20} className="shrink-0" />
          ¡Incorrecto! Intenta de nuevo.
        </p>
      )}

      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="jugadorFavorito" className="text-sm font-bold text-[var(--niners-cream)]">
          ¿Quién es tu jugador favorito? *
        </label>
        <input
          id="jugadorFavorito"
          type="text"
          required
          value={data.jugadorFavorito}
          onChange={(e) => onChange({ jugadorFavorito: e.target.value })}
          placeholder="Ej. Joe Montana"
          className="rounded-lg px-4 py-3 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--niners-gold)]"
        />
      </div>

      <button
        onClick={onCorrect}
        disabled={!canContinue}
        aria-describedby={!canContinue ? 'trivia-hint' : undefined}
        className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all
          bg-[var(--niners-red-bright)] text-white border-2 border-[var(--niners-gold)]
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-[var(--niners-gold)] hover:text-black enabled:cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--niners-gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--niners-red)]"
      >
        Siguiente →
      </button>
      {!canContinue && (
        <p id="trivia-hint" className="text-xs text-[var(--niners-cream)]/80 text-center -mt-3">
          Responde correctamente y escribe tu jugador favorito para continuar
        </p>
      )}
    </div>
  )
}
