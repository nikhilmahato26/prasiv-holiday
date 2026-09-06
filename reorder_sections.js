const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

// Step 1: Remove Gallery from its current spot
const galleryStart = '{/* ── Gallery ── */}';
const galleryEnd = '{/* ── Why us ── */}';
let gallerySection = '';

const idxGStart = content.indexOf(galleryStart);
const idxGEnd = content.indexOf(galleryEnd);

if (idxGStart !== -1 && idxGEnd !== -1) {
  gallerySection = content.substring(idxGStart, idxGEnd);
  content = content.substring(0, idxGStart) + content.substring(idxGEnd);
}

// Step 2: Remove Agency Section
const agencyStart = '{/* ── Join as Agency ── */}';
const ctaStart = '{/* ── CTA ── */}';
const idxAStart = content.indexOf(agencyStart);
const idxCStart = content.indexOf(ctaStart);

if (idxAStart !== -1 && idxCStart !== -1) {
  content = content.substring(0, idxAStart) + content.substring(idxCStart);
}

// Step 3: Insert Testimonials and Gallery before CTA
const testimonialsSection = `{/* ── Testimonials ── */}
      <section id="testimonials" style={{ padding: '80px 24px', background: '#fbf8f1' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7e5233', marginBottom: 10 }}>
              What They Say
            </p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 12 }}>
              Client <span style={{ color: '#7e5233' }}>Testimonials</span>
            </h2>
            <p style={{ color: '#6b7280', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
              Real stories from our happy travellers.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { name: 'Anjali Sharma', text: 'Triphoga arranged the most beautiful Munnar trip for us. The itinerary was perfectly balanced and the homestay was breathtaking!' },
              { name: 'Rahul Verma', text: 'Our houseboat experience in Alleppey was magical. The team took care of every single detail. Highly recommend their services.' },
              { name: 'Sarah Jenkins', text: 'A completely hassle-free spiritual tour across Kerala. The guides were knowledgeable and everything went extremely smoothly.' }
            ].map((t, idx) => (
              <div key={idx} style={{ background: '#fff', padding: 32, borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />)}
                </div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 24 }}>"{t.text}"</p>
                <div style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>- {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      `;

const newInsert = testimonialsSection + gallerySection;

const idxFinalCStart = content.indexOf(ctaStart);
if (idxFinalCStart !== -1) {
  content = content.substring(0, idxFinalCStart) + newInsert + content.substring(idxFinalCStart);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Sections reordered and Testimonials added');
} else {
  console.log('CTA section not found');
}
