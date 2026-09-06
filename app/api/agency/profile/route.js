import { getAgencyById, updateAgencyPhone } from '@/lib/db'
import { guardAgency } from '@/lib/guardAgency'

export async function GET() {
  const payload = await guardAgency()
  if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const agency = await getAgencyById(payload.agencyId)
    if (!agency) return Response.json({ error: 'Not found' }, { status: 404 })
    const { password: _, ...safe } = agency
    return Response.json(safe)
  } catch {
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const payload = await guardAgency()
  if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { phone } = await request.json()
    if (!phone?.trim()) return Response.json({ error: 'Phone is required' }, { status: 400 })
    await updateAgencyPhone(payload.agencyId, phone.trim())
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to update phone' }, { status: 500 })
  }
}
