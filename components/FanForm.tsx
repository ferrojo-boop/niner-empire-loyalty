'use client'

import { useState } from 'react'
import { FanFormData, FormStep } from '@/lib/types'
import { ProgressBar } from './ProgressBar'
import { StepFanData } from './StepFanData'
import { StepTrivia } from './StepTrivia'
import { StepCamera } from './StepCamera'
import { FanCard } from './FanCard'
import { generateAndDownloadCard } from '@/lib/generateCard'

const initialData: FanFormData = {
  nombre: '',
  email: '',
  whatsapp: '',
  fanDesde: '',
  photoFile: null,
  photoPreviewUrl: null,
}

export function FanForm() {
  const [step, setStep] = useState<FormStep>(1)
  const [data, setData] = useState<FanFormData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fanId, setFanId] = useState<string | null>(null)
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleChange(partial: Partial<FanFormData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  async function handleSubmit() {
    if (!data.photoFile || data.fanDesde === '') return
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Upload photo
      const photoFormData = new FormData()
      photoFormData.append('photo', data.photoFile)
      photoFormData.append('nombre', data.nombre)

      const uploadRes = await fetch('/api/upload-photo', { method: 'POST', body: photoFormData })
      if (!uploadRes.ok) throw new Error('Error al subir la foto')
      const { url } = await uploadRes.json()
      setUploadedPhotoUrl(url)

      // 2. Submit fan data
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
      const { fanId: id } = await submitRes.json()
      setFanId(id)

      // 3. Generate card (after state updates render FanCard into DOM)
      await new Promise((resolve) => setTimeout(resolve, 300))
      await generateAndDownloadCard(data.nombre)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {/* 49ers header */}
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
          <p className="mt-4 text-red-300 text-sm font-bold text-center">{error}</p>
        )}
      </div>

      {/* Hidden card for generation — only rendered after fanId is set */}
      {fanId && uploadedPhotoUrl && (
        <FanCard
          nombre={data.nombre}
          fanDesde={data.fanDesde as number}
          fanId={fanId}
          photoUrl={uploadedPhotoUrl}
        />
      )}
    </div>
  )
}
