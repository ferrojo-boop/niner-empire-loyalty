'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { CheckCircleIcon, SpinnerIcon, WarningIcon, XCircleIcon } from '@/components/icons'

interface CheckinResult {
  alreadyCheckedIn: boolean
  nombre: string
  memberNumber: number
  totalVisits: number
  registradoPor: string
}

interface FanInfo {
  nombre: string
  member_number: number
}

type State = 'loading' | 'success' | 'already' | 'notStaff' | 'error'

export default function CheckinPage() {
  const { fanId } = useParams<{ fanId: string }>()
  const [state, setState] = useState<State>('loading')
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [fan, setFan] = useState<FanInfo | null>(null)

  useEffect(() => {
    // Esta pantalla ya no registra visitas por sí sola. Si quien abre el enlace
    // trae sesión de staff, se registra; si es cualquier otra persona que
    // escaneó la tarjeta con su cámara, solo se le muestra que es válida.
    async function run() {
      let token: string | undefined
      try {
        const { data } = await getSupabaseBrowser().auth.getSession()
        token = data.session?.access_token
      } catch {
        token = undefined
      }

      if (token) {
        try {
          const res = await fetch(`/api/checkin/${fanId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data: CheckinResult = await res.json()
            setResult(data)
            setState(data.alreadyCheckedIn ? 'already' : 'success')
            return
          }
          // 401 = la sesión no es de staff; se cae a la vista informativa.
        } catch {
          setState('error')
          return
        }
      }

      try {
        const res = await fetch(`/api/fan/${fanId}`)
        if (!res.ok) {
          setState('error')
          return
        }
        setFan(await res.json())
        setState('notStaff')
      } catch {
        setState('error')
      }
    }
    run()
  }, [fanId])

  if (state === 'loading') {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#AA0000]" aria-live="polite">
        <p className="flex items-center gap-2 text-[var(--niners-cream)] text-xl font-black motion-safe:animate-pulse tracking-widest">
          <SpinnerIcon size={22} />
          Verificando tarjeta...
        </p>
      </main>
    )
  }

  if (state === 'error') {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-[#1A1A1A] px-6" role="alert">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/NinerEmpireMXok.png" alt="Niner Empire México" className="w-32 h-auto" />
        <XCircleIcon size={56} className="text-red-400" />
        <h1 className="text-red-400 text-2xl font-black text-center">Tarjeta no encontrada</h1>
        <p className="text-gray-400 text-center">Verifica que el código QR sea de una membresía vigente.</p>
      </main>
    )
  }

  // Cualquiera que escanee con su cámara ve esto: confirma que la tarjeta es
  // real, pero no registra nada.
  if (state === 'notStaff') {
    const memberStr = fan ? String(fan.member_number).padStart(3, '0') : ''
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-5 bg-[#1A1A1A] px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/NinerEmpireMXok.png" alt="Niner Empire México" className="w-32 h-auto" />
        <CheckCircleIcon size={56} className="text-[#B3995D]" />
        <h1 className="text-[#B3995D] text-2xl font-black text-center tracking-wide uppercase">
          Membresía válida
        </h1>
        <p className="text-white text-xl font-bold text-center">{fan?.nombre}</p>
        <p className="text-[var(--niners-cream)] text-sm tracking-widest">NE - MX - {memberStr}</p>
        <p className="mt-2 max-w-xs text-gray-400 text-sm text-center leading-relaxed">
          Solo el staff del club puede registrar visitas. Si eres del staff,{' '}
          <a href="/staff" className="text-[#B3995D] underline font-bold">
            inicia sesión aquí
          </a>{' '}
          y vuelve a escanear.
        </p>
      </main>
    )
  }

  const memberStr = result ? String(result.memberNumber).padStart(3, '0') : ''
  const isRepeat = state === 'already'

  return (
    <main className={`min-h-dvh flex flex-col items-center justify-center gap-5 px-6 ${isRepeat ? 'bg-[#7A5200]' : 'bg-[#AA0000]'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/NinerEmpireMXok.png" alt="Niner Empire México" className="w-32 h-auto" />
      {isRepeat ? (
        <WarningIcon size={56} className="text-white" />
      ) : (
        <CheckCircleIcon size={72} className="text-white" />
      )}
      <h1 className="text-white text-3xl font-black text-center tracking-wide uppercase">
        {isRepeat ? 'Visita ya registrada' : '¡Visita registrada!'}
      </h1>
      <p className="text-[var(--niners-cream)] text-2xl font-bold text-center">{result?.nombre}</p>
      {isRepeat && <p className="text-white text-center">Ya registraste tu visita de hoy</p>}
      <div className="bg-black/30 rounded-2xl px-8 py-4 text-center">
        <p className="text-[var(--niners-cream)] text-sm font-bold tracking-widest uppercase">
          Total de visitas
        </p>
        <p className="text-white text-4xl font-black">{result?.totalVisits}</p>
      </div>
      <p className="text-[var(--niners-cream)] text-sm tracking-widest">NE - MX - {memberStr}</p>
      <p className="text-[var(--niners-cream)]/70 text-xs">Registró: {result?.registradoPor}</p>
    </main>
  )
}
