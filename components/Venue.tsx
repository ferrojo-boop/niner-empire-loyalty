import { ArrowUpRightIcon, PinIcon } from './icons'

// El nombre del lugar dice "Polanco", pero el domicilio real está en la colonia
// Anáhuac I Sección. Se muestran los dos para que nadie busque en la colonia
// equivocada, y el botón lleva a la ficha exacta en Google Maps.
const SEDE = {
  nombre: 'Pinche Gringo BBQ Warehouse — Polanco',
  domicilio: 'Lago Iseo 296, Anáhuac I Secc., Miguel Hidalgo, 11320, Ciudad de México',
  mapa: 'https://maps.app.goo.gl/tJA4wACcPyknsoUw6',
}

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
            <h3>{SEDE.nombre}</h3>
            <p className="venue-address">{SEDE.domicilio}</p>
          </div>
          <a
            className="venue-cta"
            href={SEDE.mapa}
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
