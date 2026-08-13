'use client'

import { useEffect, useRef, useState } from 'react'
import { MenuIcon, XIcon } from './icons'
import { SocialLinks } from './SocialLinks'

const LINKS = [
  { href: '#membresia', label: 'Membresía' },
  { href: '#galeria', label: 'Galería' },
  { href: '#sede', label: 'Sede' },
  { href: '#calendario', label: 'Calendario' },
]

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
        <SocialLinks className="nav-social" />
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
        <SocialLinks className="mobile-menu-social" role="menuitem" onNavigate={() => setOpen(false)} />
      </div>
    </>
  )
}
