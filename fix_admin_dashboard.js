const fs = require('fs');

let content = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');

// 1. Insert handleGalleryUpload and handleDeleteGallery before fetchEnquiries
const missingFuncs = `
  const [galleryUploading, setGalleryUploading] = useState(false)
  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setGalleryUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: data.url }) })
        await fetchGallery()
        toast.success('Image added to gallery')
      } else throw new Error()
    } catch { toast.error('Upload failed') }
    finally { setGalleryUploading(false) }
  }

  const handleDeleteGallery = async (id) => {
    if (!confirm('Delete this image?')) return
    try {
      await fetch('/api/gallery?id=' + id, { method: 'DELETE' })
      await fetchGallery()
      toast.success('Image deleted')
    } catch { toast.error('Delete failed') }
  }
`;
if (!content.includes('handleGalleryUpload')) {
  content = content.replace(
    /const fetchEnquiries = useCallback\(async \(\) => \{/,
    missingFuncs + '\n  const fetchEnquiries = useCallback(async () => {'
  );
}

// 2. Change 'Triphoga Admin' logo area to just the logo
content = content.replace(
  /<div style=\{\{ width: 40, height: 40, overflow: 'hidden', flexShrink: 0 \}\}>\s*<Image src="\/logo\.png" alt="Triphoga" width=\{40\} height=\{40\} style=\{\{ width: '100%', height: '100%', objectFit: 'contain' \}\} \/>\s*<\/div>\s*<div>\s*<div style=\{\{ fontWeight: 700, fontSize: 14, color: '#111', lineHeight: 1 \}\}>Triphoga Admin<\/div>\s*<\/div>/g,
  `<Image src="/logo.png" alt="Triphoga" width={140} height={45} style={{ objectFit: 'contain' }} />`
);

// 3. Rename "Destinations" to "Categories" in text
content = content.replace(
  />Destinations<\/h2>/g,
  '>Categories</h2>'
);
content = content.replace(
  /Add Destination<\/label>/g,
  'Add Category</label>'
);
content = content.replace(
  />Add Destination/g,
  '>Add Category'
);
content = content.replace(
  /Existing Destinations/g,
  'Existing Categories'
);
content = content.replace(
  /Manage Destinations/g,
  'Manage Categories'
);
content = content.replace(
  /No destinations yet/g,
  'No categories yet'
);
content = content.replace(
  /Add destinations to organise/g,
  'Add categories to organise'
);
content = content.replace(
  /Destination Visibility/g,
  'Category Visibility'
);
content = content.replace(
  /Destination name is required/g,
  'Category name is required'
);
content = content.replace(
  /Destination added!/g,
  'Category added!'
);
content = content.replace(
  /Destination updated!/g,
  'Category updated!'
);
content = content.replace(
  /Destination deleted/g,
  'Category deleted'
);
content = content.replace(
  /Destination shown on website/g,
  'Category shown on website'
);
content = content.replace(
  /Destination hidden from website/g,
  'Category hidden from website'
);
// Also rename in the sidebar logic if it renders 'Destinations' anywhere else, though the sidebar already says 'Categories'.
content = content.replace(
  /> Destinations/g,
  '> Categories'
);
// For the modal title
content = content.replace(
  /setModal\('destination'\).*?>\s*<MapPin size=\{13\} \/> Categories/g,
  "setModal('destination')} style={S.btn('#f3f4f6', '#555')}>\n                  <MapPin size={13} /> Categories"
);

fs.writeFileSync('app/admin/dashboard/page.js', content, 'utf8');

console.log('Fixed missing gallery handlers, updated admin logo, and renamed Destinations to Categories in UI text');
