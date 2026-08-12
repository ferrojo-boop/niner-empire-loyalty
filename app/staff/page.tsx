'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupabaseBrowser, extractFanId } from '@/lib/supabaseBrowser'
import { CheckCircleIcon, SpinnerIcon, WarningIcon, XCircleIcon } from '@/components/icons'
import './staff.css'

interface CheckinResult {
  alreadyCheckedIn: boolean
  nombre: string
  memberNumber: number
  fotoUrl: string | null
  totalVisits: number
  registradoPor: string
}

type Session = { token: string; nombre: string }

export default function StaffPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)

  // Al abrir, se revisa si ya había sesión guardada en este navegador.
  useEffect(() => {
    async function restore() {
      try {
        const supabase = getSupabaseBrowser()
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token
        if (!token) return

        const res = await fetch('/api/staff/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const me = await res.json()
          setSession({ token, nombre: me.nombre })
        }
      } catch {
        // sin sesión válida: se queda en la pantalla de acceso
      } finally {
        setChecking(false)
      }
    }
    restore()
  }, [])

  async function handleLogout() {
    await getSupabaseBrowser().auth.signOut()
    setSession(null)
  }

  if (checking) {
    return (
      <main className="staff-page">
        <p className="staff-loading">
          <SpinnerIcon size={22} />
          Cargando...
        </p>
      </main>
    )
  }

  return session ? (
    <Scanner session={session} onLogout={handleLogout} />
  ) : (
    <LoginForm onLogin={setSession} />
  )
}

/* ------------------------------- Acceso ------------------------------- */

