import { getPackageById, updatePackage, deletePackage } from '@/lib/db'
import { invalidatePackagesCache } from '@/lib/redis'
import { guardAdmin } from '@/lib/guardAdmin'

export async function GET(request, { params }) {
  const { id } = await params
  try {
    const pkg = await getPackageById(decodeURIComponent(id))
    if (!pkg) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(pkg)
  } catch {
    return Response.json({ error: 'Failed to fetch package' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  if (!(await guardAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const data = await request.json()
    const updated = await updatePackage(id, data)
    await invalidatePackagesCache()
    return Response.json(updated)
  } catch (err) {
    return Response.json({ error: 'Failed to update package' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  if (!(await guardAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    await deletePackage(id)
    await invalidatePackagesCache()
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
