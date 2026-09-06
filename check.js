import { getAllPackagesAdmin } from './lib/db.js'

async function check() {
  const pkgs = await getAllPackagesAdmin()
  console.log(`Found ${pkgs.length} packages`)
  if (pkgs.length > 0) {
    console.log(pkgs[0].category, pkgs[0].status)
  }
  process.exit(0)
}
check()
