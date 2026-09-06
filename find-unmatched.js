const fs = require('fs');
const code = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');
const lines = code.split('\n');

let openTags = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Simple check for { and }
  // Not perfect due to strings, but might give a hint.
}
