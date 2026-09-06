import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { ALL_PACKAGES as SEED_PACKAGES } from './packages-data.js'

neonConfig.webSocketConstructor = ws
neonConfig.poolQueryViaFetch = true

let _pool = null

function getPool() {
  if (!_pool) _pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return _pool
}

// ─── Packages ────────────────────────────────────────────────────────────────

export async function initDB() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS packages (
      id            TEXT PRIMARY KEY,
      data          JSONB NOT NULL,
      category      TEXT NOT NULL DEFAULT 'group',
      status        TEXT NOT NULL DEFAULT 'approved',
      agency_id     INT,
      featured      BOOLEAN NOT NULL DEFAULT false,
      featured_order INT NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'group'`)
  await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'`)
  await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS agency_id INT`)
  await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false`)
  await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS featured_order INT NOT NULL DEFAULT 0`)
  await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ`)
  await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS featured_days INT NOT NULL DEFAULT 30`)
  await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false`)
}

function mergePackageRow(r) {
  return {
    ...r.data,
    id: r.id,
    category: r.category ?? 'group',
    status: r.status ?? 'approved',
    agencyId: r.agency_id ?? null,
    featured: r.featured ?? false,
    featuredOrder: r.featured_order ?? 0,
    featuredAt: r.featured_at ?? null,
    featuredDays: r.featured_days ?? 30,
    hidden: r.hidden ?? false,
  }
}

async function ensureSeeded() {
  const pool = getPool()
  await initDB()
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM packages')
  if (rows[0].count === 0) {
    for (const pkg of SEED_PACKAGES) {
      await pool.query(
        `INSERT INTO packages (id, data, category, status) VALUES ($1, $2, $3, 'approved') ON CONFLICT DO NOTHING`,
        [pkg.id, JSON.stringify(pkg), pkg.category || 'group']
      )
    }
  }
}

export async function getAllPackages() {
  const pool = getPool()
  await ensureSeeded()
  const { rows } = await pool.query(
    `SELECT id, data, category, status, agency_id, featured, featured_order, hidden
     FROM packages WHERE status = 'approved' AND hidden = false ORDER BY created_at ASC`
  )
  return rows.map(mergePackageRow)
}

export async function getAllPackagesAdmin() {
  const pool = getPool()
  await initDB()
  await initAgenciesTable()
  const { rows } = await pool.query(
    `SELECT p.id, p.data, p.category, p.status, p.agency_id, p.featured, p.featured_order, p.featured_at, p.featured_days, p.hidden,
            a.name AS agency_name
     FROM packages p
     LEFT JOIN agencies a ON p.agency_id = a.id
     ORDER BY p.created_at DESC`
  )
  return rows.map(r => ({ ...mergePackageRow(r), agencyName: r.agency_name ?? null }))
}

export async function getFeaturedPackages() {
  const pool = getPool()
  await initDB()
  const { rows } = await pool.query(
    `SELECT id, data, category, status, agency_id, featured, featured_order, featured_at, featured_days, hidden
     FROM packages
     WHERE featured = true AND status = 'approved' AND hidden = false
     ORDER BY featured_order ASC, created_at ASC`
  )
  return rows.map(mergePackageRow)
}

export async function getPackageById(id) {
  const pool = getPool()
  await initDB()
  const { rows } = await pool.query(
    `SELECT id, data, category, status, agency_id, featured, featured_order
     FROM packages WHERE id = $1`,
    [id]
  )
  if (!rows[0]) return null
  return mergePackageRow(rows[0])
}

export async function insertPackage(pkg) {
  const pool = getPool()
  await initDB()
  const category = pkg.category || 'group'
  await pool.query(
    `INSERT INTO packages (id, data, category, status, agency_id) VALUES ($1, $2, $3, 'approved', NULL)`,
    [pkg.id, JSON.stringify(pkg), category]
  )
  return pkg
}

