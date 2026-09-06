// ─── Static (demo) mode ──────────────────────────────────────────────────────
//
// While no DATABASE_URL is configured, the public read routes serve the bundled
// seed data instead of querying Postgres, so the whole site renders end-to-end
// without a database. Add DATABASE_URL to .env and run `node init.mjs` to seed —
// every route switches to live data on its own, no code change needed.
//
// Static mode is read-only: the admin panel, agency portal and enquiry storage
// all need the database.

import { ALL_PACKAGES } from './packages-data.js'
import { ALL_TESTIMONIALS } from './testimonials-data.js'

export function isStaticMode() {
  return !process.env.DATABASE_URL
}

// Mirrors the settings seeded by initSettingsTable() in lib/db.js.
export const STATIC_SETTINGS = {
  phone: '917796950505',
  whatsapp: '917796950505',
  email: '',
  email2: '',
  facebook_url: '',
  instagram_url: '',
  banner_days: '30',
  admin_recovery_email: '',
  min_dest_packages: '1',
}

// Same filter as getAllPackages().
export function staticPackages() {
  return ALL_PACKAGES.filter(p => p.status === 'approved' && p.hidden !== true)
}

// Same filter and ordering as getFeaturedPackages().
export function staticFeaturedPackages() {
  return staticPackages()
    .filter(p => p.featured === true)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
}

export function staticPackageById(id) {
  return ALL_PACKAGES.find(p => p.id === id) || null
}

// Mirrors the rows seeded by initDestinationsTable() in lib/db.js, so the
// category tabs are identical before and after the database is connected.
// (lib/destinations-data.js is a stale 3-row export kept for legacy components.)
const STATIC_DESTINATIONS = [
  ['Domestic',        '#16294D', 'photo-1593693397690-362cb9666fc2', 'Explore the beauty within your borders', '🇮🇳'],
  ['International',   '#8A6E1C', 'photo-1512453979798-5ea266f8880c', 'Discover exotic destinations around the world', '✈️'],
  ['Spiritual',       '#C9A227', 'photo-1602216056096-3b40cc0c9944', 'Find peace and serenity in sacred places', '🕉️'],
  ['Gujarat',         '#16294D', 'photo-1466442929976-97f336a657be', 'Land of legends, lions, and white sands', '🛕'],
  ['Uttar Pradesh',   '#8A6E1C', 'photo-1524492412937-b28074a5d7da', 'Heartland of culture, heritage, and spirituality', '🕌'],
  ['Uttarakhand',     '#16294D', 'photo-1626621341517-bbf3d9990a23', 'Devbhoomi - the land of gods and mountains', '🏔️'],
  ['Himachal',        '#8A6E1C', 'photo-1544735716-392fe2489ffa', 'Snow-capped peaks and scenic valley highways', '🏔️'],
  ['Jammu Kashmir',   '#16294D', 'photo-1566228015668-4c45dbc4e2f5', 'Paradise on Earth - lakes, gardens, and snow', '❄️'],
  ['North East',      '#8A6E1C', 'photo-1589308078059-be1415eab4c3', 'Unexplored green hills and scenic monasteries', '🎋'],
  ['Bengal & Odisha', '#16294D', 'photo-1558431382-27e303142255', 'Culture, temples, and coastal delta charms', '🌊'],
  ['Kerala',          '#8A6E1C', 'photo-1602216056096-3b40cc0c9944', "God's Own Country - backwaters and hills", '🌴'],
  ['Tamil Nadu',      '#16294D', 'photo-1582510003544-4d00b7f74220', 'Land of monumental temples and rich history', '🛕'],
  ['Goa',             '#8A6E1C', 'photo-1512343879784-a960bf40e7f2', 'Sun-kissed beaches, parties, and heritage', '🏖️'],
  ['Maharashtra',     '#16294D', 'photo-1570168007204-dfb528c6958f', 'Gateway of India, caves, and mountain fortresses', '🏰'],
  ['Karnataka',       '#8A6E1C', 'photo-1580889240912-c39ecefd3d95', 'Palaces, ancient Hampi ruins, and coffee hills', '🏛️'],
].map(([name, color, photo, description, emoji], i) => ({
  id: i + 1,
  name,
  color,
  image_url: `https://images.unsplash.com/${photo}?w=800&q=80`,
  description,
  emoji,
  featured: true,
  image_pos: null,
  created_at: null,
}))

export function staticDestinations() {
  return STATIC_DESTINATIONS
}

export function staticTestimonials() {
  return ALL_TESTIMONIALS
}
