const fs = require('fs');
const path = require('path');

const dirsToSearch = ['app', 'components'];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];
const oldLogo = 'https://res.cloudinary.com/dynbpb9u0/image/upload/v1779855779/WhatsApp_Image_2026-05-22_at_15.06.01-removebg-preview_mr6pdc.png';
const newLogo = '/logo.jpeg';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.split(oldLogo).join(newLogo);

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated Logo: ${filePath}`);
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
console.log('Logo Replacement Done!');
