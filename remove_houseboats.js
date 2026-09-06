const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<ListingSection[\s\S]*?defaultImg="https:\/\/images\.unsplash\.com\/photo-1602216056096-3b40cc0c9944\?w=800&q=80"\s*\/>/;

if (regex.test(content)) {
  content = content.replace(regex, '');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Removed houseboats section');
} else {
  console.log('Houseboats section not found');
}
