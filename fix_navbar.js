const fs = require('fs');
const filePath = 'components/Navbar.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update navLinks
const navLinksSearch = `  const navLinks = [
    { label: 'Home',         href: '/' },
    { label: 'Destinations', href: '/#destinations' },
    { label: 'Homestays',    href: '/#homestays' },
    { label: 'Houseboats',   href: '/#houseboats' },
    { label: 'Packages',     href: '/#packages' },
    { label: 'About',        href: '/#about' },
    { label: 'Contact',      href: '/#contact' },
  ]`;
const navLinksReplace = `  const navLinks = [
    { label: 'Home',         href: '/' },
    { label: 'Gallery',      href: '/#gallery' },
    { label: 'About',        href: '/#about' },
    { label: 'Contact',      href: '/#contact' },
  ]`;
content = content.replace(navLinksSearch, navLinksReplace);

// 2. Update navbar background style
const navStyleSearch = `        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',`;
const navStyleReplace = `        background: 'rgba(255,255,255,1)',
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        borderBottom: '1px solid rgba(0,0,0,0.06)',`;
content = content.replace(navStyleSearch, navStyleReplace);

// 3. Update brand text color
const brandColorSearch = `style={{ fontFamily: 'Poppins, sans-serif', color: scrolled ? '#153e2d' : '#fff' }}`;
const brandColorReplace = `style={{ fontFamily: 'Poppins, sans-serif', color: '#153e2d' }}`;
content = content.replace(brandColorSearch, brandColorReplace);

// 4. Update link text color
const linkColorSearch = `style={{ color: scrolled ? '#374151' : 'rgba(255,255,255,0.9)' }}`;
const linkColorReplace = `style={{ color: '#374151' }}`;
content = content.replace(linkColorSearch, linkColorReplace);

// 5. Update call button styling
const callBtnSearch = `style={{ borderColor: scrolled ? '#7e5233' : 'rgba(255,255,255,0.6)', color: scrolled ? '#7e5233' : '#fff' }}`;
const callBtnReplace = `style={{ borderColor: '#7e5233', color: '#7e5233' }}`;
content = content.replace(callBtnSearch, callBtnReplace);

// 6. Update hamburger menu color
const menuBtnSearch = `style={{ color: scrolled ? '#374151' : '#fff' }}`;
const menuBtnReplace = `style={{ color: '#374151' }}`;
content = content.replace(menuBtnSearch, menuBtnReplace);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Navbar updated for white background and new links');
