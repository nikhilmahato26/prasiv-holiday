const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

const search = `            </div> => (`;

const replace = `            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {shown.map(pkg => <PackageCard key={pkg.id} pkg={pkg} phone={phone} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Why us ── */}
      <section id="about" style={{ padding: '80px 24px', background: '#fbf8f1' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 56, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7e5233', marginBottom: 12 }}>Why Triphoga</p>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 16, lineHeight: 1.1 }}>
                Travel <span style={{ color: '#7e5233' }}>Thoughtfully</span>
              </h2>
              <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
                We&apos;re not just a travel company — we&apos;re a community of explorers who believe tourists deserve more than a postcard visit.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: Star,   t: 'Curated Packages', d: 'Every detail handpicked' },
                  { icon: Clock,  t: 'Day-wise Plans',   d: 'Hour by hour clarity' },
                  { icon: Shield, t: 'Safe Travels',     d: 'Verified accommodations' },
                  { icon: Users,  t: 'Small Groups',     d: 'Intimate experiences' },
                ].map(({ icon: I, t, d }) => (`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed syntax error');
} else {
  console.log('Search string not found');
}
