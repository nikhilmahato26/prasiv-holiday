const fs = require('fs');
const filePath = 'components/Navbar.js';
let content = fs.readFileSync(filePath, 'utf8');

const search = `  const navLinks = [
    { label: 'Home',         href: '/' },
    { label: 'Gallery',      href: '/#gallery' },
    { label: 'About',        href: '/#about' },
    { label: 'Contact',      href: '/#contact' },
  ]`;
const replace = `  const navLinks = [
    { label: 'Home',         href: '/' },
    { label: 'Packages',     href: '/#packages' },
    { label: 'Gallery',      href: '/#gallery' },
    { label: 'About',        href: '/#about' },
    { label: 'Contact',      href: '/#contact' },
  ]`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added Packages back to navbar');
} else {
  console.log('navLinks not found in Navbar.js');
}
