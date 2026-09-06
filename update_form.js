const fs = require('fs');

let adminContent = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');

// 1. Remove Package Type field
adminContent = adminContent.replace(
  /<div>\s*<label style=\{S\.label\}>Package Type \*<\/label>\s*<select value=\{form\.category\} onChange=\{.*?\} style=\{\{ \.\.\.S\.input, cursor: 'pointer' \}\}>\s*\{CATEGORIES\.map.*?\}\s*<\/select>\s*<\/div>/,
  ''
);

// 2. Change Duration to number input
adminContent = adminContent.replace(
  /<input value=\{form\.duration\} onChange=\{e => setForm\(f => \(\{ \.\.\.f, duration: e\.target\.value \}\)\)\} style=\{S\.input\} placeholder="e\.g\. 3 Days & 2 Nights" \/>/,
  '<input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={S.input} placeholder="e.g. 3" min="1" />'
);

// Update default duration from '3 Days & 2 Nights' to '3'
adminContent = adminContent.replace(
  /duration: '3 Days & 2 Nights'/,
  "duration: '3'"
);

fs.writeFileSync('app/admin/dashboard/page.js', adminContent, 'utf8');

// Do the same for agency dashboard if it exists
try {
  let agencyContent = fs.readFileSync('app/agency/dashboard/page.js', 'utf8');
  
  agencyContent = agencyContent.replace(
    /<input value=\{form\.duration\} onChange=\{e => setForm\(f => \(\{ \.\.\.f, duration: e\.target\.value \}\)\)\} style=\{S\.input\} placeholder="e\.g\. 3 Days & 2 Nights" \/>/,
    '<input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={S.input} placeholder="e.g. 3" min="1" />'
  );
  
  agencyContent = agencyContent.replace(
    /duration: '3 Days & 2 Nights'/,
    "duration: '3'"
  );
  
  fs.writeFileSync('app/agency/dashboard/page.js', agencyContent, 'utf8');
} catch (e) {
  console.log('Agency dashboard skipped or not found');
}

console.log('Successfully updated package type and duration');
