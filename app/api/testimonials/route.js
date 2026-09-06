import { NextResponse } from 'next/server'
import { getTestimonials, addTestimonial, deleteTestimonial, updateTestimonial } from '@/lib/db'
import { guardAdmin } from '@/lib/guardAdmin'

export async function GET() {
  try {
    const data = await getTestimonials()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const admin = await guardAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const body = await req.json()
    if (!body.name || !body.text) {
      return NextResponse.json({ error: 'Name and text are required' }, { status: 400 })
    }
    const t = await addTestimonial(body.name, body.text)
    return NextResponse.json(t)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const admin = await guardAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const body = await req.json()
    if (!body.id || !body.name || !body.text) {
      return NextResponse.json({ error: 'ID, name and text are required' }, { status: 400 })
    }
    const t = await updateTestimonial(body.id, body.name, body.text)
    return NextResponse.json(t)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const admin = await guardAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
      
    await deleteTestimonial(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
