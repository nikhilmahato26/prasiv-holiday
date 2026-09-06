import { getGalleryImages, addGalleryImage, deleteGalleryImage } from '@/lib/db'
import { guardUser } from '@/lib/guardUser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const images = await getGalleryImages()
    return Response.json(images)
  } catch (error) {
    console.error('Failed to get gallery images', error)
    return Response.json({ error: 'Failed to fetch gallery images' }, { status: 500 })
  }
}

export async function POST(request) {
  if (!(await guardUser())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    if (!body.image_url) {
      return Response.json({ error: 'image_url is required' }, { status: 400 })
    }
    const newImage = await addGalleryImage(body.image_url)
    return Response.json(newImage)
  } catch (error) {
    console.error('Failed to add gallery image', error)
    return Response.json({ error: 'Failed to add gallery image' }, { status: 500 })
  }
}

export async function DELETE(request) {
  if (!(await guardUser())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 })
    }
    await deleteGalleryImage(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete gallery image', error)
    return Response.json({ error: 'Failed to delete gallery image' }, { status: 500 })
  }
}
