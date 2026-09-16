import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL="?([^"\n]+)"?/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

import * as db from './lib/db.js';

async function run() {
  console.log('Initializing DB tables...');
  await db.initDB();
  await db.initDestinationsTable();
  await db.initUsersTable();
  await db.initPackageOptionsTable();
  await db.initAgenciesTable();
  await db.initListingsTable();
  await db.initSettingsTable();
  await db.initEnquiriesTable();
  await db.initGalleryTable();
  await db.initTestimonialsTable();
  await db.initClientsTable();
  // initDB() only creates the packages table; the seed rows are inserted by
  // ensureSeeded(), which otherwise waits for the first public request.
  await db.ensureSeeded();
  const pkgs = await db.getAllPackages();
  console.log(`DB initialized. ${pkgs.length} packages seeded.`);
  process.exit(0);
}
run();
