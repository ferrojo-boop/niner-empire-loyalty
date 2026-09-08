import type { Metadata } from 'next'
import { Inter, Anton } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700', '900'] })
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' })

export const metadata: Metadata = {
  title: 'Niner Empire Loyalty',
  description: 'Regístrate como fan oficial de los San Francisco 49ers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={anton.variable}>
      <head>
        {/* El logo de la sede se sirve desde Cloudinary. Son 2.7 KB, así que lo
            caro no es la descarga sino abrir la conexión: DNS más handshake TLS
            con un origen distinto, que en 4G saturada cuesta bastante más que
            transferir el archivo. Con esto el navegador va abriendo esa conexión
            desde el inicio, en vez de pagarla al llegar a la sección Sede.

            Sin crossOrigin a propósito: la etiqueta <img> carga sin CORS, y el
            navegador usa conexiones distintas para CORS y no-CORS —un preconnect
            con crossOrigin abriría la que no se va a usar. */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
