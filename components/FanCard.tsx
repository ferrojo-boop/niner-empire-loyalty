'use client'

interface FanCardProps {
  nombre: string
  fanId: string
  memberNumber: number
  photoUrl: string
  qrDataUrl: string
}

export function FanCard({ nombre, memberNumber, photoUrl, qrDataUrl }: FanCardProps) {
  const memberStr = String(memberNumber).padStart(4, '0')

  return (
    <div
      id="fan-card"
      style={{
        width: '863px',
        height: '1217px',
        position: 'relative',
        backgroundImage: 'url(/Tarjeta.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        fontFamily: 'Inter, Arial, sans-serif',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Foto circular */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl}
        alt={nombre}
        crossOrigin="anonymous"
        style={{
          position: 'absolute',
          top: '134px',
          left: '302px',
          width: '259px',
          height: '259px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: '6px solid #B3995D',
        }}
      />

      {/* Nombre */}
      <div
        style={{
          position: 'absolute',
          top: '425px',
          left: '0',
          width: '863px',
          textAlign: 'center',
          color: '#FFFFFF',
          fontSize: '34px',
          fontWeight: '400',
          letterSpacing: '0.5px',
        }}
      >
        {nombre}
      </div>

      {/* QR Code */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt="QR"
        style={{
          position: 'absolute',
          top: '500px',
          left: '327px',
          width: '209px',
          height: '209px',
        }}
      />

      {/* Número de miembro */}
      <div
        style={{
          position: 'absolute',
          top: '870px',
          right: '62px',
          color: '#B3995D',
          fontSize: '20px',
          fontWeight: '700',
          textAlign: 'right',
          lineHeight: '1.4',
        }}
      >
        <div>Miembro</div>
        <div>{memberStr}</div>
      </div>
    </div>
  )
}
