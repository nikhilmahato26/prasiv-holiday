import cloudinary, { CLOUDINARY_FOLDER, cloudinaryConfigured, publicIdFromUrl } from '@/lib/cloudinary'
import { guardUser } from '@/lib/guardUser'

export const runtime = 'nodejs'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request) {
  if (!(await guardUser())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!cloudinaryConfigured()) {
    return Response.json({ error: 'Image uploads are not configured. Set CLOUDINARY_* env vars.' }, { status: 503 })
  }
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!file.type?.startsWith('image/')) {
      return Response.json({ error: 'Only image files are allowed' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ error: 'Image must be under 10 MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: CLOUDINARY_FOLDER,
      resource_type: 'image',
      // Cap huge originals so delivery stays fast; keeps aspect ratio.
      transformation: [{ width: 2400, height: 2400, crop: 'limit' }],
    })

    return Response.json({ url: result.secure_url, public_id: result.public_id }, { status: 201 })
  } catch (err) {
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// Delete a previously uploaded image by its Cloudinary URL (best-effort).
export async function DELETE(request) {
  if (!(await guardUser())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!cloudinaryConfigured()) {
    return Response.json({ ok: true }) // nothing to delete when unconfigured
  }
  try {
    const { url } = await request.json()
    const publicId = publicIdFromUrl(url)
    if (!publicId) return Response.json({ ok: true }) // external/non-Cloudinary URL — skip
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: true }) // never block the UI on a failed cleanup
  }
}
