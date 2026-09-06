'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Trash2, Plus, X, Check, Edit2 } from 'lucide-react'
import ImageUploader from './ImageUploader'

export default function TeamAdmin() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ id: null, name: '', role: '', image_url: '' })
  const [saving, setSaving] = useState(false)

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team')
      if (res.ok) setTeam(await res.json())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  const handleSave = async () => {
    if (!form.name || !form.role || !form.image_url) {
      toast.error('Name, role, and image are required')
      return
    }
    setSaving(true)
    try {
      const isEdit = !!form.id
      const url = isEdit ? `/api/team/${form.id}` : '/api/team'
      const method = isEdit ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (!res.ok) throw new Error('Failed to save')
      toast.success(isEdit ? 'Team member updated' : 'Team member added')
      setModal(false)
      fetchTeam()
    } catch (err) {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team member?')) return
    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Team member deleted')
      fetchTeam()
    } catch (err) {
      toast.error('Failed to delete team member')
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
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Our Team</h2>
        <button onClick={() => { setForm({ id: null, name: '', role: '', image_url: '' }); setModal(true) }} style={S.btn('#111', '#fff')}>
          <Plus size={16} /> Add Team Member
        </button>
      </div>

      <div style={S.card}>
        {team.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9ca3af' }}>
            <p>No team members found. Add some to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  {['ID', 'Name', 'Role', 'Photo', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: i === 4 ? 'right' : 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {team.map((member, idx) => (
                  <tr key={member.id} style={{ borderBottom: idx < team.length - 1 ? '1px solid #f9fafb' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#8A6E1C', background: '#FBF6E7', padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{member.id}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{member.name}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, color: '#8A6E1C', fontWeight: 600 }}>{member.role}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#f3f4f6' }}>
                        {member.image_url && <img src={member.image_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => { setForm(member); setModal(true) }} style={{ ...S.btn('#f3f4f6', '#374151'), padding: '6px 10px' }}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(member.id)} style={{ ...S.btn('#fef2f2', '#dc2626'), padding: '6px 10px' }}>
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
          <div style={{ background: '#fff', width: 400, borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{form.id ? 'Edit Team Member' : 'Add Team Member'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={S.label}>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={S.input} placeholder="Enter name" />
              </div>
              <div>
                <label style={S.label}>Role / Designation</label>
                <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={S.input} placeholder="e.g. Founder & CEO" />
              </div>
              <div>
                <label style={S.label}>Profile Image</label>
                <ImageUploader url={form.image_url} onUrlChange={url => setForm({ ...form, image_url: url })} height={160} />
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
