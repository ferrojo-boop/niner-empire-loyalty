/** @type {import('next').NextConfig} */

// Cabeceras de seguridad.
//
// Deliberadamente NO se pone Content-Security-Policy. Una CSP aquí tendría que
// permitir Turnstile, Cloudinary, Supabase, Google Fonts y los scripts en línea
// que genera Next; una mal armada rompe el registro sin avisar, en el navegador
// del socio y no en el build. Vale más no tenerla que tenerla rota.
//
// Tampoco se restringe la cámara: el registro la usa para la foto y el escáner
// de staff para leer el QR. Solo se apagan capacidades que la app nunca usa.
const CABECERAS = [
  // Nadie tiene por qué embeber el sitio. Protege sobre todo /staff, que es la
  // única pantalla con sesión y acciones que escriben.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Evita que el navegador adivine el tipo de un archivo servido desde Storage.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // La URL de la tarjeta lleva el fan_id, que funciona como credencial: no
  // conviene que viaje entera en el Referer hacia sitios de terceros.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Solo capacidades que la app no usa. `camera` se omite a propósito.
  { key: 'Permissions-Policy', value: 'microphone=(), geolocation=(), payment=(), usb=()' },
]

const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: CABECERAS }]
  },
}

export default nextConfig
