'use client'

import { useEffect, useRef, useState } from 'react'
import { MenuIcon, XIcon } from './icons'

const LINKS = [
  { href: '#membresia', label: 'Membresía' },
  { href: '#galeria', label: 'Galería' },
  { href: '#sede', label: 'Sede' },
  { href: '#calendario', label: 'Calendario' },
]

const INSTAGRAM_URL = 'https://www.instagram.com/niner_empire_mexico/'

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        !menuRef.current?.contains(e.target as Node) &&
        !toggleRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <>
      <nav className="site-nav" aria-label="Navegación principal">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
        <a
          className="nav-ig"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Niner Empire México"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/INSTAGRAM_NINER_EMPIRE_MEXICO.png" alt="" />
        </a>
      </nav>

      <button
        ref={toggleRef}
        className="mobile-nav-toggle"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls="mobileMenu"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <XIcon size={22} /> : <MenuIcon size={22} />}
      </button>

      <div
        ref={menuRef}
        id="mobileMenu"
        className={`mobile-nav-menu${open ? ' open' : ''}`}
        role="menu"
      >
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} role="menuitem" onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        <a
          className="mobile-menu-ig"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/INSTAGRAM_NINER_EMPIRE_MEXICO.png" alt="" />
          Instagram
        </a>
      </div>
    </>
  )
}
