import { updatePackageByAgency } from '@/lib/db'
import { invalidatePackagesCache } from '@/lib/redis'
import { guardAgency } from '@/lib/guardAgency'

export async function PUT(request, { params }) {
  const payload = await guardAgency()
  if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const pkg = await request.json()
    if (!pkg.title?.trim()) return Response.json({ error: 'Title is required' }, { status: 400 })
    if (!pkg.salePrice) return Response.json({ error: 'Sale price is required' }, { status: 400 })
    const updated = await updatePackageByAgency(id, pkg, payload.agencyId)
    if (!updated) return Response.json({ error: 'Package not found or not yours' }, { status: 403 })
    await invalidatePackagesCache()
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to update package' }, { status: 500 })
  }
}
