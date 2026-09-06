import { getListings, createListing } from '@/lib/db'
import { guardAdmin } from '@/lib/guardAdmin'
import { isStaticMode } from '@/lib/static-data'

const TYPES = ['homestay', 'houseboat']

export async function GET(request) {
  if (isStaticMode()) return Response.json([])

  try {
    const type = new URL(request.url).searchParams.get('type')
    const listings = await getListings(type || undefined)
    return Response.json(listings)
  } catch (err) {
    return Response.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request) {
  if (!(await guardAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { type, name, color, image_url, description, location, price, emoji, image_pos } = await request.json()
    if (!TYPES.includes(type)) return Response.json({ error: 'Invalid type' }, { status: 400 })
    if (!name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })
    const listing = await createListing(type, name.trim(), color || '#8A6E1C', { image_url, description, location, price, emoji, image_pos })
    return Response.json(listing, { status: 201 })
  } catch (err) {
    return Response.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
