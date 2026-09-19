import { notFound } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EnquiryForm from '@/components/EnquiryForm'
import { getCampaignBySlug } from '@/lib/db'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)
  if (!campaign) return { title: 'Campaign Not Found' }
  
  return {
    title: `${campaign.title || campaign.name} | Prashiv Holiday`,
    description: campaign.description || `Special offer for ${campaign.destination}`
  }
}

export default async function CampaignPage({ params }) {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)
  
  if (!campaign) {
    notFound()
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fdfbf7' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: '75vh', 
        minHeight: 500,
        backgroundColor: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textAlign: 'center',
        padding: '0 20px',
        overflow: 'hidden'
      }}>
        {/* Background Image & Gradient overlay */}
        {campaign.image_url && (
          <img 
            src={campaign.image_url} 
            alt={campaign.title || campaign.name}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, width: '100%' }}>
          {campaign.destination && (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: 20, display: 'inline-block', fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              {campaign.destination}
            </div>
          )}
          
          <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1, textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            {campaign.title || campaign.name}
          </h1>
          
          {campaign.description && (
            <p style={{ fontSize: '1.25rem', maxWidth: 700, margin: '0 auto 32px', opacity: 0.9, lineHeight: 1.5, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {campaign.description}
            </p>
          )}

          {campaign.offer_price && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, backgroundColor: '#C14B00', color: '#fff', padding: '12px 32px', borderRadius: 99, fontSize: '1.75rem', fontWeight: 800, boxShadow: '0 10px 30px rgba(193,75,0,0.4)', border: '2px solid rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.9 }}>Special Price</span>
              {campaign.offer_price}
            </div>
          )}
        </div>
        
        {/* Decorative Wave/Shape at bottom */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, width: '100%' }}>
          <svg viewBox="0 0 1440 120" style={{ display: 'block', width: '100%', height: 'auto', fill: '#fdfbf7' }}>
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Content Section */}
      <section style={{ padding: '60px 20px', flex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40 }}>
          
          {/* Main Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, flex: '1 1 600px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
              
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 24px', color: '#111', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'inline-block', width: 4, height: 24, backgroundColor: '#C14B00', borderRadius: 4 }}></span>
                Package Details
              </h2>
              <div 
                style={{ lineHeight: 1.8, color: '#4b5563', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: campaign.package_details || '<p>Details coming soon...</p>' }}
              />
            </div>

            {campaign.other_information && (
              <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 20px', color: '#111', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ display: 'inline-block', width: 4, height: 20, backgroundColor: '#6b7280', borderRadius: 4 }}></span>
                  Additional Information
                </h3>
                <div 
                  style={{ lineHeight: 1.8, color: '#6b7280', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: campaign.other_information }}
                />
              </div>
            )}
          </div>
          
          {/* Sidebar / Enquiry Form */}
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ position: 'sticky', top: 100, backgroundColor: '#fff', borderRadius: 24, padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Interested?</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Fill out the form and our team will get back to you with more details.</p>
              </div>
              <EnquiryForm pkg={{ id: `campaign-${campaign.slug}`, title: campaign.title || campaign.name }} />
            </div>
          </div>
          
        </div>
      </section>

      <Footer />
    </main>
  )
}
