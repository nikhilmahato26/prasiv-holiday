const fs = require('fs');
const path = require('path');

const dirsToSearch = ['app', 'components', 'lib'];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/\/logo\.jpeg/g, '/logo.png');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDir(dir) {
  if (!fs.existsSync(dir)) return;
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
console.log('Logo paths updated!');
