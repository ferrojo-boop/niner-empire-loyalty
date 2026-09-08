'use client'

import { useEffect, useRef } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
    }
    onTurnstileListo?: () => void
  }
}

let cargaDelScript: Promise<void> | null = null

// El script se carga una sola vez por sesión aunque el componente se monte
// varias veces (el socio puede ir y venir entre pasos del formulario).
function cargarScript(): Promise<void> {
  if (cargaDelScript) return cargaDelScript

  cargaDelScript = new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve()
    const s = document.createElement('script')
    s.src = SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('No se pudo cargar Turnstile'))
    document.head.appendChild(s)
  })

  return cargaDelScript
}

interface Props {
  /** Recibe el token, o null cuando expira y hay que volver a resolver. */
  onToken: (token: string | null) => void
  /**
   * Cambiar este número reinicia el widget y pide un token nuevo. Los tokens
   * son de un solo uso: tras un intento fallido el que había ya está gastado, y
   * sin esto el socio se quedaría atorado reintentando con un token muerto.
   */
  reiniciarEn?: number
}

/**
 * Widget de Cloudflare Turnstile.
 *
 * Si el script no carga —red caída, bloqueador de anuncios— no se renderiza
 * nada y el socio puede seguir: el candado real vive en el servidor, y ahí un
 * registro sin token se rechaza cuando la protección está encendida.
 */
export function TurnstileWidget({ onToken, reiniciarEn = 0 }: Props) {
  const contenedor = useRef<HTMLDivElement>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useEffect(() => {
    if (!SITE_KEY || !contenedor.current) return

    let idWidget: string | null = null
    let cancelado = false
    const el = contenedor.current

    cargarScript()
      .then(() => {
        if (cancelado || !window.turnstile) return
        idWidget = window.turnstile.render(el, {
          sitekey: SITE_KEY,
          theme: 'dark',
          language: 'es',
          callback: (token: string) => onTokenRef.current(token),
          // El token vence a los 5 minutos; al expirar se limpia para que el
          // formulario no mande uno muerto.
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        })
      })
      .catch(() => {
        // Sin widget. El servidor decide.
      })

    return () => {
      cancelado = true
      if (idWidget && window.turnstile) window.turnstile.remove(idWidget)
    }
  }, [reiniciarEn])

  if (!SITE_KEY) return null

  return <div ref={contenedor} className="flex justify-center min-h-[65px]" />
}
