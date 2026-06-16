import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700', '900'] })

export const metadata: Metadata = {
  title: 'Niner Empire Loyalty',
  description: 'Regístrate como fan oficial de los San Francisco 49ers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
