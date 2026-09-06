const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = '{/* ── Gallery ── */}';

const packagesSection = `{/* ── Packages ── */}
      <section id="packages" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7e5233', marginBottom: 10 }}>
              Curated Experiences
            </p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 12 }}>
              Our <span style={{ color: '#7e5233' }}>Packages</span>
            </h2>
            <p style={{ color: '#9ca3af', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Every package includes a day-wise itinerary, accommodation & transfers.
            </p>

            {/* Category tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setActiveDest('all')}
                style={{
                  padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeDest === 'all' ? 'linear-gradient(135deg,#7e5233,#c93d00)' : '#f5f0e8',
                  color: activeDest === 'all' ? '#fff' : '#555',
                }}>
                All Categories
              </button>
              {destinations.map(d => (
                <button
                  key={d.id}
                  onClick={() => setActiveDest(d.name)}
                  style={{
                    padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: activeDest === d.name ? 'linear-gradient(135deg,#7e5233,#c93d00)' : '#f5f0e8',
                    color: activeDest === d.name ? '#fff' : '#555',
                  }}>
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {!pkgsLoaded ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #fbf8f1', borderTop: '3px solid #7e5233', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <style>{\`@keyframes spin { to { transform: rotate(360deg) } }\`}</style>
              <p style={{ fontSize: 14 }}>Loading packages...</p>
            </div>
          ) : shown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
              <p>No packages available for this selection.</p>
              <button onClick={() => { setActiveDest('all') }} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 999, border: 'none', background: '#f5f0e8', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {shown.map(pkg => <PackageCard key={pkg.id} pkg={pkg} phone={phone} />)}
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/packages" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 999, background: '#7e5233', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              View All Packages <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      `;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, packagesSection + targetStr);
  
  // Need to make sure PackageCard and ArrowRight are imported if they were removed
  // Wait, I didn't remove PackageCard or ArrowRight imports when I extracted it, but let's check
  // if `shown` and `pkgsLoaded` are still defined. They were warned as 'unused' in ESLint earlier!
  
  // Wait! In the previous eslint output, 'shown', 'pkgsLoaded', 'PackageCard' were marked as unused!
  // This means they are still defined in app/page.js!
  // Let's just write the file.
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Packages section restored successfully');
} else {
  console.log('Target section not found');
}
