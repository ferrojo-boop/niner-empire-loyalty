import './landing.css'
import { SiteNav } from '@/components/SiteNav'
import { Hero } from '@/components/Hero'
import { Gallery } from '@/components/Gallery'
import { Venue } from '@/components/Venue'
import { Schedule } from '@/components/Schedule'
import { SiteFooter } from '@/components/SiteFooter'

export default function Home() {
  return (
    <div className="landing">
      <SiteNav />
      <Hero />
      <Gallery />
      <Venue />
      <Schedule />
      <SiteFooter />
    </div>
  )
}
