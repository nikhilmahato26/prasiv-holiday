const fs = require('fs');
const path = require('path');

const dirsToSearch = ['app', 'components'];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    // Replace class names
    .replace(/\bsaffron\b/g, 't-brown')
    .replace(/\bnavy\b/g, 't-green')
    // Replace hex colors inline
    .replace(/#e8520a/gi, '#7e5233') // saffron default
    .replace(/#2e3da8/gi, '#153e2d') // navy default
    .replace(/#f0ebe1/gi, '#fbf8f1') // cream default
    .replace(/Green Kerala Trips/g, 'Triphoga')
    .replace(/Green Kerala/g, 'Triphoga');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else {
      if (fileExtensions.includes(path.extname(fullPath))) {
        replaceInFile(fullPath);
      }
    }
  }
}

dirsToSearch.forEach(traverseDir);
// Also update lib files for emails
replaceInFile('lib/email.js');
console.log('Done!');
