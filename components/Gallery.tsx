'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from './icons'

const SLIDES = [
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

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
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
      const width = track!.children[0]?.getBoundingClientRect().width ?? 1
      setActiveDot(Math.round(track!.scrollLeft / width))
    }
    track.addEventListener('scroll', onScroll)
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  function scrollByOne(dir: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    const width = track.children[0]?.getBoundingClientRect().width ?? 0
    track.scrollBy({ left: dir * (width + 20), behavior: 'smooth' })
  }

  function showLightbox(i: number) {
    setLightboxIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  }

  useEffect(() => {
    if (lightboxIndex === null) return
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
          <div className="carousel-track" ref={trackRef}>
            {SLIDES.map((slide, i) => (
              <div
                key={slide.src}
                className="carousel-slide"
                role="button"
                tabIndex={0}
                aria-label={`Ver ${slide.caption} en pantalla completa`}
                onClick={() => showLightbox(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    showLightbox(i)
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.src} alt={slide.alt} />
                <div className="carousel-cap">{slide.caption}</div>
              </div>
            ))}
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
