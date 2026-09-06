import { NextResponse } from 'next/server'
import { getFleet, addFleetVehicle } from '@/lib/db'

export async function GET() {
  try {
    const fleet = await getFleet()
    return NextResponse.json(fleet)
  } catch (error) {
    console.error('Error fetching fleet:', error)
    return NextResponse.json({ error: 'Failed to fetch fleet' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const data = await req.json()
    const vehicle = await addFleetVehicle(data)
    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error adding fleet vehicle:', error)
    return NextResponse.json({ error: 'Failed to add fleet vehicle' }, { status: 500 })
  }
}