export async function insertPackageByAgency(pkg, agencyId) {
  const pool = getPool()
  await initDB()
  const category = pkg.category || 'group'
  await pool.query(
    `INSERT INTO packages (id, data, category, status, agency_id) VALUES ($1, $2, $3, 'pending', $4)`,
    [pkg.id, JSON.stringify(pkg), category, agencyId]
  )
  return { ...pkg, status: 'pending', agencyId }
}

export async function updatePackage(id, data) {
  const pool = getPool()
  await initDB()
  const category = data.category || 'group'
  await pool.query(
    `UPDATE packages SET data = $1, category = $2, updated_at = NOW() WHERE id = $3`,
    [JSON.stringify(data), category, id]
  )
  return data
}

export async function updatePackageStatus(id, status) {
  const pool = getPool()
  await pool.query(`UPDATE packages SET status = $1, updated_at = NOW() WHERE id = $2`, [status, id])
}

export async function togglePackageFeatured(id, featured, order = 0) {
  const pool = getPool()
  await pool.query(
    `UPDATE packages SET featured = $1, featured_order = $2,
       featured_at = CASE WHEN $1 THEN COALESCE(featured_at, NOW()) ELSE NULL END,
       updated_at  = NOW()
     WHERE id = $3`,
    [featured, order, id]
  )
}

export async function deletePackage(id) {
  const pool = getPool()
  await initDB()
  await pool.query('DELETE FROM packages WHERE id = $1', [id])
}

export async function setPackageHidden(id, hidden) {
  const pool = getPool()
  await initDB()
  await pool.query('UPDATE packages SET hidden = $1, updated_at = NOW() WHERE id = $2', [hidden, id])
}

export async function setPackageHiddenByAgency(id, hidden, agencyId) {
  const pool = getPool()
  await initDB()
  const { rowCount } = await pool.query(
    'UPDATE packages SET hidden = $1, updated_at = NOW() WHERE id = $2 AND agency_id = $3',
    [hidden, id, agencyId]
  )
  return rowCount > 0
}

export async function updatePackageByAgency(id, data, agencyId) {
  const pool = getPool()
  await initDB()
  const category = data.category || 'group'
  // Editing an agency package sends it back for admin review.
  const { rowCount } = await pool.query(
    `UPDATE packages SET data = $1, category = $2, status = 'pending', updated_at = NOW() WHERE id = $3 AND agency_id = $4`,
    [JSON.stringify(data), category, id, agencyId]
  )
  return rowCount > 0
}

export async function renamePackageId(oldId, newId, updatedData) {
  const pool = getPool()
  await initDB()
  const category = updatedData.category || 'group'
  await pool.query(
    `INSERT INTO packages (id, data, category, status, agency_id, featured, featured_order, created_at)
     SELECT $1, $2, category, status, agency_id, featured, featured_order, created_at
     FROM packages WHERE id = $3`,
    [newId, JSON.stringify(updatedData), oldId]
  )
  await pool.query(`UPDATE enquiries SET package_id = $1 WHERE package_id = $2`, [newId, oldId])
  await pool.query('DELETE FROM packages WHERE id = $1', [oldId])
}

