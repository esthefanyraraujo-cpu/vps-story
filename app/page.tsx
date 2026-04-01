import { LandingHero } from '@/components/landing/hero'
import { LandingPlanos } from '@/components/landing/planos'
import { LandingFeatures } from '@/components/landing/features'
import { LandingFAQ } from '@/components/landing/faq'
import { LandingHeader } from '@/components/landing/header'
import { LandingFooter } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingPlanos />
      <LandingFAQ />
      <LandingFooter />
    </main>
  )
}
