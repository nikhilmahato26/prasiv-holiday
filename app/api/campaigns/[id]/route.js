import { NextResponse } from 'next/server'
import { updateCampaign, deleteCampaign } from '@/lib/db'
import { guardAdmin } from '@/lib/guardAdmin'

export async function PUT(req, { params }) {
  if (!(await guardAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = params
    const body = await req.json()
    const result = await updateCampaign(id, body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  if (!(await guardAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = params
    await deleteCampaign(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