export async function resetPackages() {
  const pool = getPool()
  await initDB()
  await pool.query('DELETE FROM packages WHERE agency_id IS NULL')
  for (const pkg of SEED_PACKAGES) {
    await pool.query(
      `INSERT INTO packages (id, data, category, status) VALUES ($1, $2, $3, 'approved')`,
      [pkg.id, JSON.stringify(pkg), pkg.category || 'group']
    )
  }
  return SEED_PACKAGES
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function initUsersTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE`)
  await pool.query(`UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL`)
}

export async function createUser(username, hashedPassword, role = 'admin') {
  const pool = getPool()
  await initUsersTable()
  const { rows } = await pool.query(
    'INSERT INTO users (email, username, password, role) VALUES ($1, $1, $2, $3) RETURNING id, username, role',
    [username, hashedPassword, role]
  )
  return rows[0]
}

export async function getUserByUsername(username) {
  const pool = getPool()
  await initUsersTable()
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username])
  return rows[0] ?? null
}

export async function getUserByEmail(email) {
  const pool = getPool()
  await initUsersTable()
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return rows[0] ?? null
}

export async function updateAdminUsername(oldUsername, newUsername) {
  const pool = getPool()
  await initUsersTable()
  const { rowCount } = await pool.query(
    'UPDATE users SET username = $1, email = $1 WHERE username = $2',
    [newUsername.trim(), oldUsername]
  )
  return rowCount > 0
}

export async function updateAdminPassword(username, hashedPassword) {
  const pool = getPool()
  await initUsersTable()
  const { rowCount } = await pool.query(
    'UPDATE users SET password = $1 WHERE username = $2',
    [hashedPassword, username]
  )
  return rowCount > 0
}

// ─── Agencies ────────────────────────────────────────────────────────────────

export async function initAgenciesTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agencies (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      phone       TEXT NOT NULL,
      description TEXT,
      website     TEXT,
      password    TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function createAgency({ name, email, phone, description, website, hashedPassword }) {
  const pool = getPool()
  await initAgenciesTable()
  const { rows } = await pool.query(
    `INSERT INTO agencies (name, email, phone, description, website, password, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING id, name, email, phone, description, website, status, created_at`,
    [name, email, phone, description || null, website || null, hashedPassword]
  )
  return rows[0]
}

export async function getAllAgencies() {
  const pool = getPool()
  await initAgenciesTable()
  const { rows } = await pool.query(
    `SELECT a.id, a.name, a.email, a.phone, a.description, a.website, a.status, a.created_at,
            COUNT(p.id)::int AS package_count
     FROM agencies a
     LEFT JOIN packages p ON p.agency_id = a.id
     GROUP BY a.id ORDER BY a.created_at DESC`
  )
  return rows
}

export async function getAgencyById(id) {
  const pool = getPool()
  await initAgenciesTable()
  const { rows } = await pool.query('SELECT * FROM agencies WHERE id = $1', [id])
  return rows[0] ?? null
}

export async function getAgencyByEmail(email) {
  const pool = getPool()
  await initAgenciesTable()
  const { rows } = await pool.query('SELECT * FROM agencies WHERE email = $1', [email])
  return rows[0] ?? null
}

export async function updateAgencyStatus(id, status) {
  const pool = getPool()
  await pool.query(`UPDATE agencies SET status = $1 WHERE id = $2`, [status, id])
}

export async function deleteAgency(id) {
  const pool = getPool()
  await pool.query('DELETE FROM agencies WHERE id = $1', [id])
}

export async function updateAgencyPhone(id, phone) {
  const pool = getPool()
  await pool.query('UPDATE agencies SET phone = $1 WHERE id = $2', [phone, id])
}

export async function updateAgencyPassword(email, hashedPassword) {
  const pool = getPool()
  await initAgenciesTable()
  const { rowCount } = await pool.query(
    'UPDATE agencies SET password = $1 WHERE email = $2',
    [hashedPassword, email.toLowerCase().trim()]
  )
  return rowCount > 0
}

export async function getAgencyPackages(agencyId) {
  const pool = getPool()
  await initDB()
  const { rows } = await pool.query(
    `SELECT id, data, category, status, agency_id, featured, featured_order, hidden
     FROM packages WHERE agency_id = $1 ORDER BY created_at DESC`,
    [agencyId]
  )
  return rows.map(mergePackageRow)
}

// ─── Destinations ─────────────────────────────────────────────────────────────

export async function initDestinationsTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS destinations (
      id          SERIAL PRIMARY KEY,
      name        TEXT UNIQUE NOT NULL,
      color       TEXT NOT NULL DEFAULT '#C9A227',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS image_url TEXT`)
  await pool.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS description TEXT`)
  await pool.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '📍'`)
  await pool.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT true`)
  await pool.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS image_pos TEXT`)

  await pool.query(`
    INSERT INTO destinations (name, color, image_url, description, emoji) VALUES
      ('Domestic',      '#16294D', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80', 'Explore the beauty within your borders', '🇮🇳'),
      ('International', '#8A6E1C', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', 'Discover exotic destinations around the world', '✈️'),
      ('Spiritual',     '#C9A227', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'Find peace and serenity in sacred places', '🕉️'),
      ('Gujarat',       '#16294D', 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&q=80', 'Land of legends, lions, and white sands', '🛕'),
      ('Uttar Pradesh', '#8A6E1C', 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80', 'Heartland of culture, heritage, and spirituality', '🕌'),
      ('Uttarakhand',   '#16294D', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', 'Devbhoomi - the land of gods and mountains', '🏔️'),
      ('Himachal',      '#8A6E1C', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80', 'Snow-capped peaks and scenic valley highways', '🏔️'),
      ('Jammu Kashmir', '#16294D', 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?w=800&q=80', 'Paradise on Earth - lakes, gardens, and snow', '❄️'),
      ('North East',    '#8A6E1C', 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80', 'Unexplored green hills and scenic monasteries', '🎋'),
      ('Bengal & Odisha','#16294D', 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&q=80', 'Culture, temples, and coastal delta charms', '🌊'),
      ('Kerala',        '#8A6E1C', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'God''s Own Country - backwaters and hills', '🌴'),
      ('Tamil Nadu',    '#16294D', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80', 'Land of monumental temples and rich history', '🛕'),
      ('Goa',           '#8A6E1C', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', 'Sun-kissed beaches, parties, and heritage', '🏖️'),
      ('Maharashtra',   '#16294D', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80', 'Gateway of India, caves, and mountain fortresses', '🏰'),
      ('Karnataka',     '#8A6E1C', 'https://images.unsplash.com/photo-1580889240912-c39ecefd3d95?w=800&q=80', 'Palaces, ancient Hampi ruins, and coffee hills', '🏛️')
    ON CONFLICT (name) DO NOTHING
  `)
}

