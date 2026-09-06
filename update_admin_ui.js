const fs = require('fs');

let content = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');

// 1. Remove Package status filter
content = content.replace(
  /\s*<div style=\{\{ width: 1, height: 24, background: '#e5e7eb', margin: '0 4px' \}\} \/>\s*\{\/\* Status filter \*\/\}\s*<div style=\{\{ display: 'flex', gap: 6 \}\}>\s*\{\[\[.*?\]\]\.map\(\(\[v, l, c\]\) => \(\s*<button key=\{v\} onClick=\{\(\) => setPkgStatus\(v\)\} style=\{S\.tag\(pkgStatus === v, c\)\}>\{l\}<\/button>\s*\)\)\}\s*<\/div>/,
  ''
);

// 2. Remove Agency status filter
content = content.replace(
  /\s*\{\/\* Status filter \*\/\}\s*<div style=\{\{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' \}\}>\s*\{\[\[.*?\]\]\.map\(\(\[v, l\]\) => \(\s*<button key=\{v\} onClick=\{\(\) => setAgencyFilter\(v\)\} style=\{S\.tag\(agencyFilter === v\)\}>\{l\}<\/button>\s*\)\)\}\s*<\/div>/,
  ''
);

// 3. Rename Table Headers
content = content.replace(
  /\['Pkg ID', 'Package', 'Category', 'Destination', 'Price', 'Status', 'Hero', 'Visible', 'Actions'\]/,
  "['Pkg ID', 'Package', 'Type', 'Category', 'Price', 'Status', 'Hero', 'Visible', 'Actions']"
);

// 4. Rename 'Category *' to 'Type *'
content = content.replace(
  /<label style=\{S\.label\}>Category \*<\/label>/,
  "<label style={S.label}>Package Type *</label>"
);

// 5. Rename Destination field label to Category
content = content.replace(
  /const fieldLabel = isHS \? 'Homestay' : isHB \? 'Houseboat' : 'Destination'/,
  "const fieldLabel = isHS ? 'Homestay' : isHB ? 'Houseboat' : 'Category'"
);

fs.writeFileSync('app/admin/dashboard/page.js', content, 'utf8');
console.log('Successfully updated UI labels and removed status filters');
