'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from './icons'

const SLIDES = [
  {
    src: '/IMG_2206.webp',
    alt: 'Decenas de miembros de Niner Empire México posando juntos en el escenario del watch party',
    caption: 'La foto de familia del Empire',
  },
  {
    src: '/IMG_2201.webp',
    alt: 'Dos miembros con jerseys 13 y 23 de los 49ers marcando bíceps en el watch party',
    caption: 'Los del 13 y el 23',
  },
  {
    src: '/IMG_2202.webp',
    alt: 'Pareja abrazada con jerseys rojos 23 y 80 de los San Francisco 49ers',
    caption: 'Pareja Faithful',
  },
  {
    src: '/IMG_2203.webp',
    alt: 'Miembro recibiendo un beso en la mejilla, ambos con jerseys negros de Niner Empire México',
    caption: 'Amor Faithful',
  },
  {
    src: '/IMG_2204.webp',
    alt: 'Tres miembros con dedos de hule de los 49ers levantados alrededor de una mesa',
    caption: 'Dedos de hule y buena vibra',
  },
  {
    src: '/IMG_2205.webp',
    alt: 'Tres miembros posando con jerseys 13 y 23 de los 49ers en el watch party',
    caption: 'En familia con los colores',
  },
  {
    src: '/IMG_2207.webp',
    alt: 'Miembro con máscara de calavera de papel en rojo y dorado, guantes de hule y casco de los 49ers',
    caption: 'La calavera del Empire',
  },
  {
    src: '/IMG_2208.webp',
    alt: 'Pareja sonriendo con jersey 52 y sudadera roja de los 49ers',
    caption: 'Sonrisas en el watch party',
  },
  {
    src: '/IMG_2209.webp',
    alt: 'Miembro detrás del bombo de la porra con el escudo de Niner Empire México, rodeado de banderines',
    caption: 'El tambor que no para',
  },
  {
    src: '/IMG_2210.webp',
    alt: 'Acercamiento al bombo con el logo de los 49ers, el escudo de Niner Empire México y sus baquetas',
    caption: 'El tambor oficial de la porra',
  },
  {
    src: '/IMG_2211.webp',
    alt: 'Miembro con máscara de calavera de papel, jersey 44 y puños de hule rojos frente a los banderines',
    caption: 'Puños listos para el kickoff',
  },
  {
    src: '/IMG_2212.webp',
    alt: 'Parche bordado de Niner Empire México con el puente Golden Gate al fondo',
    caption: 'El parche frente al Golden Gate',
  },
  {
    src: '/IMG_2213.webp',
    alt: 'Tres miembros con playeras de Niner Empire México en una selfie frente al puente Golden Gate',
    caption: 'De México al Golden Gate',
  },
  {
    src: '/IMG_2215.webp',
    alt: 'Dos miembros de espaldas con las capas de Niner Empire México chocando los guantes',
    caption: 'Las capas del Empire',
  },
  {
    src: '/IMG_2216.webp',
    alt: 'Miembro con máscara de calavera levantando un trofeo junto a los estandartes de Niner Empire México',
    caption: 'Levantando el trofeo',
  },
  {
    src: '/IMG_2220.webp',
    alt: 'Cuatro miembros en una selfie con puños de hule de Niner Empire México en alto',
    caption: 'Puños arriba, cheve en mano',
  },
  {
    src: '/IMG_2221.webp',
    alt: 'Tres miembros abrazados con jerseys y playeras de Niner Empire y los 49ers',
    caption: 'Abrazo de la Faithful',
  },
  {
    src: '/IMG_2222.webp',
    alt: 'Grupo de miembros en una mesa del watch party con jerseys de los 49ers',
    caption: 'La mesa de las Faithful',
  },
  {
    src: '/IMG_2223.webp',
    alt: 'Vista amplia de la sede llena de miembros bajo banderines de los 49ers y Niner Empire México',
    caption: 'Sede llena en día de juego',
  },
  {
    src: '/IMG_2224.webp',
    alt: 'Tres miembros posando frente al estandarte de Niner Empire México',
    caption: 'Bajo el estandarte del Empire',
  },
  {
    src: '/IMG_2225.webp',
    alt: 'Miembros siguiendo el partido en la pantalla grande de la sede, rodeados de banderines',
    caption: 'Todos a la pantalla grande',
  },
  {
    src: '/80years.jpg',
    alt: 'San Francisco 49ers — 80 Years Faithful, leyendas del equipo',
    caption: '80 años de historia Niner',
  },
  {
    src: '/stadium.webp',
    alt: "Cancha de Levi's Stadium con el logo de los 49ers",
    caption: "Levi's Stadium — Santa Clara, CA",
  },
]

// Ancho de una foto más el gap de la pista: lo que avanza un paso de flecha.
function stepWidth(track: HTMLElement) {
  const slide = track.children[0]?.getBoundingClientRect().width ?? 0
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0
  return slide + gap || 1
}

