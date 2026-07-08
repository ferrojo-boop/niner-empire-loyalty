'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FanFormData, FormStep } from '@/lib/types'
import { ProgressBar } from './ProgressBar'
import { StepFanData } from './StepFanData'
import { StepTrivia } from './StepTrivia'
import { StepCamera } from './StepCamera'
import { WarningIcon } from './icons'

const initialData: FanFormData = {
  nombre: '',
  email: '',
  whatsapp: '',
  fanDesde: '',
  photoFile: null,
  photoPreviewUrl: null,
}

export function FanForm() {
  const router = useRouter()
  const [step, setStep] = useState<FormStep>(1)
  const [data, setData] = useState<FanFormData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(partial: Partial<FanFormData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  async function handleSubmit() {
    if (!data.photoFile || data.fanDesde === '') return
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Subir foto
      const photoFormData = new FormData()
      photoFormData.append('photo', data.photoFile)
      photoFormData.append('nombre', data.nombre)

      const uploadRes = await fetch('/api/upload-photo', { method: 'POST', body: photoFormData })
      if (!uploadRes.ok) throw new Error('Error al subir la foto')
      const { url } = await uploadRes.json()

      // 2. Guardar datos del fan
      const submitRes = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          whatsapp: data.whatsapp,
          fanDesde: data.fanDesde,
          urlFoto: url,
        }),
      })
      if (!submitRes.ok) throw new Error('Error al guardar tus datos')
      const { fanId } = await submitRes.json()

      // 3. Ir a la página de la tarjeta
      router.push(`/tarjeta/${fanId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/NinerEmpireMX.png"
          alt="Niner Empire México"
          className="w-52 h-auto mb-2"
        />
        <p className="text-[var(--niners-gold-light)] text-sm font-semibold tracking-widest uppercase">
          Loyalty Program
        </p>
      </div>

      <ProgressBar currentStep={step} />

      <div className="bg-[var(--niners-red)] rounded-2xl p-6 border-2 border-[var(--niners-gold)] shadow-2xl">
        {step === 1 && (
          <StepFanData data={data} onChange={handleChange} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepTrivia onCorrect={() => setStep(3)} />
        )}
        {step === 3 && (
          <StepCamera data={data} onChange={handleChange} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        )}

        {error && (
          <p role="alert" className="mt-4 flex items-center justify-center gap-2 text-[var(--niners-cream)] bg-black/30 rounded-lg px-4 py-2 text-sm font-bold text-center">
            <WarningIcon size={18} className="shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
