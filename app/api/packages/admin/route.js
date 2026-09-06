import { getAllPackagesAdmin } from '@/lib/db'
import { guardAdmin } from '@/lib/guardAdmin'
import { isStaticMode, staticPackages } from '@/lib/static-data'

export async function GET() {
  if (!(await guardAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (isStaticMode()) return Response.json(staticPackages())

  try {
    const packages = await getAllPackagesAdmin()
    return Response.json(packages)
  } catch {
    return Response.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}
