const fs = require('fs');
const data = require('./packages_export.json');
const packages = data.map(r => ({
  ...r.data,
  id: r.id,
  category: r.category ?? 'group',
  status: r.status ?? 'approved',
  agencyId: r.agency_id ?? null,
  featured: r.featured ?? false,
  featuredOrder: r.featured_order ?? 0,
  hidden: r.hidden ?? false,
}));
fs.writeFileSync('./lib/packages-data.js', `export const ALL_PACKAGES = ${JSON.stringify(packages, null, 2)};\n`);
console.log('Converted to lib/packages-data.js');
