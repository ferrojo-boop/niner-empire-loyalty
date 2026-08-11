'use client'

interface FanCardProps {
  id?: string
  nombre: string
  fanId: string
  memberNumber: number
  photoUrl: string
  qrDataUrl: string
}

export function FanCard({ id = 'fan-card', nombre, memberNumber, photoUrl, qrDataUrl }: FanCardProps) {
  const memberStr = `NE - MX - ${String(memberNumber).padStart(3, '0')}`

  return (
    <div
      id={id}
      style={{
        width: '889px',
        height: '1921px',
        position: 'relative',
        fontFamily: 'Inter, Arial, sans-serif',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Foto circular (queda detrás del logo SF y de "Faithful") */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl}
        alt={nombre}
        crossOrigin="anonymous"
        style={{
          position: 'absolute',
          top: '579px',
          left: '162px',
          width: '563px',
          height: '563px',
          borderRadius: '50%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />

      {/* QR Code */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt="QR"
        style={{
          position: 'absolute',
          top: '1169px',
          left: '239px',
          width: '409px',
          height: '409px',
          zIndex: 1,
        }}
      />

      {/* Plantilla con recortes transparentes sobre la foto y el QR */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/MembresiaDigital.png"
        alt=""
        crossOrigin="anonymous"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '889px',
          height: '1921px',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Nombre */}
      <div
        style={{
          position: 'absolute',
          top: '1627px',
          left: '125px',
          width: '644px',
          height: '89px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000000',
          fontSize: '40px',
          fontWeight: 800,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textAlign: 'center',
          zIndex: 3,
        }}
      >
        {nombre}
      </div>

      {/* Número de miembro */}
      <div
        style={{
          position: 'absolute',
          top: '1751px',
          left: '126px',
          width: '642px',
          height: '89px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000000',
          fontSize: '40px',
          fontWeight: 800,
          letterSpacing: '1px',
          textAlign: 'center',
          zIndex: 3,
        }}
      >
        {memberStr}
      </div>
    </div>
  )
}
