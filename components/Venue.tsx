import { ArrowUpRightIcon } from './icons'

// El nombre del lugar dice "Polanco", pero el domicilio real está en la colonia
// Anáhuac I Sección. Se muestran los dos para que nadie busque en la colonia
// equivocada, y el botón lleva a la ficha exacta en Google Maps.
const SEDE = {
  nombre: 'Pinche Gringo BBQ Warehouse — Polanco',
  // Alojado en Cloudinary para poder reemplazarlo sin desplegar. El archivo
  // original sigue en public/PGBBQlogo_header.svg —es idéntico— por si conviene
  // volver a servirlo desde el mismo origen.
  logo: 'https://res.cloudinary.com/dv3rvkvi1/image/upload/v1788826277/PGBBQlogo_header_fwlhko.svg',
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
          {/* El logo sustituye al pin genérico: el SVG ya viene en círculo, así
              que ocupa el mismo hueco sin el fondo dorado del pin. Decorativo
              a propósito —alt vacío— porque el nombre de la sede va al lado y
              un lector de pantalla lo repetiría.

              Se usa <img> y no next/image, como el resto del proyecto: para un
              SVG next/image no optimiza nada salvo activando dangerouslyAllowSVG,
              y aquí no hay qué optimizar —son 2.7 KB. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="venue-logo"
            src={SEDE.logo}
            alt=""
            width={72}
            height={72}
          />
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
