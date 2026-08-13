export const CONTACTO = 'ninerempiremx@gmail.com'

/* Fuente única de los tres enlaces sociales: los usan el footer, la píldora
   del menú y el menú móvil, y así no se desincronizan. */
const SOCIALS = [
  {
    key: 'instagram',
    href: 'https://www.instagram.com/niner_empire_mexico/',
    src: '/Instaok.png',
    label: 'Instagram de Niner Empire México',
    externo: true,
  },
  {
    key: 'facebook',
    href: 'https://www.facebook.com/profile.php?id=61581941911570',
    src: '/FBok.png',
    label: 'Facebook de Niner Empire México',
    externo: true,
  },
  {
    key: 'correo',
    href: `mailto:${CONTACTO}`,
    src: '/CORREOok.png',
    label: `Escríbenos a ${CONTACTO}`,
    externo: false,
  },
]

export function SocialLinks({
  className = '',
  role,
  onNavigate,
}: {
  className?: string
  role?: 'menuitem'
  onNavigate?: () => void
}) {
  return (
    <div className={`social-row ${className}`.trim()}>
      {SOCIALS.map((s) => (
        <a
          key={s.key}
          href={s.href}
          aria-label={s.label}
          role={role}
          onClick={onNavigate}
          {...(s.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt="" />
        </a>
      ))}
    </div>
  )
}
