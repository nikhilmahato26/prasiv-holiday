'use client'
import Navbar from '@/components/revamp/Navbar'
import Hero from '@/components/revamp/Hero'
import About from '@/components/revamp/About'
import Services from '@/components/revamp/Services'
import Packages from '@/components/revamp/Packages'
import Destinations from '@/components/revamp/Destinations'
import Contact from '@/components/revamp/Contact'
import Footer from '@/components/revamp/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#fff', overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <Packages />
      <About />
      <Services />
      <Destinations />
      <Contact />
      <Footer />
      <FloatingWhatsApp />
    </main>
  )
}