// Píxeles por segundo del loop automático: lo bastante lento para leer las
// fotos y lo bastante vivo para notar que se mueve solo.
const AUTOPLAY_SPEED = 55
// Cuánto espera el loop antes de retomar tras una interacción del usuario.
const RESUME_DELAY = 2500

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeDot, setActiveDot] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Parallax del fondo (transform, no background-attachment: fixed —
  // no es confiable en iOS Safari).
  useEffect(() => {
    const bg = bgRef.current
    const section = sectionRef.current
    if (!bg || !section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let ticking = false
    function update() {
      const rect = section!.getBoundingClientRect()
      const offset = rect.top * 0.25
      bg!.style.transform = `translateY(${offset}px)`
      ticking = false
    }
    update()
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    function onScroll() {
      const step = stepWidth(track!)
      setActiveDot(Math.round(track!.scrollLeft / step) % SLIDES.length)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  function pauseAutoplay() {
    pausedRef.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }

  function resumeAutoplay(delay = RESUME_DELAY) {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false
    }, delay)
  }

  // Loop infinito: la pista lleva la lista de fotos duplicada, así que al
  // pasar la mitad del ancho volvemos atrás esa misma mitad y el salto es
  // invisible. Igual al revés, para que la flecha de "anterior" nunca tope.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // La copia mide scrollWidth/2 más medio gap: la pista duplicada tiene un
    // gap menos que dos copias seguidas, y sin ese ajuste el salto se ve.
    let loop = 0
    function measure() {
      const gap = parseFloat(getComputedStyle(track!).columnGap) || 0
      loop = (track!.scrollWidth + gap) / 2
    }
    measure()

    let raf = 0
    let last = performance.now()
    function frame(now: number) {
      const dt = now - last
      last = now
      if (loop > 0) {
        if (!pausedRef.current) {
          track!.scrollLeft += (AUTOPLAY_SPEED * dt) / 1000
        }
        if (track!.scrollLeft >= loop) track!.scrollLeft -= loop
        else if (track!.scrollLeft <= 0) track!.scrollLeft += loop
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Cualquier gesto sobre la galería detiene el loop; se retoma solo cuando
  // el usuario deja de interactuar.
  const trackHandlers = {
    onPointerEnter: pauseAutoplay,
    onPointerLeave: () => resumeAutoplay(600),
    onPointerDown: pauseAutoplay,
    onPointerUp: () => resumeAutoplay(),
    onTouchStart: pauseAutoplay,
    onTouchEnd: () => resumeAutoplay(),
    onWheel: () => {
      pauseAutoplay()
      resumeAutoplay()
    },
    onFocus: pauseAutoplay,
    onBlur: () => resumeAutoplay(),
  }

  function scrollByOne(dir: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    pauseAutoplay()
    resumeAutoplay()
    track.scrollBy({ left: dir * stepWidth(track), behavior: 'smooth' })
  }

  function showLightbox(i: number) {
    setLightboxIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  }

  useEffect(() => {
    if (lightboxIndex === null) {
      resumeAutoplay(600)
      return
    }
    pauseAutoplay()
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? null : (i + 1) % SLIDES.length))
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? null : (i - 1 + SLIDES.length) % SLIDES.length))
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [lightboxIndex])

  const lightboxItem = lightboxIndex === null ? null : SLIDES[lightboxIndex]

  return (
    <section className="block carousel-section" id="galeria" ref={sectionRef}>
      <div className="gallery-bg" ref={bgRef} style={{ backgroundImage: "url('/plays.jpg')" }} />
      <div className="gallery-overlay" />
      <div className="block-inner">
        <div className="block-head">
          <span className="eyebrow">Galería</span>
          <h2>La Familia en Acción</h2>
        </div>
        <div className="carousel-wrap">
          <div className="carousel-track" ref={trackRef} {...trackHandlers}>
            {[...SLIDES, ...SLIDES].map((slide, i) => {
              const index = i % SLIDES.length
              const isClone = i >= SLIDES.length
              return (
                <div
                  key={`${slide.src}-${i}`}
                  className="carousel-slide"
                  role="button"
                  tabIndex={isClone ? -1 : 0}
                  aria-hidden={isClone || undefined}
                  aria-label={`Ver ${slide.caption} en pantalla completa`}
                  onClick={() => showLightbox(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      showLightbox(index)
                    }
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.src}
                    alt={isClone ? '' : slide.alt}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <div className="carousel-cap">{slide.caption}</div>
                </div>
              )
            })}
          </div>
          <div className="carousel-nav">
            <button className="carousel-arrow" aria-label="Anterior" onClick={() => scrollByOne(-1)}>
              <ChevronLeftIcon size={20} />
            </button>
            <div className="carousel-dots">
              {SLIDES.map((slide, i) => (
                <div key={slide.src} className={`dot${i === activeDot ? ' active' : ''}`} />
              ))}
            </div>
            <button className="carousel-arrow" aria-label="Siguiente" onClick={() => scrollByOne(1)}>
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {lightboxItem && (
        <div
          className="lightbox-overlay open"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen de la galería en pantalla completa"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxIndex(null)
          }}
        >
          <button className="lightbox-close" aria-label="Cerrar" onClick={() => setLightboxIndex(null)}>
            <XIcon size={20} />
          </button>
          <button
            className="lightbox-arrow prev"
            aria-label="Imagen anterior"
            onClick={() => setLightboxIndex((i) => (i === null ? null : (i - 1 + SLIDES.length) % SLIDES.length))}
          >
            <ChevronLeftIcon size={24} />
          </button>
          <button
            className="lightbox-arrow next"
            aria-label="Imagen siguiente"
            onClick={() => setLightboxIndex((i) => (i === null ? null : (i + 1) % SLIDES.length))}
          >
            <ChevronRightIcon size={24} />
          </button>
          <figure className="lightbox-figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxItem.src} alt={lightboxItem.alt} />
            <figcaption className="lightbox-cap">{lightboxItem.caption}</figcaption>
          </figure>
        </div>
      )}
    </section>
  )
}
