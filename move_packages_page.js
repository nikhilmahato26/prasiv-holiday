const fs = require('fs');
const path = require('path');

const pagePath = 'app/page.js';
const newPageDir = 'app/packages';
const newPagePath = 'app/packages/page.js';
const navPath = 'components/Navbar.js';

if (!fs.existsSync(newPageDir)) {
  fs.mkdirSync(newPageDir, { recursive: true });
}

let pageContent = fs.readFileSync(pagePath, 'utf8');

const pkgSectionStart = '{/* ── Packages ── */}';
const nextSectionStart = '{/* ── Why us ── */}';

const startIndex = pageContent.indexOf(pkgSectionStart);
const endIndex = pageContent.indexOf(nextSectionStart);

if (startIndex !== -1 && endIndex !== -1) {
  const pkgSection = pageContent.substring(startIndex, endIndex);

  // We remove it from app/page.js
  const newPageContent = pageContent.substring(0, startIndex) + pageContent.substring(endIndex);
  fs.writeFileSync(pagePath, newPageContent, 'utf8');

  // We create the new packages page
  const packagesPageTemplate = `'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PackageCard from '@/components/PackageCard'
import { usePackages } from '@/hooks/usePackages'
import { usePhone } from '@/hooks/useSettings'

export default function PackagesPage() {
  const [activeDest, setActiveDest] = useState('all')
  const [destinations, setDestinations] = useState([])
  const { packages, loaded: pkgsLoaded } = usePackages()
  const phone = usePhone()

  useEffect(() => {
    fetch('/api/destinations')
      .then(r => r.ok ? r.json() : [])
      .then(setDestinations)
      .catch(() => {})
  }, [])

  const shown = packages.filter(p => {
    return activeDest === 'all' || p.destination === activeDest
  })

  return (
    <main style={{ minHeight: '100vh', background: '#fff', paddingTop: 80 }}>
      <Navbar />
      
${pkgSection}

      <Footer />
    </main>
  )
}
`;

  fs.writeFileSync(newPagePath, packagesPageTemplate, 'utf8');
  console.log('Packages section moved to /packages successfully.');
} else {
  console.log('Packages section not found.');
}

// Update navbar link
let navContent = fs.readFileSync(navPath, 'utf8');
navContent = navContent.replace("href: '/#packages'", "href: '/packages'");
fs.writeFileSync(navPath, navContent, 'utf8');
console.log('Navbar updated to point to /packages');
