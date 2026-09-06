'use client'
import { CarFront, Car, BusFront } from 'lucide-react'

export default function FleetSummarySection() {
  return (
    <section style={{ padding: '20px 24px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div style={{ 
            background: '#f4f8fe', 
            borderRadius: 16, 
            padding: '32px 20px', 
            textAlign: 'center',
            border: '1px solid #e1eaf7',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dce8f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CarFront size={28} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 4 }}>1-4 People</h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>Swift Dzire · Sedan</p>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ 
            background: '#fffbf0', 
            borderRadius: 16, 
            padding: '32px 20px', 
            textAlign: 'center',
            border: '1px solid #f9eed3',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef1cf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={28} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 4 }}>5-7 People</h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>Innova Crysta · Ertiga</p>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ 
            background: '#f9f5ff', 
            borderRadius: 16, 
            padding: '32px 20px', 
            textAlign: 'center',
            border: '1px solid #efe4fc',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ebd9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BusFront size={28} color="#9333ea" />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 4 }}>8-52 People</h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>Tempo Traveller · Bus</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
