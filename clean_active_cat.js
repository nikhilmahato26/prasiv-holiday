const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/const \[activeCategory, setActiveCategory\] = useState\('all'\)\n/, '');
content = content.replace(/setActiveCategory\('all'\); /g, '');
content = content.replace(/setActiveCategory\(category\)\n/g, '');
content = content.replace(/const selectListing = \(category, name\) => {[\s\S]*?\n  }/, `const selectListing = (category, name) => {
    setActiveDest(name)
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })
  }`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned up activeCategory');
