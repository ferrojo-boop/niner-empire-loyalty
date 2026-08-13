interface Game {
  wk: number
  date?: string
  time?: string
  opp?: string
  venue?: string
  loc?: 'home' | 'away'
  feature?: boolean
  bye?: boolean
  pre?: boolean
}

// Horarios convertidos a tiempo de Ciudad de México (UTC-6 todo el año).
// La pretemporada arranca a las 6:00/7:00/5:00 PM del Pacífico, que en agosto
// va en UTC-7, así que a CDMX se le suma una hora.
const GAMES: Game[] = [
  { wk: 1, pre: true, date: '13 Ago', time: '7:00 PM', opp: 'Tennessee Titans', venue: "Levi's Stadium", loc: 'home' },
  { wk: 2, pre: true, date: '20 Ago', time: '8:00 PM', opp: 'Los Angeles Chargers', venue: 'Inglewood, CA', loc: 'away' },
  { wk: 3, pre: true, date: '27 Ago', time: '6:00 PM', opp: 'Las Vegas Raiders', venue: 'Las Vegas, NV', loc: 'away' },
  { wk: 1, date: '10 Sep', time: '6:35 PM', opp: 'Los Angeles Rams', venue: 'Melbourne, Australia', loc: 'away' },
  { wk: 2, date: '20 Sep', time: '2:25 PM', opp: 'Miami Dolphins', venue: "Levi's Stadium", loc: 'home' },
  { wk: 3, date: '27 Sep', time: '2:05 PM', opp: 'Arizona Cardinals', venue: "Levi's Stadium", loc: 'home' },
  { wk: 4, date: '4 Oct', time: '2:25 PM', opp: 'Denver Broncos', venue: "Levi's Stadium", loc: 'home' },
  { wk: 5, date: '11 Oct', time: '2:25 PM', opp: 'Seattle Seahawks', venue: 'Seattle, WA', loc: 'away' },
  { wk: 6, date: '19 Oct', time: '6:15 PM', opp: 'Washington Commanders', venue: "Levi's Stadium", loc: 'home' },
  { wk: 7, date: '25 Oct', time: '11:00 AM', opp: 'Atlanta Falcons', venue: 'Atlanta, GA', loc: 'away' },
  { wk: 8, bye: true },
  { wk: 9, date: '8 Nov', time: '3:05 PM', opp: 'Las Vegas Raiders', venue: "Levi's Stadium", loc: 'home' },
  { wk: 10, date: '15 Nov', time: '3:25 PM', opp: 'Dallas Cowboys', venue: 'Dallas, TX', loc: 'away' },
  { wk: 11, date: '22 Nov', time: '7:20 PM', opp: 'Minnesota Vikings', venue: 'Estadio Banorte, CDMX', loc: 'home', feature: true },
  { wk: 12, date: '29 Nov', time: '3:25 PM', opp: 'Seattle Seahawks', venue: "Levi's Stadium", loc: 'home' },
  { wk: 13, date: '6 Dic', time: '12:00 PM', opp: 'New York Giants', venue: 'East Rutherford, NJ', loc: 'away' },
  { wk: 14, date: '13 Dic', time: '3:25 PM', opp: 'Los Angeles Rams', venue: "Levi's Stadium", loc: 'home' },
  { wk: 15, date: '17 Dic', time: '7:15 PM', opp: 'Los Angeles Chargers', venue: 'Inglewood, CA', loc: 'away' },
  { wk: 16, date: '27 Dic', time: '3:25 PM', opp: 'Kansas City Chiefs', venue: 'Kansas City, MO', loc: 'away' },
  { wk: 17, date: '3 Ene', time: '7:20 PM', opp: 'Philadelphia Eagles', venue: "Levi's Stadium", loc: 'home' },
  { wk: 18, date: 'Por confirmar', opp: 'Arizona Cardinals', venue: 'Glendale, AZ', loc: 'away' },
]

function GameRow({ game }: { game: Game }) {
  if (game.bye) {
    return (
      <div className="game-row bye">
        <div className="wk">
          {game.wk}
          <span>Sem</span>
        </div>
        <div className="date">—</div>
        <div className="opp">
          <span className="name">Semana de descanso</span>
        </div>
        <span className="tag bye">Bye</span>
      </div>
    )
  }

  const prefix = game.loc === 'home' ? 'vs' : '@'
  const venueLabel = game.feature ? `🇲🇽 ${game.venue}` : game.venue
  const rowClass = `game-row ${game.loc}${game.feature ? ' feature' : ''}`
  const tagClass = game.feature ? 'mx' : game.loc
  const tagLabel = game.feature ? 'CDMX' : game.loc === 'home' ? 'Local' : 'Visita'

  return (
    <div
      className={rowClass}
      style={
        game.feature
          ? {
              backgroundImage:
                "linear-gradient(100deg, rgba(15,7,5,0.82), rgba(15,7,5,0.6)), url('/VolvemosACasa.jpeg')",
            }
          : undefined
      }
    >
      <div className="wk">
        {game.wk}
        <span>{game.pre ? 'Pre' : 'Sem'}</span>
      </div>
      <div className="date">
        {game.date}
        {game.time && <span className="time">{game.time}</span>}
      </div>
      <div className="opp">
        <span className="name">
          {prefix} {game.opp}
        </span>
        <span className={game.feature ? 'venue mx' : 'venue'}>{venueLabel}</span>
      </div>
      <span className={`tag ${tagClass}`}>{tagLabel}</span>
    </div>
  )
}

export function Schedule() {
  return (
    <section className="block schedule-section" id="calendario">
      <div className="block-inner">
        <div className="block-head">
          <span className="eyebrow">Temporada 2026</span>
          <h2>Calendario de Juegos</h2>
        </div>

        <div
          className="mx-spotlight"
          style={{
            backgroundImage:
              "linear-gradient(100deg, rgba(15,7,5,0.8), rgba(15,7,5,0.55)), url('/VolvemosACasa.jpeg')",
          }}
        >
          <span className="flag">🇲🇽</span>
          <div className="copy">
            <b>Semana 11 — ¡Los 49ers juegan en casa!</b>
            <span>49ers vs. Vikings · Estadio Banorte, Ciudad de México · 22 de noviembre · 7:20 PM (hora CDMX)</span>
          </div>
        </div>

        <div className="schedule-list">
          {GAMES.map((game) => (
            <GameRow key={`${game.pre ? 'pre' : 'reg'}-${game.wk}`} game={game} />
          ))}
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--niners-cream)', opacity: 0.55, marginTop: '14px' }}>
          Horarios en tiempo de Ciudad de México (UTC-6). Sujetos a cambio por la NFL.
        </p>
      </div>
    </section>
  )
}
