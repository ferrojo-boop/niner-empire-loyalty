'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FanFormData, FormStep } from '@/lib/types'
import { ProgressBar } from './ProgressBar'
import { StepFanData } from './StepFanData'
import { StepTrivia } from './StepTrivia'
import { StepCamera } from './StepCamera'
import { StepSummary } from './StepSummary'

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
  const [triviaDone, setTriviaDone] = useState(false)
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
    <div className="form-card">
      <h2>Obtén tu membresía digital sin costo</h2>
      <p className="lead">Regístrate en menos de 2 minutos y genera tu tarjeta digital de fan.</p>

      <ProgressBar currentStep={step} />

      {step === 1 && (
        <StepFanData
          data={data}
          onChange={handleChange}
          onNext={() => setStep(triviaDone ? 4 : 2)}
        />
      )}
      {step === 2 && (
        <StepTrivia
          onCorrect={() => {
            setTriviaDone(true)
            setStep(3)
          }}
        />
      )}
      {step === 3 && <StepCamera data={data} onChange={handleChange} onNext={() => setStep(4)} />}
      {step === 4 && (
        <StepSummary
          data={data}
          onEditData={() => setStep(1)}
          onEditPhoto={() => setStep(3)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  )
}
