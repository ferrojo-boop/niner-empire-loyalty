import { PinIcon } from './icons'
import { VenueCountdown } from './VenueCountdown'

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
            <h3>Por confirmar</h3>
            <VenueCountdown />
          </div>
        </div>
      </div>
    </section>
  )
}
