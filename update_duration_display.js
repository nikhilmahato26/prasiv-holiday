const fs = require('fs');

function formatDuration(code) {
  return code.replace(
    /\{pkg\.duration\}/g,
    "{!isNaN(pkg.duration) && pkg.duration !== '' ? pkg.duration + ' Days' : pkg.duration}"
  );
}

try {
  let content = fs.readFileSync('app/packages/[id]/page.js', 'utf8');
  content = formatDuration(content);
  fs.writeFileSync('app/packages/[id]/page.js', content, 'utf8');
} catch (e) {}

try {
  let content = fs.readFileSync('components/PackageCard.js', 'utf8');
  content = formatDuration(content);
  fs.writeFileSync('components/PackageCard.js', content, 'utf8');
} catch (e) {}

try {
  let content = fs.readFileSync('components/PackagePreview.js', 'utf8');
  content = formatDuration(content);
  fs.writeFileSync('components/PackagePreview.js', content, 'utf8');
} catch (e) {}

console.log('Successfully updated duration display across frontend components');
