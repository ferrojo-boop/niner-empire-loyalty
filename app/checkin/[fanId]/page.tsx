'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface CheckinResult {
  alreadyCheckedIn: boolean
  nombre: string
  memberNumber: number
  totalVisits: number
}

export default function CheckinPage() {
  const { fanId } = useParams<{ fanId: string }>()
  const [state, setState] = useState<'loading' | 'success' | 'already' | 'error'>('loading')
  const [result, setResult] = useState<CheckinResult | null>(null)

  useEffect(() => {
    async function register() {
      try {
        const res = await fetch(`/api/checkin/${fanId}`, { method: 'POST' })
        if (!res.ok) {
          setState('error')
          return
        }
        const data: CheckinResult = await res.json()
        setResult(data)
        setState(data.alreadyCheckedIn ? 'already' : 'success')
      } catch {
        setState('error')
      }
    }
    register()
  }, [fanId])

  const memberStr = result ? String(result.memberNumber).padStart(4, '0') : ''

  if (state === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#AA0000]">
        <p className="text-[#B3995D] text-xl font-black animate-pulse tracking-widest">
          Registrando visita...
        </p>
      </main>
    )
  }

  if (state === 'error') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A1A] gap-4 px-6">
        <div className="text-6xl">❌</div>
        <h1 className="text-white text-2xl font-black text-center">Miembro no encontrado</h1>
        <p className="text-gray-400 text-center">Verifica que el QR sea válido.</p>
      </main>
    )
  }

  if (state === 'already') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#AA0000] gap-6 px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/NinerEmpireMX.png" alt="Niner Empire México" className="w-40 h-auto" />
        <div className="text-5xl">⚠️</div>
        <h1 className="text-white text-3xl font-black text-center tracking-wide">
          Visita ya registrada
        </h1>
        <p className="text-[#B3995D] text-xl font-bold text-center">{result?.nombre}</p>
        <p className="text-white text-lg text-center">
          Ya registraste tu visita de hoy
        </p>
        <div className="bg-black/30 rounded-2xl px-8 py-4 text-center">
          <p className="text-[#B3995D] text-sm font-bold tracking-widest uppercase">Total de visitas</p>
          <p className="text-white text-4xl font-black">{result?.totalVisits}</p>
        </div>
        <p className="text-[#D4B878] text-sm tracking-widest">MIEMBRO #{memberStr}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#AA0000] gap-6 px-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/NinerEmpireMX.png" alt="Niner Empire México" className="w-40 h-auto" />
      <div className="text-7xl">✅</div>
      <h1 className="text-white text-4xl font-black text-center tracking-wide uppercase">
        ¡Visita Registrada!
      </h1>
      <p className="text-[#B3995D] text-2xl font-bold text-center">{result?.nombre}</p>
      <div className="bg-black/30 rounded-2xl px-8 py-4 text-center">
        <p className="text-[#B3995D] text-sm font-bold tracking-widest uppercase">Visita número</p>
        <p className="text-white text-6xl font-black">{result?.totalVisits}</p>
      </div>
      <p className="text-[#D4B878] text-sm tracking-widest">MIEMBRO #{memberStr}</p>
      <p className="text-white/60 text-sm text-center mt-4">
        #FaithfulForever — Niner Empire México
      </p>
    </main>
  )
}
