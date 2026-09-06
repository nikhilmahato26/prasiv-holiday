import { NextResponse } from 'next/server'
import { updateFleetVehicle, deleteFleetVehicle } from '@/lib/db'

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    const data = await req.json()
    const vehicle = await updateFleetVehicle(id, data)
    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error updating fleet vehicle:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    await deleteFleetVehicle(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fleet vehicle:', error)
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 })
  }
}
