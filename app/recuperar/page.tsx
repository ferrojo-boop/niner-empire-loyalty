'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SpinnerIcon, WarningIcon } from '@/components/icons'
import './recuperar.css'

export default function RecuperarPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim() === '') return

    setIsSearching(true)
    setError('')

    try {
      const res = await fetch('/api/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'No pudimos recuperar tu tarjeta.')
        setIsSearching(false)
        return
      }

      router.push(`/tarjeta/${data.fanId}`)
    } catch {
      setError('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')
      setIsSearching(false)
    }
  }

  return (
    <main className="recover-page">
      <div className="recover-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="recover-crest"
          src="/NinerEmpireMXok.png"
          alt="Niner Empire México"
        />

        <h1>Recupera tu tarjeta digital</h1>
        <p className="recover-lead">
          Escribe el correo con el que te registraste y te llevamos de vuelta a tu tarjeta.
        </p>

        <form onSubmit={handleSubmit} className="recover-form">
          <div className="recover-field">
            <label htmlFor="recover-email">Correo electrónico *</label>
            <input
              id="recover-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </div>

          <button type="submit" disabled={isSearching || email.trim() === ''} className="recover-btn">
            {isSearching ? (
              <>
                <SpinnerIcon size={20} />
                Buscando...
              </>
            ) : (
              'Recuperar mi tarjeta'
            )}
          </button>
        </form>

        {error && (
          <p role="alert" className="recover-error">
            <WarningIcon size={18} className="shrink-0" />
            {error}
          </p>
        )}

        <a href="/" className="recover-back">
          ← Volver al inicio
        </a>
      </div>
    </main>
  )
}
