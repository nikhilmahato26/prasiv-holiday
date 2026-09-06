import { deleteGalleryImage } from '@/lib/db'
import { guardUser } from '@/lib/guardUser'

export const runtime = 'nodejs'

export async function DELETE(request, { params }) {
  if (!(await guardUser())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 })
    }
    await deleteGalleryImage(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete gallery image', error)
    return Response.json({ error: 'Failed to delete gallery image' }, { status: 500 })
  }
}
