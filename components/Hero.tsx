import { FanForm } from './FanForm'
import { BenefitsButton } from './BenefitsButton'

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: "url('/49ers_80.jpg')" }} />
      <div className="hero-overlay" />
      <div className="hero-inner">
        <div className="hero-badge-col">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="crest"
            src="/NinerEmpireMXok.png"
            alt="Niner Empire México — Official Chapter México City"
          />
          <div className="hero-tagline">
            <span className="line1">Únete a la Familia</span>
            <span className="line2">Niner Empire México</span>
          </div>
          <p className="hero-sub">
            Comunidad de fans de los San Francisco 49ers en CDMX. Con tu membresía accede a
            beneficios exclusivos para los Fieles a la Bahía!
          </p>
          <BenefitsButton />
        </div>

        <div id="membresia">
          <FanForm />
        </div>
      </div>
    </section>
  )
}
