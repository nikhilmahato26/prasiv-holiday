const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'optionalChaining', 'nullishCoalescingOperator']
  });
  console.log("No syntax errors found by Babel.");
} catch (e) {
  console.error("Syntax Error found:");
  console.error(e.message);
}
