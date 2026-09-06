import { NextResponse } from 'next/server'
import { getTeamMembers, addTeamMember } from '@/lib/db'

export async function GET() {
  try {
    const team = await getTeamMembers()
    return NextResponse.json(team)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { name, role, image_url } = await req.json()
    if (!name || !role || !image_url) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const teamMember = await addTeamMember(name, role, image_url)
    return NextResponse.json(teamMember)
  } catch (error) {
    console.error('Error adding team member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
