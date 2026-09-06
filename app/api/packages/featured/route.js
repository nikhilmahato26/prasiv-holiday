export const dynamic = 'force-dynamic'

import { getFeaturedPackages } from '@/lib/db'
import { isStaticMode, staticFeaturedPackages } from '@/lib/static-data'

export async function GET() {
  if (isStaticMode()) return Response.json(staticFeaturedPackages())

  try {
    const packages = await getFeaturedPackages()
    return Response.json(packages)
  } catch {
    return Response.json({ error: 'Failed to fetch featured packages' }, { status: 500 })
  }
}
