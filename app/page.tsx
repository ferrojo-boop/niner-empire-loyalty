import { FanForm } from '@/components/FanForm'

export default function Home() {
  return (
    <main className="relative min-h-dvh flex items-center justify-center py-8 bg-black">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/stadium.webp')" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />
      {/* Content */}
      <div className="relative z-10 w-full">
        <FanForm />
      </div>
    </main>
  )
}
