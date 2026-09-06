const fs = require('fs');

let content = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');

// 1. Add ImageIcon to lucide-react imports
content = content.replace(
  /Star, Home, Ship,/,
  'Star, Home, Ship, ImageIcon, Trash,'
);

// 2. Add Gallery tab
content = content.replace(
  /{ key: 'enquiries',\s+label: 'Enquiries',\s+icon: Inbox,[\s\S]*?},/,
  match => match + `\n              { key: 'gallery',       label: 'Gallery',      icon: ImageIcon },`
);

// 3. Remove package filters and approve buttons
// We will replace the status filter map
content = content.replace(
  /\{\[\['all','All','#6b7280'\],\s*\['approved','Approved','#22c55e'\],\s*\['pending','Pending','#f59e0b'\],\s*\['rejected','Rejected','#ef4444'\]\]\.map\(\(\[v, l, c\]\).*?\)\}/g,
  `{ /* Status filters removed */ }`
);

// Remove agency approve buttons
content = content.replace(
  /\{agency\.status !== 'approved' && \([\s\S]*?\)\}/g,
  `{ /* Agency approve removed */ }`
);

// Remove package approve/reject buttons
content = content.replace(
  /<button onClick=\{\(\) => handleApprove\(pkg\.id, 'approved'\)\}[\s\S]*?Reject\n\s*<\/button>/g,
  `{ /* Package approve/reject removed */ }`
);

// Add states
content = content.replace(
  /const \[loaded, setLoaded\] = useState\(false\)/,
  `const [loaded, setLoaded] = useState(false)\n  const [gallery, setGallery] = useState([])\n  const [galleryUploading, setGalleryUploading] = useState(false)`
);

// Add fetch
content = content.replace(
  /fetch\('\/api\/settings'\)[\s\S]*?\.then\(setSettingsForm\)/,
  match => match + `\n      fetch('/api/gallery').then(r => r.ok ? r.json() : []).then(setGallery)`
);

// Add delete & upload functions
const galleryFuncs = `
  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setGalleryUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        const addRes = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: data.url })
        })
        const newImg = await addRes.json()
        setGallery(prev => [newImg, ...prev])
        toast.success('Image added to gallery')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (err) {
      toast.error('Failed to upload image')
    } finally {
      setGalleryUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteGallery = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      const res = await fetch(\`/api/gallery/\${id}\`, { method: 'DELETE' })
      if (res.ok) {
        setGallery(prev => prev.filter(img => img.id !== id))
        toast.success('Image deleted')
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    }
  }
`;

content = content.replace(
  /const fetchEnquiries = useCallback\(\(silent = false\) => \{/,
  galleryFuncs + '\n  const fetchEnquiries = useCallback((silent = false) => {'
);

// Add Gallery Section Renderer
const galleryRender = `
        {section === 'gallery' && (
          <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Gallery Images</h1>
                <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Manage images shown in the landing page gallery section.</p>
              </div>
              <div style={{ position: 'relative' }}>
                <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={galleryUploading}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: galleryUploading ? 'not-allowed' : 'pointer' }} />
                <button disabled={galleryUploading} style={{ ...S.btn('#fbf8f1', '#7e5233'), display: 'flex', alignItems: 'center', gap: 6 }}>
                  {galleryUploading ? <span style={{ width: 14, height: 14, border: '2px solid #e5dbce', borderTop: '2px solid #7e5233', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                  Add Image
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {gallery.map(img => (
                <div key={img.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img src={img.image_url} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => handleDeleteGallery(img.id)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash size={14} />
                  </button>
                </div>
              ))}
              {gallery.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#fbf8f1', borderRadius: 16, color: '#9ca3af' }}>
                  No images in gallery yet.
                </div>
              )}
            </div>
          </div>
        )}
`;

content = content.replace(
  /\{section === 'settings' && \(/,
  galleryRender + "\n        {section === 'settings' && ("
);

// We need to disable the `pkgStatus` filtering completely. 
content = content.replace(
  /const filteredPackages = allPackages\.filter\(p => \{\n\s*if \(pkgFilter !== 'all'\) \{[\s\S]*?return true\n\s*\}\)/g,
  `const filteredPackages = allPackages.filter(p => {
    if (pkgFilter !== 'all') {
      if (pkgFilter === 'group' && p.category !== 'group') return false
      if (pkgFilter === 'homestay' && p.category !== 'homestay') return false
      if (pkgFilter === 'other' && p.category !== 'other') return false
    }
    return true
  })`
);

// Actually in original, it is:
/*
  const filteredPackages = allPackages.filter(p => {
    if (pkgFilter !== 'all') { ... }
    if (pkgStatus !== 'all' && p.status !== pkgStatus) return false
    ...
*/
// We can just find `if (pkgStatus !== 'all' && p.status !== pkgStatus) return false` and remove it.
content = content.replace(/if \(pkgStatus !== 'all' && p\.status !== pkgStatus\) return false/g, '');


fs.writeFileSync('app/admin/dashboard/page.js', content, 'utf8');
console.log('Successfully updated app/admin/dashboard/page.js');
