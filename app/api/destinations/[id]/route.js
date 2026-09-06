import { deleteDestination, updateDestination } from '@/lib/db'
import { guardAdmin } from '@/lib/guardAdmin'

export async function PUT(request, { params }) {
  if (!(await guardAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const { color, image_url, description, emoji, image_pos } = await request.json()
    await updateDestination(id, { color, image_url, description, emoji, image_pos })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to update destination' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  if (!(await guardAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    await deleteDestination(id)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to delete destination' }, { status: 500 })
  }
}
