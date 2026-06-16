'use client'

interface FanCardProps {
  nombre: string
  fanDesde: number
  fanId: string
  photoUrl: string
}

export function FanCard({ nombre, fanDesde, fanId, photoUrl }: FanCardProps) {
  return (
    <div
      id="fan-card"
      style={{
        width: '1012px',
        height: '638px',
        background: 'linear-gradient(135deg, #AA0000 0%, #CC0000 100%)',
        position: 'fixed',
        left: '-9999px',
        top: '0',
        fontFamily: 'Inter, Arial Black, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ background: '#7A0000', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '36px' }}>🏈</span>
        <div>
          <div style={{ color: '#B3995D', fontSize: '22px', fontWeight: '900', letterSpacing: '2px' }}>
            NINER EMPIRE LOYALTY
          </div>
          <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', letterSpacing: '1px' }}>
            San Francisco 49ers
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', padding: '40px', gap: '40px', alignItems: 'center' }}>
        {/* Photo */}
        <img
          src={photoUrl}
          alt={nombre}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '6px solid #B3995D',
            flexShrink: 0,
          }}
          crossOrigin="anonymous"
        />

        {/* Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ color: '#B3995D', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>Nombre</div>
            <div style={{ color: '#ffffff', fontSize: '32px', fontWeight: '900' }}>{nombre}</div>
          </div>
          <div>
            <div style={{ color: '#B3995D', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>Fan desde</div>
            <div style={{ color: '#ffffff', fontSize: '32px', fontWeight: '900' }}>{fanDesde}</div>
          </div>
          <div style={{ color: '#D4B878', fontSize: '18px', fontWeight: '800', letterSpacing: '1px' }}>
            #FAITHFULFOREVER
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1A1A1A', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#B3995D', fontSize: '13px', fontWeight: '700', letterSpacing: '2px' }}>
          NINER EMPIRE LOYALTY
        </span>
        <span style={{ color: '#B3995D', fontSize: '13px', fontWeight: '700', letterSpacing: '1px' }}>
          ID: {fanId}
        </span>
      </div>
    </div>
  )
}
