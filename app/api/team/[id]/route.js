import { NextResponse } from 'next/server'
import { deleteTeamMember, updateTeamMember } from '@/lib/db'

export async function DELETE(req, context) {
  try {
    const params = await context.params
    const { id } = params
    await deleteTeamMember(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req, context) {
  try {
    const params = await context.params
    const { id } = params
    const { name, role, image_url } = await req.json()
    if (!name || !role || !image_url) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const teamMember = await updateTeamMember(id, name, role, image_url)
    return NextResponse.json(teamMember)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
