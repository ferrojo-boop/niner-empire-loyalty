'use client'

import { useState } from 'react'

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
      <h2 className="text-2xl font-black text-[var(--niners-gold)] text-center">
        Pregunta de Fan
      </h2>
      <p className="text-xl font-bold text-white text-center leading-snug">
        ¿Cuántos Super Bowls ha ganado San Francisco?
      </p>

      <div className="grid grid-cols-2 gap-4 w-full">
        {OPTIONS.map((option) => {
          const isSelected = selected === option
          const isCorrectSelected = isSelected && option === CORRECT_ANSWER
          const isWrongSelected = isSelected && option !== CORRECT_ANSWER
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`py-5 rounded-xl text-3xl font-black border-2 transition-all
                ${isCorrectSelected
                  ? 'bg-green-600 border-green-400 text-white scale-105'
                  : isWrongSelected
                  ? 'bg-red-800 border-red-500 text-white'
                  : 'bg-[var(--niners-red)] border-[var(--niners-gold)] text-white hover:bg-[var(--niners-red-bright)]'
                }`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {isWrong && (
        <p className="text-red-400 font-bold text-center animate-pulse">
          ¡Incorrecto! Intenta de nuevo. 🏈
        </p>
      )}
    </div>
  )
}
