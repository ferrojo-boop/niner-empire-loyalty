'use client'

import { useEffect, useState } from 'react'
import { StarIcon, XIcon, CheckIcon } from './icons'

const BENEFITS = [
  {
    title: 'Tarjeta digital con QR único',
    body: 'Tu credencial oficial de miembro, lista para mostrar en cada evento del club.',
  },
  {
    title: 'Acceso a watch parties oficiales',
    body: 'Ve los juegos en vivo junto a la Faithful mexicana en sedes del club.',
  },
  {
    title: 'Prioridad para el juego en CDMX',
    body: 'Información e invitaciones anticipadas para 49ers vs Vikings en el Estadio Banorte.',
  },
  {
    title: 'Descuentos con negocios aliados',
    body: 'Promociones exclusivas para socios en tiendas y restaurantes afiliados.',
  },
  {
    title: 'Sorteos y contenido exclusivo',
    body: 'Rifas de mercancía oficial y contenido solo para miembros registrados.',
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
          <p className="sub">Todo esto, sin costo, al registrarte como miembro de Niner Empire México.</p>
          <ul className="benefit-list">
            {BENEFITS.map((b) => (
              <li key={b.title}>
                <span className="ico">
                  <CheckIcon size={14} />
                </span>
                <span className="txt">
                  <b>{b.title}</b>
                  <span>{b.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
