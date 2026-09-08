'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { CheckCircleIcon, SpinnerIcon, WarningIcon, CheckIcon } from '@/components/icons'
import { REGLAS, LARGO_MINIMO, passwordValida, motivoDeSupabase } from '@/lib/politicaPassword'
import '../staff.css'

/**
 * Pantalla a la que llega el staff desde el correo de invitación.
 * El enlace trae un token en el fragmento de la URL; el cliente de Supabase lo
 * detecta solo y abre una sesión temporal que sirve para fijar la contraseña.
 */
export default function DefinirPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [linkValido, setLinkValido] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const supabase = getSupabaseBrowser()
        // Le damos un momento a que procese el token del enlace.
        const { data } = await supabase.auth.getSession()
        setLinkValido(!!data.session)
      } catch {
        setLinkValido(false)
      } finally {
        setReady(true)
      }
    }
    const t = setTimeout(check, 600)
    return () => clearTimeout(t)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!passwordValida(password)) {
      setError('La contraseña todavía no cumple los requisitos de abajo.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setBusy(true)
    try {
      const { error: updateError } = await getSupabaseBrowser().auth.updateUser({ password })
      if (updateError) {
        // Supabase manda el motivo cuando rechaza la contraseña por débil.
        // Repetirlo es mucho más útil que "pide otra invitación", que manda a la
        // persona a un callejón cuando lo único malo era la contraseña.
        const reasons = (updateError as { reasons?: readonly string[] }).reasons
        setError(
          motivoDeSupabase(reasons) ??
            'No se pudo guardar la contraseña. Pide una invitación nueva.'
        )
        setBusy(false)
        return
      }
      setListo(true)
      setTimeout(() => router.push('/staff'), 1800)
    } catch {
      setError('No pudimos conectarnos. Revisa tu conexión.')
      setBusy(false)
    }
  }

  if (!ready) {
    return (
      <main className="staff-page">
        <p className="staff-loading">
          <SpinnerIcon size={22} />
          Validando invitación...
        </p>
      </main>
    )
  }

  if (listo) {
    return (
      <main className="staff-page">
        <div className="staff-card" style={{ alignItems: 'center', textAlign: 'center' }}>
          <CheckCircleIcon size={56} className="text-[#4ade80]" />
          <h1>Contraseña guardada</h1>
          <p className="staff-lead">Te llevamos al escáner...</p>
        </div>
      </main>
    )
  }

  if (!linkValido) {
    return (
      <main className="staff-page">
        <div className="staff-card" style={{ alignItems: 'center', textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="staff-crest" src="/logo-niner-empire-2026.webp" alt="Niner Empire México" />
          <h1>Enlace no válido</h1>
          <p className="staff-lead">
            Este enlace ya se usó o expiró. Pide al administrador del club que te envíe una
            invitación nueva.
          </p>
          <a href="/staff" className="staff-btn" style={{ textDecoration: 'none' }}>
            Ir al acceso
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="staff-page">
      <form className="staff-card" onSubmit={handleSubmit}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="staff-crest" src="/logo-niner-empire-2026.webp" alt="Niner Empire México" />
        <h1>Define tu contraseña</h1>
        <p className="staff-lead">Con ella entrarás a registrar visitas del club.</p>

        <div className="staff-field">
          <label htmlFor="pw">Contraseña nueva</label>
          <input
            id="pw"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Mínimo ${LARGO_MINIMO} caracteres`}
          />
        </div>

        {/* Los requisitos se muestran mientras escribe, no al enviar: rechazar
            sin decir qué falta es la forma más rápida de que alguien elija algo
            débil en el siguiente intento. */}
        {password !== '' && (
          <ul className="staff-reglas" aria-live="polite">
            {REGLAS.map((r) => {
              const ok = r.cumple(password)
              return (
                <li key={r.id} className={ok ? 'ok' : ''}>
                  <span aria-hidden="true">{ok ? <CheckIcon size={13} /> : '•'}</span>
                  <span>{r.texto}</span>
                  <span className="sr-only">{ok ? ' (cumple)' : ' (falta)'}</span>
                </li>
              )
            })}
          </ul>
        )}

        <div className="staff-field">
          <label htmlFor="pw2">Repite la contraseña</label>
          <input
            id="pw2"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="staff-btn" disabled={busy || !password || !confirm}>
          {busy ? (
            <>
              <SpinnerIcon size={20} />
              Guardando...
            </>
          ) : (
            'Guardar y entrar'
          )}
        </button>

        {error && (
          <p role="alert" className="staff-error">
            <WarningIcon size={18} className="shrink-0" />
            {error}
          </p>
        )}
      </form>
    </main>
  )
}
