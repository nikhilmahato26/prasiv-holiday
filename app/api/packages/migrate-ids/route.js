import { getAllPackagesAdmin, renamePackageId } from '@/lib/db'
import { invalidatePackagesCache } from '@/lib/redis'
import { guardAdmin } from '@/lib/guardAdmin'

const PKG_PREFIX = { package: 'PKG', group: 'GPKG', homestay: 'HS', other: 'OTH' }

// Group packages carry one of two prefixes depending on region: GPKG for
// domestic, IPKG for international. Both are valid, so neither should be
// migrated onto the other — doing so collides with IDs already in use.
function prefixFor(pkg) {
  const base = PKG_PREFIX[pkg.category] ?? PKG_PREFIX.group
  if (base === 'GPKG' && pkg.region === 'international') return 'IPKG'
  return base
}

function isConforming(id, prefix) {
  const alternatives = prefix === 'GPKG' ? ['GPKG', 'IPKG'] : [prefix]
  return alternatives.some(p => new RegExp(`^${p}-\\d+$`).test(id))
}

export async function POST() {
  if (!(await guardAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const packages = await getAllPackagesAdmin()
    const renames = []

    for (const [cat, prefix] of Object.entries(PKG_PREFIX)) {
      const catPkgs = packages.filter(p => p.category === cat)
      const conforming = catPkgs.filter(p => isConforming(p.id, prefix))
      const nonConforming = catPkgs.filter(p => !isConforming(p.id, prefix))

      if (nonConforming.length === 0) continue

      // Numbers are shared across every prefix in this category, so a rename can
      // never land on an ID another package already holds.
      const usedNums = new Set(
        catPkgs.map(p => p.id.match(/(\d+)$/)).filter(Boolean).map(m => parseInt(m[1], 10))
      )

      let nextNum = 101
      for (const pkg of nonConforming) {
        while (usedNums.has(nextNum)) nextNum++
        renames.push({ oldId: pkg.id, newId: `${prefixFor(pkg)}-${nextNum}`, pkg })
        usedNums.add(nextNum)
        nextNum++
      }
    }

    for (const { oldId, newId, pkg } of renames) {
      await renamePackageId(oldId, newId, { ...pkg, id: newId })
    }

    await invalidatePackagesCache()
    return Response.json({ renamed: renames.map(r => ({ from: r.oldId, to: r.newId })) })
  } catch (err) {
    console.error('migrate-ids error:', err)
    return Response.json({ error: 'Migration failed' }, { status: 500 })
  }
}
