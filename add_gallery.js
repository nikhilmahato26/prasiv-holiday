const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = '{/* ── Why us ── */}';

const gallerySection = `{/* ── Gallery ── */}
      <section id="gallery" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7e5233', marginBottom: 10 }}>
              Visual Journey
            </p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 12 }}>
              Explore Our <span style={{ color: '#7e5233' }}>Gallery</span>
            </h2>
            <p style={{ color: '#6b7280', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
              A glimpse into the magical experiences waiting for you.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              "https://images.unsplash.com/photo-1593693397690-362cb96667a0?q=80&w=800",
              "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800",
              "https://images.unsplash.com/photo-1589983846997-04788035bc83?q=80&w=800",
              "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800",
              "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800"
            ].map((src, idx) => (
              <div key={idx} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <img 
                  src={src} 
                  alt={\`Gallery image \${idx + 1}\`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cursor-pointer' }} 
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      `;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, gallerySection + targetStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Gallery section added successfully');
} else {
  console.log('Target section not found');
}
