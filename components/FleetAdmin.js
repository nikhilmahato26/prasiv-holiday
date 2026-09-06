'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Trash2, Plus, Edit2 } from 'lucide-react'
import ImageUploader from './ImageUploader'

export default function FleetAdmin() {
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ id: null, name: '', category: '', tag: '', tagColor: '#3b82f6', tagBg: '#eff6ff', desc: '', img: '', features: '', capacity: '', orderIdx: 0 })
  const [saving, setSaving] = useState(false)

  const fetchFleet = async () => {
    try {
      const res = await fetch('/api/fleet')
      if (res.ok) setFleet(await res.json())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFleet()
  }, [])

  const handleSave = async () => {
    if (!form.name || !form.category || !form.tag || !form.img || !form.capacity) {
      toast.error('Name, category, tag, capacity, and image are required')
      return
    }
    setSaving(true)
    try {
      const isEdit = !!form.id
      const url = isEdit ? `/api/fleet/${form.id}` : '/api/fleet'
      const method = isEdit ? 'PUT' : 'POST'
      
      const payload = {
        ...form,
        features: typeof form.features === 'string' 
          ? form.features.split(',').map(s => s.trim()).filter(Boolean) 
          : form.features
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error('Failed to save')
      toast.success(isEdit ? 'Vehicle updated' : 'Vehicle added')
      setModal(false)
      fetchFleet()
    } catch (err) {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    try {
      const res = await fetch(`/api/fleet/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Vehicle deleted')
      fetchFleet()
    } catch (err) {
      toast.error('Failed to delete vehicle')
    }
  }

  const S = {
    btn: (bg, color) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: bg, color, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }),
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
    card: { background: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Fleet Options</h2>
        <button onClick={() => { setForm({ id: null, name: '', category: '', tag: '', tagColor: '#3b82f6', tagBg: '#eff6ff', desc: '', img: '', features: '', capacity: '', orderIdx: fleet.length }); setModal(true) }} style={S.btn('#111', '#fff')}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div style={S.card}>
        {fleet.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9ca3af' }}>
            <p>No vehicles found. Add some to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  {['Photo', 'Name & Details', 'Capacity', 'Tag', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: i === 4 ? 'right' : 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fleet.map((v, idx) => (
                  <tr key={v.id} style={{ borderBottom: idx < fleet.length - 1 ? '1px solid #f9fafb' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', width: 100 }}>
                      <div style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6' }}>
                        {v.img && <img src={v.img} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#111', fontSize: 14 }}>{v.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{v.category}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{v.features?.join(', ')}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#374151' }}>{v.capacity}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: v.tagColor, background: v.tagBg, padding: '4px 8px', borderRadius: 999, textTransform: 'uppercase' }}>
                        {v.tag}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => { setForm({ ...v, features: v.features?.join(', ') || '' }); setModal(true) }} style={{ ...S.btn('#f3f4f6', '#374151'), padding: '6px 10px' }}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(v.id)} style={{ ...S.btn('#fef2f2', '#dc2626'), padding: '6px 10px' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', width: 600, maxHeight: '90vh', overflowY: 'auto', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{form.id ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Vehicle Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={S.input} placeholder="e.g. Swift Dzire" />
              </div>
              <div>
                <label style={S.label}>Category</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={S.input} placeholder="e.g. SEDAN" />
              </div>
              <div>
                <label style={S.label}>Capacity</label>
                <input type="text" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} style={S.input} placeholder="e.g. 4+1 Seats, 32-52 Seats" />
              </div>
              <div>
                <label style={S.label}>Tag (Label)</label>
                <input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} style={S.input} placeholder="e.g. ECONOMY" />
              </div>
              <div>
                <label style={S.label}>Color Theme</label>
                <select 
                  style={S.input}
                  value={form.tagColor}
                  onChange={e => {
                    const themes = {
                      '#3b82f6': '#eff6ff', // Blue
                      '#22c55e': '#f0fdf4', // Green
                      '#f59e0b': '#fffbeb', // Yellow/Amber
                      '#f97316': '#fff7ed', // Orange
                      '#a855f7': '#faf5ff', // Purple
                    }
                    setForm({ ...form, tagColor: e.target.value, tagBg: themes[e.target.value] || '#f3f4f6' })
                  }}
                >
                  <option value="#3b82f6">Blue</option>
                  <option value="#22c55e">Green</option>
                  <option value="#f59e0b">Amber</option>
                  <option value="#f97316">Orange</option>
                  <option value="#a855f7">Purple</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Description</label>
                <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} style={{ ...S.input, minHeight: 60 }} placeholder="Short description..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Features (Comma-separated)</label>
                <input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} style={S.input} placeholder="e.g. AC, Petrol/CNG, 4 Passengers" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Vehicle Image</label>
                <ImageUploader url={form.img} onUrlChange={url => setForm({ ...form, img: url })} height={160} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button onClick={() => setModal(false)} style={S.btn('#f3f4f6', '#4b5563')}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ ...S.btn('#8A6E1C', '#fff'), opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
