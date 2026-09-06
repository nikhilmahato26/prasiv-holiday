import { getAllPackageOptions, addPackageOption } from '@/lib/db'
import { isStaticMode } from '@/lib/static-data'

export async function GET() {
  if (isStaticMode()) return Response.json({})

  try {
    const rows = await getAllPackageOptions()
    const grouped = {}
    for (const r of rows) {
      if (!grouped[r.type]) grouped[r.type] = []
      grouped[r.type].push(r.value)
    }
    return Response.json(grouped)
  } catch {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { type, value } = await req.json()
    if (!type || !value?.trim()) {
      return Response.json({ error: 'type and value required' }, { status: 400 })
    }
    await addPackageOption(type, value)
    const rows = await getAllPackageOptions()
    const grouped = {}
    for (const r of rows) {
      if (!grouped[r.type]) grouped[r.type] = []
      grouped[r.type].push(r.value)
    }
    return Response.json(grouped)
  } catch {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
