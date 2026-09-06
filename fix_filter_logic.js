const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

const search = `  const shown = packages.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const matchDest = activeDest === 'all' || p.destination === activeDest
    return matchCat && matchDest
  })`;

const replace = `  const shown = packages.filter(p => {
    return activeDest === 'all' || p.destination === activeDest
  })`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Filter logic fixed');
} else {
  console.log('Filter logic not found');
}
