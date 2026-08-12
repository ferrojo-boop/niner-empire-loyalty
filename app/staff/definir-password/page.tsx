'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { CheckCircleIcon, SpinnerIcon, WarningIcon } from '@/components/icons'
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

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
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
        setError('No se pudo guardar la contraseña. Pide una invitación nueva.')
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
          <img className="staff-crest" src="/NinerEmpireMXok.png" alt="Niner Empire México" />
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
        <img className="staff-crest" src="/NinerEmpireMXok.png" alt="Niner Empire México" />
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
            placeholder="Mínimo 8 caracteres"
          />
        </div>

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
