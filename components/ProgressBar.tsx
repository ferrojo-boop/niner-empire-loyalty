'use client'

import { CheckIcon } from './icons'

interface ProgressBarProps {
  currentStep: 1 | 2 | 3
}

const steps = [
  { number: 1, label: 'Tus datos' },
  { number: 2, label: 'Trivia' },
  { number: 3, label: 'Tu foto' },
]

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <ol aria-label={`Paso ${currentStep} de ${steps.length}`} className="flex items-center justify-center gap-4 mb-8">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep
        const isActive = step.number === currentStep
        return (
          <li key={step.number} className="flex items-center gap-2">
            <div
              aria-current={isActive ? 'step' : undefined}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                isCompleted
                  ? 'bg-[var(--niners-gold)] border-[var(--niners-gold)] text-black'
                  : isActive
                  ? 'bg-[var(--niners-red-bright)] border-[var(--niners-gold)] text-white'
                  : 'bg-transparent border-gray-400 text-gray-400'
              }`}
            >
              {isCompleted ? <CheckIcon size={16} /> : step.number}
            </div>
            <span
              className={`text-sm font-semibold ${
                isActive ? 'text-[var(--niners-gold)]' : isCompleted ? 'text-[var(--niners-gold-light)]' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-px ${isCompleted ? 'bg-[var(--niners-gold)]' : 'bg-gray-600'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
