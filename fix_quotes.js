const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

const search = '"{t.text}"';
const replace = '&quot;{t.text}&quot;';

content = content.replace(search, replace);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed quotes in JSX');
