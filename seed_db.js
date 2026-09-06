const db = require('./lib/db.js');
async function run() {
  await db.initDB();
  await db.initDestinationsTable();
  await db.initUsersTable();
  await db.initPackageOptionsTable();
  console.log('DB initialized and seeded.');
  process.exit(0);
}
run();