export async function getDestinations() {
  const pool = getPool()
  await initDestinationsTable()
  const { rows } = await pool.query('SELECT * FROM destinations ORDER BY created_at ASC')
  return rows
}

export async function createDestination(name, color, { image_url, description, emoji, image_pos } = {}) {
  const pool = getPool()
  await initDestinationsTable()
  const { rows } = await pool.query(
    'INSERT INTO destinations (name, color, image_url, description, emoji, image_pos) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, color, image_url || null, description || null, emoji || '📍', image_pos || null]
  )
  return rows[0]
}

export async function updateDestination(id, { color, image_url, description, emoji, image_pos }) {
  const pool = getPool()
  await pool.query(
    'UPDATE destinations SET color=$1, image_url=$2, description=$3, emoji=$4, image_pos=$5 WHERE id=$6',
    [color, image_url || null, description || null, emoji || '📍', image_pos || null, id]
  )
}

export async function updateDestinationFeatured(id, featured) {
  const pool = getPool()
  await pool.query('UPDATE destinations SET featured = $1 WHERE id = $2', [featured, id])
}

export async function deleteDestination(id) {
  const pool = getPool()
  await pool.query('DELETE FROM destinations WHERE id = $1', [id])
}

// ─── Listings (Homestays & Houseboats) ─────────────────────────────────────────

