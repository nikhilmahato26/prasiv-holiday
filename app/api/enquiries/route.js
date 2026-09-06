import { createEnquiry, getEnquiries } from '@/lib/db'
import { guardAdmin } from '@/lib/guardAdmin'
import { sendEnquiryEmail } from '@/lib/email'

export async function GET() {
  if (!(await guardAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const enquiries = await getEnquiries()
    return Response.json(enquiries)
  } catch {
    return Response.json({ error: 'Failed to fetch enquiries' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { package_id, package_title, destination, type, name, phone, email, message } = await request.json()
    if (!name?.trim() || !phone?.trim()) {
      return Response.json({ error: 'Name and phone are required' }, { status: 400 })
    }
    const enquiryType = ['package', 'flight', 'train'].includes(type) ? type : 'package'
    const enquiry = await createEnquiry({
      package_id, package_title,
      destination: destination?.trim() || null,
      type: enquiryType,
      name: name.trim(), phone: phone.trim(),
      email: email?.trim() || null,
      message: message?.trim() || null,
    })
    // Await the email so it completes within the request lifecycle (a fire-and-forget
    // promise can be killed when the serverless function freezes after responding).
    // A mail failure must not fail the enquiry, so log it and continue.
    try {
      await sendEnquiryEmail({ name: name.trim(), phone: phone.trim(), email: email?.trim(), message: message?.trim(), package_title, destination: destination?.trim() || null, type: enquiryType })
    } catch (err) {
      console.error('Failed to send enquiry email:', err)
    }
    return Response.json(enquiry, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
