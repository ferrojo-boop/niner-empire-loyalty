import { PinIcon, ArrowUpRightIcon } from './icons'

export function Venue() {
  return (
    <section className="block venue-section" id="sede">
      <div className="venue-bg" style={{ backgroundImage: "url('/stadium.webp')" }} />
      <div className="venue-overlay" />
      <div className="block-inner">
        <div className="block-head">
          <span className="eyebrow">Nuestra Sede</span>
          <h2>Sede</h2>
        </div>
        <div className="venue-card">
          <div className="venue-pin" aria-hidden="true">
            <PinIcon size={28} />
          </div>
          <div className="venue-info">
            <h3>Antisocial Rooftop</h3>
            <p className="venue-address">
              Galerías Insurgentes, Oso 73, 2do piso, Actipan, Benito Juárez, 03230, Ciudad de México
            </p>
            <ul className="venue-hours">
              <li>
                <span className="d">Jue – Sáb</span>
                <span className="h">2:00 PM – 2:00 AM</span>
              </li>
              <li>
                <span className="d">Dom – Mié</span>
                <span className="h">2:00 PM – 10:00 PM</span>
              </li>
            </ul>
          </div>
          <a
            className="venue-cta"
            href="https://maps.app.goo.gl/vVQ1kymn1Cr3n3iM7"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cómo llegar
            <ArrowUpRightIcon size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
