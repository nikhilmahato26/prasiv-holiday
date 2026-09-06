const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('Our Most Beautiful <span style={{ color: \'#7e5233\' }}>Destinations</span>', 'Our Featured <span style={{ color: \'#7e5233\' }}>Categories</span>');
content = content.replace('All Destinations', 'All Categories');

// Remove Homestays Section and Houseboats Section entirely.
// We can use regex to remove them if we find the start and end of those sections.
const hsStart = '{/* ── Homestays ── */}';
const hsEnd = '{/* ── Houseboats ── */}';
const nextSecStart = '{/* ── Why choose us ── */}';

const homestaysRegex = new RegExp(
  hsStart.replace(/[.*+?^$\{\}\(\)|\[\]\\]/g, '\\$&') + '[\\s\\S]*?' + hsEnd.replace(/[.*+?^$\{\}\(\)|\[\]\\]/g, '\\$&')
);

const houseboatsRegex = new RegExp(
  hsEnd.replace(/[.*+?^$\{\}\(\)|\[\]\\]/g, '\\$&') + '[\\s\\S]*?' + nextSecStart.replace(/[.*+?^$\{\}\(\)|\[\]\\]/g, '\\$&')
);

content = content.replace(homestaysRegex, hsEnd + '\n');
content = content.replace(houseboatsRegex, nextSecStart + '\n');
// clean up the hsEnd since we left it above
content = content.replace(hsEnd + '\n', '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Page updated.');
