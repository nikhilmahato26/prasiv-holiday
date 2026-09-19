export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCampaigns, addCampaign } from '@/lib/db'
import { guardAdmin } from '@/lib/guardAdmin'
import { isStaticMode } from '@/lib/static-data'

export async function GET() {
  if (isStaticMode()) return NextResponse.json([])

  try {
    const data = await getCampaigns()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req) {
  if (!(await guardAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    if (!body.slug || !body.name) {
      return NextResponse.json({ error: 'Slug and Name are required' }, { status: 400 })
    }
    const result = await addCampaign(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error adding campaign:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
