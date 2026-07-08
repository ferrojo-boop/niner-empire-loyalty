'use client'

import { useState } from 'react'
import { CheckIcon, WarningIcon, XIcon } from './icons'

interface StepTriviaProps {
  onCorrect: () => void
}

const OPTIONS = [3, 4, 5, 6]
const CORRECT_ANSWER = 5

export function StepTrivia({ onCorrect }: StepTriviaProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [isWrong, setIsWrong] = useState(false)

  function handleSelect(option: number) {
    setSelected(option)
    if (option === CORRECT_ANSWER) {
      setIsWrong(false)
      setTimeout(onCorrect, 600)
    } else {
      setIsWrong(true)
    }
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
    </div>
  )
}