export async function initListingsTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS listings (
      id          SERIAL PRIMARY KEY,
      type        TEXT NOT NULL,
      name        TEXT NOT NULL,
      color       TEXT NOT NULL DEFAULT '#C9A227',
      image_url   TEXT,
      description TEXT,
      location    TEXT,
      price       TEXT,
      emoji       TEXT DEFAULT '🏡',
      image_pos   TEXT,
      featured    BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_pos TEXT`)

  // Seed defaults per type (only when that type has no rows yet)
  const { rows: hs } = await pool.query(`SELECT COUNT(*)::int AS count FROM listings WHERE type = 'homestay'`)
  if (hs[0].count === 0) {
    await pool.query(`
      INSERT INTO listings (type, name, color, image_url, description, location, emoji) VALUES
        ('homestay', 'Hill View Homestay',  '#16294D', 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80', 'Cozy family home amid tea gardens with home-cooked meals', 'Munnar',   '🏡'),
        ('homestay', 'Backwater Homestay',  '#0ea5e9', 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&q=80', 'Riverside rooms with traditional Kerala hospitality',        'Alleppey', '🏡')
      ON CONFLICT DO NOTHING
    `)
  }
  const { rows: hb } = await pool.query(`SELECT COUNT(*)::int AS count FROM listings WHERE type = 'houseboat'`)
  if (hb[0].count === 0) {
    await pool.query(`
      INSERT INTO listings (type, name, color, image_url, description, location, emoji) VALUES
        ('houseboat', 'Premium Kettuvallam', '#C9A227', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'Private overnight cruise with cook & sundeck',          'Alleppey',  '🛶'),
        ('houseboat', 'Deluxe Houseboat',     '#2F5490', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80', 'Air-conditioned cabins drifting through Vembanad Lake', 'Kumarakom', '🛶')
      ON CONFLICT DO NOTHING
    `)
  }
}

export async function getListings(type) {
  const pool = getPool()
  await initListingsTable()
  if (type) {
    const { rows } = await pool.query('SELECT * FROM listings WHERE type = $1 ORDER BY created_at ASC', [type])
    return rows
  }
  const { rows } = await pool.query('SELECT * FROM listings ORDER BY created_at ASC')
  return rows
}

export async function createListing(type, name, color, { image_url, description, location, price, emoji, image_pos } = {}) {
  const pool = getPool()
  await initListingsTable()
  const { rows } = await pool.query(
    'INSERT INTO listings (type, name, color, image_url, description, location, price, emoji, image_pos) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [type, name, color, image_url || null, description || null, location || null, price || null, emoji || (type === 'houseboat' ? '🛶' : '🏡'), image_pos || null]
  )
  return rows[0]
}

export async function updateListing(id, { color, image_url, description, location, price, emoji, image_pos }) {
  const pool = getPool()
  await pool.query(
    'UPDATE listings SET color=$1, image_url=$2, description=$3, location=$4, price=$5, emoji=$6, image_pos=$7 WHERE id=$8',
    [color, image_url || null, description || null, location || null, price || null, emoji || '🏡', image_pos || null, id]
  )
}

export async function updateListingFeatured(id, featured) {
  const pool = getPool()
  await pool.query('UPDATE listings SET featured = $1 WHERE id = $2', [featured, id])
}

export async function deleteListing(id) {
  const pool = getPool()
  await pool.query('DELETE FROM listings WHERE id = $1', [id])
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function initSettingsTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)
  await pool.query(`INSERT INTO settings (key, value) VALUES ('phone', '917796950505') ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO settings (key, value) VALUES ('whatsapp', '917796950505') ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO settings (key, value) VALUES ('email', '') ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO settings (key, value) VALUES ('email2', '') ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO settings (key, value) VALUES ('facebook_url', '') ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO settings (key, value) VALUES ('instagram_url', '') ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO settings (key, value) VALUES ('banner_days', '30') ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO settings (key, value) VALUES ('admin_recovery_email', '') ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO settings (key, value) VALUES ('min_dest_packages', '1') ON CONFLICT DO NOTHING`)
}

export async function getSettings() {
  const pool = getPool()
  await initSettingsTable()
  const { rows } = await pool.query('SELECT key, value FROM settings')
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

export async function setSetting(key, value) {
  const pool = getPool()
  await initSettingsTable()
  await pool.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
    [key, value]
  )
}

// ─── Package Options ─────────────────────────────────────────────────────────

export async function initPackageOptionsTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS package_options (
      id         SERIAL PRIMARY KEY,
      type       TEXT NOT NULL,
      value      TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(type, value)
    )
  `)
  const seeds = {
    inclusion: [
      'Accommodation', 'Daily breakfast', 'Daily dinner',
      'All meals (breakfast, lunch & dinner)', 'Breakfast & dinner',
      'Airport / railway transfers', 'Private AC vehicle', 'AC cab for all sightseeing',
      'Experienced local guide', 'Entry tickets (as mentioned)', 'Houseboat stay',
      'Backwater cruise', 'Welcome drink on arrival', 'Bonfire arrangement',
      'Toll & parking charges', 'Driver allowance & fuel', 'Boat ride', 'Jeep safari',
      'Complimentary mineral water', 'First-aid kit', 'Travel coordinator support',
    ],
    exclusion: [
      'Flights / trains', 'Lunch on any day', 'Personal expenses & tips',
      'Travel insurance', 'Alcoholic beverages', 'Camera / video entry fees',
      'Anything not mentioned in inclusions', 'Optional adventure activity fees',
      'Room service charges', 'Laundry', 'Medical expenses', 'Visa fees',
      'Any extra meals ordered', 'Charges due to natural calamity or political unrest',
    ],
    highlight: [
      'Backwater houseboat stay', 'Tea estate guided walk & tasting',
      'Wildlife jeep safari', 'Waterfall trek', 'Spice garden tour',
      'Kathakali cultural show', 'Sunrise trek', 'Sunset boat cruise',
      'Village homestay experience', 'Elephant interaction (ethical)',
      'Bamboo rafting', 'Mountain biking', 'Ayurvedic spa session',
      'Fishing with local fishermen', 'Kerala cooking class',
      'Munnar hill panoramic views', 'Thekkady wildlife sighting',
      'Varkala sea cliffs & beach', 'Kumarakom bird sanctuary visit',
      'Periyar Tiger Reserve entry', 'Snake boat race viewpoint',
    ],
  }
  for (const [type, values] of Object.entries(seeds)) {
    for (const value of values) {
      await pool.query(
        `INSERT INTO package_options (type, value) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [type, value]
      )
    }
  }
}

export async function getAllPackageOptions() {
  const pool = getPool()
  await initPackageOptionsTable()
  const { rows } = await pool.query(
    `SELECT type, value FROM package_options ORDER BY type ASC, created_at ASC`
  )
  return rows
}

export async function addPackageOption(type, value) {
  const pool = getPool()
  await initPackageOptionsTable()
  await pool.query(
    `INSERT INTO package_options (type, value) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [type, value.trim()]
  )
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export async function initEnquiriesTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id            SERIAL PRIMARY KEY,
      package_id    TEXT,
      package_title TEXT,
      name          TEXT NOT NULL,
      phone         TEXT NOT NULL,
      email         TEXT,
      message       TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS destination TEXT`)
  await pool.query(`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'package'`)
}

export async function createEnquiry({ package_id, package_title, destination, type, name, phone, email, message }) {
  const pool = getPool()
  await initEnquiriesTable()
  const t = ['package', 'flight', 'train'].includes(type) ? type : 'package'
  const { rows } = await pool.query(
    'INSERT INTO enquiries (package_id, package_title, destination, type, name, phone, email, message) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [package_id || null, package_title || null, destination || null, t, name, phone, email || null, message || null]
  )
  return rows[0]
}

export async function getEnquiries() {
  const pool = getPool()
  await initEnquiriesTable()
  const { rows } = await pool.query('SELECT * FROM enquiries ORDER BY created_at DESC')
  return rows
}

export async function deleteEnquiry(id) {
  const pool = getPool()
  await pool.query('DELETE FROM enquiries WHERE id = $1', [id])
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export async function initGalleryTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery (
      id         SERIAL PRIMARY KEY,
      image_url  TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM gallery')
  if (rows[0].count === 0) {
    const defaultImages = [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800",
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800",
      "https://images.unsplash.com/photo-1589983846997-04788035bc83?q=80&w=800",
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800",
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800"
    ]
    for (const url of defaultImages) {
      await pool.query('INSERT INTO gallery (image_url) VALUES ($1)', [url])
    }
  }
}

export async function getGalleryImages() {
  const pool = getPool()
  await initGalleryTable()
  const { rows } = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC')
  return rows
}

export async function addGalleryImage(image_url) {
  const pool = getPool()
  await initGalleryTable()
  const { rows } = await pool.query(
    'INSERT INTO gallery (image_url) VALUES ($1) RETURNING *',
    [image_url]
  )
  return rows[0]
}

export async function deleteGalleryImage(id) {
  const pool = getPool()
  await pool.query('DELETE FROM gallery WHERE id = $1', [id])
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function initTestimonialsTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      text       TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM testimonials')
  if (rows[0].count === 0) {
    const defaultTestimonials = [
      { name: 'Anjali Sharma', text: 'Triphoga arranged the most beautiful Munnar trip for us. The itinerary was perfectly balanced and the homestay was breathtaking!' },
      { name: 'Rahul Verma', text: 'Our houseboat experience in Alleppey was magical. The team took care of every single detail. Highly recommend their services.' },
      { name: 'Sarah Jenkins', text: 'A completely hassle-free spiritual tour across Kerala. The guides were knowledgeable and everything went extremely smoothly.' }
    ]
    for (const t of defaultTestimonials) {
      await pool.query('INSERT INTO testimonials (name, text) VALUES ($1, $2)', [t.name, t.text])
    }
  }
}

export async function getTestimonials() {
  const pool = getPool()
  await initTestimonialsTable()
  const { rows } = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC')
  return rows
}

export async function addTestimonial(name, text) {
  const pool = getPool()
  await initTestimonialsTable()
  const { rows } = await pool.query(
    'INSERT INTO testimonials (name, text) VALUES ($1, $2) RETURNING *',
    [name, text]
  )
  return rows[0]
}

export async function updateTestimonial(id, name, text) {
  const pool = getPool()
  const { rows } = await pool.query(
    'UPDATE testimonials SET name = $1, text = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [name, text, id]
  )
  return rows[0]
}

export async function deleteTestimonial(id) {
  const pool = getPool()
  await pool.query('DELETE FROM testimonials WHERE id = $1', [id])
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function initClientsTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      logo_url   TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function getClients() {
  const pool = getPool()
  await initClientsTable()
  const { rows } = await pool.query('SELECT * FROM clients ORDER BY created_at ASC')
  return rows
}

export async function addClient(name, logo_url) {
  const pool = getPool()
  await initClientsTable()
  const { rows } = await pool.query(
    'INSERT INTO clients (name, logo_url) VALUES ($1, $2) RETURNING *',
    [name, logo_url]
  )
  return rows[0]
}

export async function updateClient(id, name, logo_url) {
  const pool = getPool()
  const { rows } = await pool.query(
    'UPDATE clients SET name = $1, logo_url = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [name, logo_url, id]
  )
  return rows[0]
}

export async function deleteClient(id) {
  const pool = getPool()
  await pool.query('DELETE FROM clients WHERE id = $1', [id])
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export async function initTeamTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS team (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      role       TEXT NOT NULL,
      image_url  TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function getTeamMembers() {
  const pool = getPool()
  await initTeamTable()
  const { rows } = await pool.query('SELECT * FROM team ORDER BY created_at ASC')
  return rows
}

export async function addTeamMember(name, role, image_url) {
  const pool = getPool()
  await initTeamTable()
  const { rows } = await pool.query(
    'INSERT INTO team (name, role, image_url) VALUES ($1, $2, $3) RETURNING *',
    [name, role, image_url]
  )
  return rows[0]
}

export async function updateTeamMember(id, name, role, image_url) {
  const pool = getPool()
  const { rows } = await pool.query(
    'UPDATE team SET name = $1, role = $2, image_url = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
    [name, role, image_url, id]
  )
  return rows[0]
}

export async function deleteTeamMember(id) {
  const pool = getPool()
  await pool.query('DELETE FROM team WHERE id = $1', [id])
}

// ─── Fleet ───────────────────────────────────────────────────────────────────

async function initFleetTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fleet (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      category   TEXT NOT NULL,
      tag        TEXT NOT NULL,
      tag_color  TEXT,
      tag_bg     TEXT,
      description TEXT,
      image_url  TEXT,
      features   JSONB,
      capacity   TEXT,
      order_idx  INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM fleet')
  if (rows[0].count === 0) {
    const defaultFleet = [
      {
        name: 'Swift Dzire',
        category: 'SEDAN',
        tag: 'ECONOMY',
        tagColor: '#3b82f6',
        tagBg: '#eff6ff',
        desc: 'Economical sedan for small groups — perfect for city tours and short outstation trips.',
        img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=600',
        features: ['4 Passengers', 'AC', 'Petrol/CNG', 'Economic'],
        capacity: '4+1 Seats'
      },
      {
        name: 'Ertiga',
        category: 'MPV',
        tag: 'FAMILY',
        tagColor: '#22c55e',
        tagBg: '#f0fdf4',
        desc: '7-seat MPV for family outings, pilgrimages, and group travel across North India.',
        img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=600',
        features: ['7 Passengers', 'AC', 'Petrol/CNG', 'Spacious'],
        capacity: '6+1 Seats'
      },
      {
        name: 'Innova Crysta',
        category: 'PREMIUM MUV',
        tag: 'PREMIUM',
        tagColor: '#f59e0b',
        tagBg: '#fffbeb',
        desc: 'The gold standard for highway journeys — powerful, spacious, and supremely comfortable.',
        img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600',
        features: ['7 Passengers', 'AC', 'Diesel', 'Highway King'],
        capacity: '6+1 Seats'
      },
      {
        name: 'Tempo Traveller',
        category: 'MINI VAN',
        tag: 'GROUP',
        tagColor: '#f97316',
        tagBg: '#fff7ed',
        desc: 'Large group travel for religious yatras, corporate outings, and family tours.',
        img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600',
        features: ['12-17 Seats', 'AC', 'Diesel', 'Push-back Seats'],
        capacity: '12-17 Seats'
      },
      {
        name: 'Buses / Coach',
        category: 'BUS',
        tag: 'LARGE GROUPS',
        tagColor: '#a855f7',
        tagBg: '#faf5ff',
        desc: 'Luxury AC coach for school tours, weddings, religious tours, and corporate events.',
        img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=600',
        features: ['32-52 Seats', 'Full AC', 'Diesel', 'LED/Music'],
        capacity: '32-52 Seats'
      }
    ]

    for (let i = 0; i < defaultFleet.length; i++) {
      const v = defaultFleet[i]
      await pool.query(
        'INSERT INTO fleet (name, category, tag, tag_color, tag_bg, description, image_url, features, capacity, order_idx) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [v.name, v.category, v.tag, v.tagColor, v.tagBg, v.desc, v.img, JSON.stringify(v.features), v.capacity, i]
      )
    }
  }
}

export async function getFleet() {
  const pool = getPool()
  await initFleetTable()
  const { rows } = await pool.query('SELECT * FROM fleet ORDER BY order_idx ASC, id ASC')
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    category: r.category,
    tag: r.tag,
    tagColor: r.tag_color,
    tagBg: r.tag_bg,
    desc: r.description,
    img: r.image_url,
    features: r.features || [],
    capacity: r.capacity,
    orderIdx: r.order_idx
  }))
}

export async function addFleetVehicle(v) {
  const pool = getPool()
  await initFleetTable()
  const { rows } = await pool.query(
    'INSERT INTO fleet (name, category, tag, tag_color, tag_bg, description, image_url, features, capacity, order_idx) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
    [v.name, v.category, v.tag, v.tagColor, v.tagBg, v.desc, v.img, JSON.stringify(v.features || []), v.capacity, v.orderIdx || 0]
  )
  return rows[0]
}

export async function updateFleetVehicle(id, v) {
  const pool = getPool()
  const { rows } = await pool.query(
    'UPDATE fleet SET name=$1, category=$2, tag=$3, tag_color=$4, tag_bg=$5, description=$6, image_url=$7, features=$8, capacity=$9, order_idx=$10, updated_at=NOW() WHERE id=$11 RETURNING *',
    [v.name, v.category, v.tag, v.tagColor, v.tagBg, v.desc, v.img, JSON.stringify(v.features || []), v.capacity, v.orderIdx || 0, id]
  )
  return rows[0]
}

export async function deleteFleetVehicle(id) {
  const pool = getPool()
  await pool.query('DELETE FROM fleet WHERE id = $1', [id])
}