function LoginForm({ onLogin }: { onLogin: (s: Session) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')

    try {
      const supabase = getSupabaseBrowser()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError || !data.session) {
        setError('Correo o contraseña incorrectos.')
        setBusy(false)
        return
      }

      const token = data.session.access_token
      const res = await fetch('/api/staff/me', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        // La cuenta existe pero no está dada de alta como staff del club.
        await supabase.auth.signOut()
        setError('Esta cuenta no tiene permiso para registrar visitas.')
        setBusy(false)
        return
      }

      const me = await res.json()
      onLogin({ token, nombre: me.nombre })
    } catch {
      setError('No pudimos conectarnos. Revisa tu conexión.')
      setBusy(false)
    }
  }

  return (
    <main className="staff-page">
      <form className="staff-card" onSubmit={handleSubmit}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="staff-crest" src="/NinerEmpireMXok.png" alt="Niner Empire México" />
        <h1>Acceso staff</h1>
        <p className="staff-lead">Solo personal del club puede registrar visitas.</p>

        <div className="staff-field">
          <label htmlFor="staff-email">Correo</label>
          <input
            id="staff-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@ninerempire.mx"
          />
        </div>

        <div className="staff-field">
          <label htmlFor="staff-password">Contraseña</label>
          <input
            id="staff-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="staff-btn" disabled={busy || !email || !password}>
          {busy ? (
            <>
              <SpinnerIcon size={20} />
              Entrando...
            </>
          ) : (
            'Entrar'
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

/* ------------------------------ Escáner ------------------------------- */

function Scanner({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const busyRef = useRef(false)

  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [error, setError] = useState('')
  const [manualId, setManualId] = useState('')
  const [registering, setRegistering] = useState(false)

  const cameraSupported =
    typeof window !== 'undefined' &&
    'BarcodeDetector' in window &&
    !!navigator.mediaDevices?.getUserMedia

  const registerVisit = useCallback(
    async (fanId: string) => {
      if (busyRef.current) return
      busyRef.current = true
      setRegistering(true)
      setError('')

      try {
        const res = await fetch(`/api/checkin/${encodeURIComponent(fanId)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` },
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'No se pudo registrar la visita.')
          setResult(null)
        } else {
          setResult(data)
          if (navigator.vibrate) navigator.vibrate(120)
        }
      } catch {
        setError('No pudimos conectarnos. Revisa tu conexión.')
      } finally {
        setRegistering(false)
        // Pequeña pausa para no re-escanear la misma tarjeta en bucle.
        setTimeout(() => {
          busyRef.current = false
        }, 2500)
      }
    },
    [session.token]
  )

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setScanning(false)
  }, [])

  async function startCamera() {
    setCameraError('')
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
    } catch {
      setCameraError('No pudimos abrir la cámara. Revisa los permisos del navegador.')
    }
  }

  // Bucle de detección mientras la cámara está encendida.
  useEffect(() => {
    if (!scanning) return
    let stopped = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Detector = (window as any).BarcodeDetector
    const detector = new Detector({ formats: ['qr_code'] })

    async function tick() {
      if (stopped) return
      const video = videoRef.current
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && !busyRef.current) {
        try {
          const codes = await detector.detect(video)
          if (codes.length > 0) {
            const fanId = extractFanId(codes[0].rawValue ?? '')
            if (fanId) {
              await registerVisit(fanId)
            } else {
              setError('Ese QR no es una tarjeta de Niner Empire México.')
            }
          }
        } catch {
          // un frame ilegible no es un error: se sigue intentando
        }
      }
      if (!stopped) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    return () => {
      stopped = true
    }
  }, [scanning, registerVisit])

  // Apagar la cámara al salir de la pantalla.
  useEffect(() => stopCamera, [stopCamera])

  function handleManual(e: React.FormEvent) {
    e.preventDefault()
    const fanId = extractFanId(manualId)
    if (!fanId) {
      setError('Escribe un número de tarjeta válido (ej. NEL-1786423774509).')
      return
    }
    setManualId('')
    registerVisit(fanId)
  }

  return (
    <main className="staff-page staff-page--scanner">
      <header className="staff-header">
        <span className="staff-who">
          Staff: <b>{session.nombre}</b>
        </span>
        <button className="staff-logout" onClick={onLogout}>
          Salir
        </button>
      </header>

      <div className="staff-card staff-card--wide">
        <h1>Registrar visita</h1>

        {cameraSupported ? (
          <>
            <div className={`staff-video-wrap${scanning ? ' is-live' : ''}`}>
              <video ref={videoRef} playsInline muted className="staff-video" />
              {!scanning && <p className="staff-video-hint">La cámara está apagada</p>}
            </div>
            <button
              className="staff-btn"
              onClick={scanning ? stopCamera : startCamera}
              type="button"
            >
              {scanning ? 'Apagar cámara' : 'Encender cámara y escanear'}
            </button>
          </>
        ) : (
          <p className="staff-note">
            Este navegador no puede escanear con la cámara desde la app. Escanea el QR con la
            cámara normal del celular: al abrir el enlace se registra la visita, porque ya
            iniciaste sesión aquí. También puedes capturar el número abajo.
          </p>
        )}

        <form className="staff-manual" onSubmit={handleManual}>
          <label htmlFor="manual-id">O captura el número de tarjeta</label>
          <div className="staff-manual-row">
            <input
              id="manual-id"
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="NEL-1786423774509"
            />
            <button type="submit" className="staff-btn staff-btn--sm" disabled={registering}>
              Registrar
            </button>
          </div>
        </form>

        {registering && (
          <p className="staff-loading">
            <SpinnerIcon size={20} />
            Registrando...
          </p>
        )}

        {cameraError && (
          <p role="alert" className="staff-error">
            <WarningIcon size={18} className="shrink-0" />
            {cameraError}
          </p>
        )}

        {error && (
          <p role="alert" className="staff-error">
            <XCircleIcon size={18} className="shrink-0" />
            {error}
          </p>
        )}

        {result && (
          <div className={`staff-result${result.alreadyCheckedIn ? ' is-repeat' : ''}`}>
            {result.fotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="staff-result-photo" src={result.fotoUrl} alt="" />
            )}
            <div className="staff-result-info">
              <span className="staff-result-status">
                {result.alreadyCheckedIn ? (
                  <>
                    <WarningIcon size={18} /> Ya tenía visita hoy
                  </>
                ) : (
                  <>
                    <CheckCircleIcon size={18} /> Visita registrada
                  </>
                )}
              </span>
              <b className="staff-result-name">{result.nombre}</b>
              <span className="staff-result-meta">
                NE - MX - {String(result.memberNumber).padStart(3, '0')} · {result.totalVisits}{' '}
                {result.totalVisits === 1 ? 'visita' : 'visitas'}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
