'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { StarIcon, XIcon, CheckIcon } from './icons'

const BENEFITS: { title: string; body: ReactNode; items?: string[] }[] = [
  {
    title: 'Descuentos en negocios afiliados',
    body: 'Muestra tu tarjeta digital y obtén descuentos exclusivos:',
    items: [
      'PGBBQ — descuento especial para miembros',
      'Hard Rock Café Mexico City — descuento especial para miembros',
      'Wyndham Hotel WTC — tarifa preferente en hospedaje',
      'Y más aliados sumándose esta temporada…',
    ],
  },
  {
    title: 'Coleccionables de edición limitada',
    body: 'NO SE COMPRAN, SE GANAN. Asiste a las Watch Party 2026, muestra tu QR al staff, registra tu visita con el QR y desbloquea los 3 pines magnéticos de la temporada.',
    items: ['Pin No. 1 — al llegar a 5 visitas', 'Pin No. 2 — al llegar a 10 visitas', 'Pin No. 3 — al llegar a 15 visitas'],
  },
  {
    title: 'Sorteos',
    body: 'Rifas de mercancía y contenido reservado solo para miembros registrados.',
  },
  {
    title: 'Membresía física metálica',
    body: (
      <>
        Sube de nivel: placa metálica dorada de edición limitada, personalizada con tu QR grabado a
        láser y lanyard en alto relieve. Incluye los mismos beneficios que la digital.{' '}
        <b className="hl">PREGUNTA POR DISPONIBILIDAD</b>
      </>
    ),
  },
]

export function BenefitsButton() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <>
      <button className="benefits-btn" type="button" onClick={() => setOpen(true)}>
        <StarIcon size={16} />
        Ver beneficios
      </button>

      <div
        className={`modal-overlay${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="benefitsTitle"
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false)
        }}
      >
        <div className="modal-card">
          <button className="modal-close" aria-label="Cerrar" onClick={() => setOpen(false)}>
            <XIcon size={18} />
          </button>
          <h3 id="benefitsTitle">Beneficios de tu membresía</h3>
          <p className="sub">Regístrate gratis y activa hoy mismo todos estos beneficios:</p>
          <ul className="benefit-list">
            {BENEFITS.map((b) => (
              <li key={b.title}>
                <span className="ico">
                  <CheckIcon size={14} />
                </span>
                <span className="txt">
                  <b>{b.title}</b>
                  <span>{b.body}</span>
                  {b.items && (
                    <ul className="benefit-sub">
                      {b.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="modal-cta">
            <p>
              Es gratis y toma menos de 2 minutos. Tu tarjeta personalizada la descargas al
              instante.
            </p>
            <a href="#membresia" className="benefits-btn" onClick={() => setOpen(false)}>
              Quiero mi membresía
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
