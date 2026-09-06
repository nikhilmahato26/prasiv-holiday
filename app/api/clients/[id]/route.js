import { NextResponse } from 'next/server'
import { deleteClient, updateClient } from '@/lib/db'

export async function DELETE(req, context) {
  try {
    const params = await context.params
    const { id } = params
    await deleteClient(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req, context) {
  try {
    const params = await context.params
    const { id } = params
    const { name, logo_url } = await req.json()
    if (!name || !logo_url) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const client = await updateClient(id, name, logo_url)
    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
