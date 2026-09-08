'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FanFormData, FormStep, SubmitError } from '@/lib/types'
import { compressPhoto } from '@/lib/compressPhoto'
import { fetchConReintento, ErrorDeRed } from '@/lib/fetchConReintento'
import { StepFanData } from './StepFanData'
import { StepTrivia } from './StepTrivia'
import { StepCamera } from './StepCamera'
import { StepSummary } from './StepSummary'

const initialData: FanFormData = {
  nombre: '',
  email: '',
  whatsapp: '',
  fanDesde: '',
  jugadorFavorito: '',
  photoFile: null,
  photoPreviewUrl: null,
}

export function FanForm() {
  const router = useRouter()
  const [step, setStep] = useState<FormStep>(1)
  const [triviaDone, setTriviaDone] = useState(false)
  const [data, setData] = useState<FanFormData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<SubmitError | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  function handleChange(partial: Partial<FanFormData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  async function handleSubmit() {
    if (!data.photoFile || data.fanDesde === '') return
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Subir foto, ya aligerada: la que entrega la cámara pesa varios MB y
      // ni la tarjeta ni el escáner del staff necesitan tanto.
      const foto = await compressPhoto(data.photoFile)

      const photoFormData = new FormData()
      photoFormData.append('photo', foto)
      photoFormData.append('nombre', data.nombre)

      const uploadRes = await fetchConReintento('/api/upload-photo', {
        method: 'POST',
        body: photoFormData,
      })
      if (!uploadRes.ok) throw new Error('Error al subir la foto')
      const { url } = await uploadRes.json()

      // 2. Guardar datos del fan
      const submitRes = await fetchConReintento('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          whatsapp: data.whatsapp,
          fanDesde: data.fanDesde,
          jugadorFavorito: data.jugadorFavorito,
          urlFoto: url,
          turnstileToken,
        }),
      })
      // El correo ya tenía membresía. No es un fallo que se arregle
      // reintentando, así que en vez de dejar el botón listo para otra vuelta se
      // le ofrece el enlace a la tarjeta que ya existe.
      if (submitRes.status === 409) {
        const { fanId: existente } = await submitRes.json()
        setError({
          mensaje: 'Ya tienes una membresía registrada con este correo.',
          fanId: existente ?? undefined,
        })
        setIsSubmitting(false)
        return
      }

      if (!submitRes.ok) throw new Error('Error al guardar tus datos')
      const { fanId } = await submitRes.json()

      // 3. Ir a la página de la tarjeta
      router.push(`/tarjeta/${fanId}`)
    } catch (err) {
      // Se separa la caída de red del error de verdad: "Error al guardar tus
      // datos" suena a que los datos están mal y el socio los revisa en vano,
      // cuando lo único que pasó es que se cayó la señal. Y hay que decirle
      // que no perdió lo que ya escribió, porque el formulario lo conserva.
      setError({
        mensaje:
          err instanceof ErrorDeRed
            ? 'Se interrumpió la conexión. Revisa tu señal y vuelve a intentarlo: tus datos y tu foto siguen aquí.'
            : err instanceof Error
              ? err.message
              : 'Error inesperado',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-card">
      <h2>Obtén tu membresía digital sin costo</h2>
      <p className="lead">Regístrate en menos de 2 minutos y genera tu tarjeta digital de fan.</p>

      {step === 1 && (
        <StepFanData
          data={data}
          onChange={handleChange}
          onNext={() => setStep(triviaDone ? 4 : 2)}
        />
      )}
      {step === 2 && (
        <StepTrivia
          data={data}
          onChange={handleChange}
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
          onTurnstileToken={setTurnstileToken}
        />
      )}

      <p className="recover-link">
        ¿Extraviaste tu tarjeta digital?{' '}
        <a href="/recuperar">Haz clic aquí para recuperarla</a>
      </p>
    </div>
  )
}
