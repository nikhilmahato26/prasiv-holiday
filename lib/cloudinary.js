import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'greenkerala'

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

/**
 * Extract the Cloudinary public_id (including folder) from a delivery URL.
 * e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/greenkerala/abc.jpg
 *      → greenkerala/abc
 * Returns null for non-Cloudinary URLs (so we never try to delete external images).
 */
export function publicIdFromUrl(url) {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null
  try {
    const path = new URL(url).pathname // /<cloud>/image/upload/v123/folder/name.ext
    const parts = path.split('/upload/')
    if (parts.length < 2) return null
    let rest = parts[1].replace(/^v\d+\//, '') // strip version prefix
    rest = rest.replace(/\.[^/.]+$/, '')        // strip extension
    return decodeURIComponent(rest)
  } catch {
    return null
  }
}

export default cloudinary
