import { SocialLinks } from './SocialLinks'

export function SiteFooter() {
  return (
    <footer className="landing-footer">
      <SocialLinks className="footer-social" />
      <p>Niner-Empire-México, club de fans de San Francisco 49ers en CDMX</p>
      <a className="footer-privacy" href="/privacidad">
        Aviso de Privacidad
      </a>
    </footer>
  )
}
