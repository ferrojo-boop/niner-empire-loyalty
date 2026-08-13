'use client'

import { useEffect, useState } from 'react'

// 10 de septiembre de 2026, 6:35 PM (hora del centro de México, UTC-6)
const TARGET = new Date('2026-09-10T18:35:00-06:00').getTime()

function getRemaining() {
  const diff = TARGET - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: false,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function VenueCountdown() {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining> | null>(null)

  useEffect(() => {
    setRemaining(getRemaining())
    const id = setInterval(() => setRemaining(getRemaining()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!remaining) {
    return <div className="venue-countdown" aria-hidden="true" />
  }

  if (remaining.done) {
    return (
      <div className="venue-countdown">
        <span className="venue-countdown-label">¡Ya es hoy!</span>
      </div>
    )
  }

  return (
    <div className="venue-countdown">
      <span className="venue-countdown-label">Falta para el anuncio</span>
      <div className="venue-countdown-units">
        <div className="venue-countdown-unit">
          <span className="n">{remaining.days}</span>
          <span className="u">{remaining.days === 1 ? 'Día' : 'Días'}</span>
        </div>
        <div className="venue-countdown-unit live">
          <span className="n" role="timer" aria-live="off">
            {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
          </span>
          <span className="u">Hrs : Min : Seg</span>
        </div>
      </div>
    </div>
  )
}
