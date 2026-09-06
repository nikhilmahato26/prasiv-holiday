import { NextResponse } from 'next/server'
import { getClients, addClient } from '@/lib/db'

export async function GET() {
  try {
    const clients = await getClients()
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { name, logo_url } = await req.json()
    if (!name || !logo_url) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const client = await addClient(name, logo_url)
    return NextResponse.json(client)
  } catch (error) {
    console.error('Error adding client:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
