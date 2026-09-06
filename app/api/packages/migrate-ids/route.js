import { getAllPackagesAdmin, renamePackageId } from '@/lib/db'
import { invalidatePackagesCache } from '@/lib/redis'
import { guardAdmin } from '@/lib/guardAdmin'

const PKG_PREFIX = { package: 'PKG', group: 'GPKG', homestay: 'HS', other: 'OTH' }

function isConforming(id, prefix) {
  return new RegExp(`^${prefix}-\\d+$`).test(id)
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

      const usedNums = new Set(
        conforming.map(p => parseInt(p.id.match(/(\d+)$/)[1], 10))
      )

      let nextNum = 101
      for (const pkg of nonConforming) {
        while (usedNums.has(nextNum)) nextNum++
        renames.push({ oldId: pkg.id, newId: `${prefix}-${nextNum}`, pkg })
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
