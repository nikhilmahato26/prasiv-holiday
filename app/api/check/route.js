import { getAllPackagesAdmin } from '@/lib/db'
export const dynamic = 'force-dynamic'
export async function GET() {
  const pkgs = await getAllPackagesAdmin()
  return Response.json({ count: pkgs.length, first: pkgs[0] })
}
