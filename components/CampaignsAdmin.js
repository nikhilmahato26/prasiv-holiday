'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, X, Check, Save } from 'lucide-react'
import ImageUploader from './ImageUploader'

export default function CampaignsAdmin({ isDemo }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    slug: '',
    name: '',
    title: '',
    description: '',
    image_url: '',
    offer_price: '',
    destination: '',
    package_details: '',
    other_information: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (campaign = null) => {
    if (campaign) {
      setEditingId(campaign.id)
      setForm({
        ...campaign,
        images: campaign.images || []
      })
    } else {
      if (editingId !== null) {
        setEditingId(null)
        setForm({
          slug: '', name: '', title: '', description: '', image_url: '', images: [], offer_price: '',
          destination: '', package_details: '', other_information: ''
        })
      }
    }
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (isDemo) {
      alert('Action disabled in demo mode.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        image_url: (form.images && form.images.length > 0) ? form.images[0] : ''
      }
      const url = editingId ? `/api/campaigns/${editingId}` : '/api/campaigns'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setModalOpen(false)
        setEditingId(null)
        setForm({
          slug: '', name: '', title: '', description: '', image_url: '', images: [], offer_price: '',
          destination: '', package_details: '', other_information: ''
        })
        fetchCampaigns()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (isDemo) {
      alert('Action disabled in demo mode.')
      return
    }
    if (!confirm('Are you sure you want to delete this campaign?')) return
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCampaigns()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleImageUploaded = (url) => {
    setForm({ ...form, image_url: url })
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Advertising Campaigns</h2>
        <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#013893', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          <Plus size={16} /> New Campaign
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
              <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600 }}>Slug</th>
              <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600 }}>Destination</th>
              <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600 }}>Price</th>
              <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600, width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '12px 16px' }}><a href={`/campaigns/${c.slug}`} target="_blank" style={{ color: '#013893' }}>/{c.slug}</a></td>
                <td style={{ padding: '12px 16px' }}>{c.destination || '-'}</td>
                <td style={{ padding: '12px 16px' }}>{c.offer_price || '-'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleOpenModal(c)} style={{ padding: 6, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#4b5563' }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)} style={{ padding: 6, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626' }}><Trash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No campaigns found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '16px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 700, borderRadius: 12, display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', flexShrink: 0, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editingId ? 'Edit Campaign' : 'New Campaign'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Internal Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} placeholder="e.g. Summer Sale 2024" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>URL Slug *</label>
                  <input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} placeholder="e.g. summer-sale" />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Display Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} placeholder="Headline for the landing page" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Offer Price</label>
                <input value={form.offer_price} onChange={e => setForm({...form, offer_price: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} placeholder="e.g. ₹9,999 or $499" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Destination</label>
                <input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} placeholder="e.g. Bali, Indonesia" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Short Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'inherit' }} placeholder="Introductory text" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Package Details (HTML/Text)</label>
                <textarea rows={5} value={form.package_details} onChange={e => setForm({...form, package_details: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'inherit' }} placeholder="Itinerary or inclusions" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Other Information</label>
                <textarea rows={3} value={form.other_information} onChange={e => setForm({...form, other_information: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'inherit' }} placeholder="Terms and conditions, etc." />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Campaign Hero Images (Slider)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                  {(form.images || []).map((imgUrl, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <ImageUploader 
                        url={imgUrl} 
                        onUrlChange={url => {
                          const newImages = [...(form.images || [])]
                          newImages[i] = url
                          setForm({...form, images: newImages})
                        }} 
                        height={120} 
                      />
                      <button type="button" onClick={() => {
                        const newImages = [...(form.images || [])]
                        newImages.splice(i, 1)
                        setForm({...form, images: newImages})
                      }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div 
                    onClick={() => setForm({...form, images: [...(form.images || []), '']})}
                    style={{ height: 120, borderRadius: 10, border: '1.5px dashed #d1d5db', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', gap: 6 }}
                  >
                    <Plus size={20} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Add Image</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10, borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 16px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 16px', background: '#013893', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saving ? 'Saving...' : <><Save size={16} /> Save Campaign</>}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
