'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { invalidateSettingsCache } from '@/hooks/useSettings'
import TagSelector from '@/components/TagSelector'
import PackagePreview from '@/components/PackagePreview'
import HomestayFields from '@/components/HomestayFields'
import ImageUploader from '@/components/ImageUploader'
import TeamAdmin from '@/components/TeamAdmin'
import {
  Plus, Pencil, Copy, Trash2, LogOut, Eye, X, Check, ExternalLink, AlertTriangle,
  Package, MapPin, Inbox, Settings, Phone, MessageCircle, Mail, Calendar,
  Building2, CheckCircle, XCircle, Star, Home, Ship, ImageIcon, Trash, Users, Download
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

const PKG_PREFIX = { package: 'PKG', group: 'GPKG', homestay: 'HS', houseboat: 'HB', other: 'OTH' }
const CONFORMING_ID = /^(PKG|GPKG|HS|HB|OTH)-\d+$/
function generatePkgId(category, existingPackages) {
  const prefix = PKG_PREFIX[category] || 'PKG'
  const nums = existingPackages
    .filter(p => p.id && p.id.startsWith(prefix + '-'))
    .map(p => { const m = p.id.match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0 })
  return `${prefix}-${nums.length > 0 ? Math.max(...nums) + 1 : 101}`
}
function fmtDate(ts) { return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }



const STATUS_CONFIG = {
  pending:  { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb' },
  approved: { label: 'Approved',  color: '#22c55e', bg: '#f0fdf4' },
  rejected: { label: 'Rejected',  color: '#ef4444', bg: '#fef2f2' },
}

const ENQ_TYPE_LABEL = { package: 'Package', flight: 'Flight', train: 'Train' }
// Bucket an enquiry into package / flight / train. Heuristics first so legacy rows
// (created before the `type` column existed and defaulted to 'package') are classified
// correctly from their booking title.
function enquiryType(e) {
  if (e.package_title === 'Flight Ticket Booking' || e.destination === 'Flight Booking') return 'flight'
  if (e.package_title === 'Train Ticket Booking' || e.destination === 'Train Booking') return 'train'
  if (e.type === 'flight' || e.type === 'train' || e.type === 'package') return e.type
  return 'package'
}

// Pull the "Key: Value" lines, numbered people, and free-text notes out of the
// pre-formatted enquiry message the booking forms build.
function parseEnquiryDetails(msg) {
  const fields = {}, people = [], notes = []
  for (const raw of String(msg || '').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (/^-{2,}.*-{2,}$/.test(line)) continue                 // "--- AIR TICKET BOOKING REQUEST ---"
    if (/^[A-Z][A-Z /]+:$/.test(line)) continue               // section header "CONTACT DETAILS:"
    const num = line.match(/^\d+[.)]\s*(.+)$/)
    if (num) { people.push(num[1].trim()); continue }
    const kv = line.match(/^([A-Za-z][\w ./&-]{0,38}?):\s+(.+)$/)
    if (kv) { fields[kv[1].trim()] = kv[2].trim(); continue }
    notes.push(line)
  }
  return { fields, people, notes: notes.join(' ') }
}

// Column layout per enquiry type. Each entry: [Header, (enquiry, parsed) => cell]
const COMMON_COLS = [
  ['Enquiry ID', e => e.id],
  ['Received', e => new Date(e.created_at).toLocaleString('en-IN')],
  ['Name', e => e.name],
  ['Phone', e => e.phone],
  ['Email', (e, d) => e.email || d.fields['Email'] || d.fields['Email ID'] || ''],
]
const F = (d, ...keys) => { for (const k of keys) if (d.fields[k]) return d.fields[k]; return '' }
const ENQ_EXPORT_COLS = {
  package: [
    ...COMMON_COLS,
    ['Destination', (e, d) => e.destination || F(d, 'Destination')],
    ['Package', (e, d) => e.package_title || F(d, 'Package Selected')],
    ['Package ID', (e, d) => e.package_id || F(d, 'Package ID')],
    ['Travellers', (e, d) => d.people.join(' ; ')],
    ['Requirements', (e, d) => d.notes],
  ],
  flight: [
    ...COMMON_COLS,
    ['Journey Date', (e, d) => F(d, 'Journey Date')],
    ['From', (e, d) => F(d, 'From')],
    ['To', (e, d) => F(d, 'To')],
    ['Flight No.', (e, d) => F(d, 'Flight Name/No.', 'Flight No.', 'Flight')],
    ['Departure Time', (e, d) => F(d, 'Departure Time')],
    ['Class', (e, d) => F(d, 'Class')],
    ['Trip Type', (e, d) => F(d, 'Trip Type')],
    ['Passengers', (e, d) => d.people.join(' ; ')],
    ['Address', (e, d) => F(d, 'Address')],
  ],
  train: [
    ...COMMON_COLS,
    ['From Station', (e, d) => F(d, 'From Station')],
    ['To Station', (e, d) => F(d, 'To Station')],
    ['Journey Date', (e, d) => F(d, 'Journey Date')],
    ['Train No. & Name', (e, d) => F(d, 'Train No. & Name', 'Train No', 'Train')],
    ['Class', (e, d) => F(d, 'Class')],
    ['Quota', (e, d) => F(d, 'Quota')],
    ['Passengers', (e, d) => d.people.join(' ; ')],
    ['Address', (e, d) => F(d, 'Address')],
  ],
}

function enquiriesToCSV(rows, type) {
  const esc = v => {
    const s = v == null ? '' : String(v)
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const cols = ENQ_EXPORT_COLS[type] || ENQ_EXPORT_COLS.package
  const lines = [cols.map(c => c[0]).join(',')]
  for (const e of rows) {
    const d = parseEnquiryDetails(e.message)
    lines.push(cols.map(c => esc(c[1](e, d))).join(','))
  }
  return lines.join('\r\n')
}

const EMPTY_PKG = {
  id: '', destination: '', badge: '', badgeColor: '#16294D',
  duration: '3', title: '', subtitle: '', hotels: '',
  adults: '', children: '', rooms: '',
  originalPrice: '', salePrice: '', childPrice: '', childAgeMin: '', childAgeMax: '', priceNote: 'Per Person',
  image: '', heroImage: '', imagePos: '', heroImagePos: '', overview: '', note: '', category: 'package',
  highlights: [], inclusions: [], exclusions: [],
  itinerary: [{ day: 1, title: '', description: '', activities: [{ time: '', emoji: '', title: '', details: [''], tags: [] }], image: '', hotel: '' }],
  availableDates: [],
  // Homestay-specific
  address: '', mapUrl: '', starRating: '', rating: '', ratingLabel: '',
  amenities: [], roomTypes: [], nearby: [],
  checkIn: '', checkOut: '', frontDesk: '', childPolicy: '', cribsExtraBeds: '', finePrint: '',
}

function fmtRange(start, end) {
  if (!start && !end) return ''
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const f = d => { const dt = new Date(d + 'T00:00:00'); return `${dt.getDate()} ${M[dt.getMonth()]}, ${dt.getFullYear()}` }
  const s = start ? f(start) : '', e = end ? f(end) : ''
  return s && e ? `${s} – ${e}` : s || e
}
function autoMonth(dateStr) {
  if (!dateStr) return ''
  const dt = new Date(dateStr + 'T00:00:00')
  return dt.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}
function getDR(dr) { return (dr && typeof dr === 'object') ? dr : { start: '', end: dr || '' } }

export default function Dashboard() {
  const router = useRouter()
  const [allPackages, setAllPackages] = useState([])
  const [destinations, setDestinations] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [agencies, setAgencies] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [gallery, setGallery] = useState([])
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [testimonialModal, setTestimonialModal] = useState(null)
  const [testimonialForm, setTestimonialForm] = useState({ name: '', text: '' })
  const [testimonialSaving, setTestimonialSaving] = useState(false)

  const [section, setSection] = useState('packages')
  const [pkgFilter, setPkgFilter] = useState('all')      // 'all' | 'group' | 'homestay' | 'other'
  const [pkgStatus, setPkgStatus] = useState('approved') // 'approved' | 'pending' | 'rejected' | 'all'
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_PKG)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [tab, setTab] = useState('basic')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [pkgVisLoading, setPkgVisLoading] = useState(null)
  const [pkgSearch, setPkgSearch] = useState('')
  const [agencyFilter, setAgencyFilter] = useState('all')
  const [pkgAgencyFilter, setPkgAgencyFilter] = useState('all')
  const [agencyDropdownOpen, setAgencyDropdownOpen] = useState(false)
  const [agencyDropdownSearch, setAgencyDropdownSearch] = useState('')
  const [catDropdownOpen, setCatDropdownOpen] = useState(false)
  const [enqCategory, setEnqCategory] = useState('all')
  const [enqModal, setEnqModal] = useState(null)
  const [pkgOptions, setPkgOptions] = useState({ inclusion: [], exclusion: [], highlight: [] })

  const [newDest, setNewDest] = useState({ name: '', color: '#8A6E1C', image_url: '', description: '', emoji: '📍', image_pos: '' })
  const [destVisLoading, setDestVisLoading] = useState(null)
  const [destSaving, setDestSaving] = useState(false)
  const [editDestId, setEditDestId] = useState(null)
  const [editDestForm, setEditDestForm] = useState({ color: '#8A6E1C', image_url: '', description: '', emoji: '📍', image_pos: '' })

  // Listings (homestays & houseboats)
  const [homestays, setHomestays] = useState([])
  const [houseboats, setHouseboats] = useState([])
  const [listingModalType, setListingModalType] = useState(null) // 'homestay' | 'houseboat'
  const [newListing, setNewListing] = useState({ name: '', color: '#8A6E1C', image_url: '', description: '', location: '', price: '', emoji: '🏡', image_pos: '' })
  const [listingSaving, setListingSaving] = useState(false)
  const [listingVisLoading, setListingVisLoading] = useState(null)
  const [editListingId, setEditListingId] = useState(null)
  const [editListingForm, setEditListingForm] = useState({ color: '#8A6E1C', image_url: '', description: '', location: '', price: '', emoji: '🏡', image_pos: '' })
  const [settingsForm, setSettingsForm] = useState({ phone: '', whatsapp: '', email: '', email2: '', facebook_url: '', instagram_url: '', banner_days: '30', admin_recovery_email: '', min_dest_packages: '1' })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages/admin')
      if (res.ok) {
        const pkgs = await res.json()
        setAllPackages(pkgs)
        // Auto-rename any old-format IDs silently
        if (pkgs.some(p => !CONFORMING_ID.test(p.id))) {
          fetch('/api/packages/migrate-ids', { method: 'POST' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data?.renamed?.length > 0) {
                fetch('/api/packages/admin').then(r => r.ok ? r.json() : null).then(p => { if (p) setAllPackages(p) }).catch(() => {})
              }
            })
            .catch(() => {})
        }
      }
    } catch {}
    setLoaded(true)
  }, [])

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await fetch('/api/destinations')
      if (res.ok) setDestinations(await res.json())
    } catch {}
  }, [])

  const fetchListings = useCallback(async () => {
    try {
      const [hs, hb] = await Promise.all([
        fetch('/api/listings?type=homestay').then(r => r.ok ? r.json() : []),
        fetch('/api/listings?type=houseboat').then(r => r.ok ? r.json() : []),
      ])
      setHomestays(hs); setHouseboats(hb)
    } catch {}
  }, [])

  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setGalleryUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: data.url }) })
        await fetchGallery()
        toast.success('Image added to gallery')
      } else throw new Error()
    } catch { toast.error('Upload failed') }
    finally { setGalleryUploading(false) }
  }

  const handleDeleteGallery = async (id) => {
    try {
      await fetch('/api/gallery?id=' + id, { method: 'DELETE' })
      await fetchGallery()
      toast.success('Image deleted')
    } catch { toast.error('Delete failed') }
  }

  const fetchEnquiries = useCallback(async () => {
    try {
      const res = await fetch('/api/enquiries')
      if (res.ok) setEnquiries(await res.json())
    } catch {}
  }, [])

  const fetchGallery = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery')
      if (res.ok) setGallery(await res.json())
    } catch {}
  }, [])

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/testimonials')
      if (res.ok) setTestimonials(await res.json())
    } catch {}
  }, [])

  const fetchAgencies = useCallback(async () => {
    try {
      const res = await fetch('/api/agencies')
      if (res.ok) setAgencies(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    fetchPackages()
    fetchDestinations()
    fetchListings()
    fetch('/api/package-options').then(r => r.ok ? r.json() : null).then(d => { if (d) setPkgOptions(d) }).catch(() => {})
  }, [fetchPackages, fetchDestinations, fetchListings])

  useEffect(() => {
    if (section === 'enquiries') fetchEnquiries()
    if (section === 'agencies') fetchAgencies()
    if (section === 'gallery') fetchGallery()
    if (section === 'testimonials') fetchTestimonials()
    if (section === 'settings') {
      let ignore = false
      fetch('/api/settings').then(r => r.ok ? r.json() : null).then(s => { if (!ignore && s) setSettingsForm({ phone: s.phone || '', whatsapp: s.whatsapp || '', email: s.email || '', email2: s.email2 || '', facebook_url: s.facebook_url || '', instagram_url: s.instagram_url || '', banner_days: s.banner_days || '30', admin_recovery_email: s.admin_recovery_email || '', min_dest_packages: s.min_dest_packages || '1' }) }).catch(() => {})
      fetch('/api/auth/admin-profile').then(r => r.ok ? r.json() : null).then(d => { if (!ignore && d?.username) { setAdminUsername(d.username); setNewUsername(d.username) } }).catch(() => {})
      return () => { ignore = true }
    }
  }, [section, fetchEnquiries, fetchAgencies, fetchGallery, fetchTestimonials])

  const destColor = (name) => destinations.find(d => d.name === name)?.color ?? '#9ca3af'

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
  }

  // ─── Package handlers ──────────────────────────────────────────────────────

  const openAdd = () => {
    const first = destinations[0]
    const pkgId = generatePkgId('package', allPackages)
    setForm({ ...EMPTY_PKG, id: pkgId, destination: first?.name ?? '', badgeColor: first?.color ?? '#16294D' })
    setEditId(null); setTab('basic'); setShowPreview(false); setModal('form')
  }

  const openEdit = (pkg) => {
    const migrateAct = a => typeof a === 'string'
      ? { time: '', emoji: '', title: a, details: [''], tags: [] }
      : { time: a.time || '', emoji: a.emoji || '', title: a.title || '', details: a.details?.length ? a.details : [''], tags: a.tags || [] }
    setForm({
      ...pkg,
      highlights: pkg.highlights || [],
      inclusions: pkg.inclusions || [],
      exclusions: pkg.exclusions || [],
      itinerary: pkg.itinerary?.length ? pkg.itinerary.map(d => ({ ...d, hotel: d.hotel || '', activities: d.activities?.length ? d.activities.map(migrateAct) : [{ time: '', emoji: '', title: '', details: [''], tags: [] }], image: d.image || '' })) : [{ day: 1, title: '', description: '', activities: [{ time: '', emoji: '', title: '', details: [''], tags: [] }], image: '', hotel: '' }],
      availableDates: pkg.availableDates || [],
    })
    setEditId(pkg.id); setTab('basic'); setShowPreview(false); setModal('form')
  }

  const openDuplicate = (pkg) => {
    const migrateAct = a => typeof a === 'string'
      ? { time: '', emoji: '', title: a, details: [''], tags: [] }
      : { time: a.time || '', emoji: a.emoji || '', title: a.title || '', details: a.details?.length ? a.details : [''], tags: a.tags || [] }
    setForm({
      ...EMPTY_PKG,
      ...pkg,
      id: generatePkgId(pkg.category, allPackages),
      title: pkg.title ? `${pkg.title} (Copy)` : '',
      featured: false, featuredAt: null, featuredDays: 30, hidden: false,
      highlights: pkg.highlights || [],
      inclusions: pkg.inclusions || [],
      exclusions: pkg.exclusions || [],
      itinerary: pkg.itinerary?.length ? pkg.itinerary.map(d => ({ ...d, hotel: d.hotel || '', activities: d.activities?.length ? d.activities.map(migrateAct) : [{ time: '', emoji: '', title: '', details: [''], tags: [] }], image: d.image || '' })) : [{ day: 1, title: '', description: '', activities: [{ time: '', emoji: '', title: '', details: [''], tags: [] }], image: '', hotel: '' }],
      availableDates: pkg.availableDates || [],
    })
    setEditId(null); setTab('basic'); setShowPreview(false); setModal('form')
    toast.success('Duplicated — adjust and save as a new package')
  }

  const handleSave = async () => {
    if (!form.title?.trim()) { toast.error('Package title is required'); setShowPreview(false); setTab('basic'); return }
    if (!form.salePrice) { toast.error('Sale price is required'); setShowPreview(false); setTab('basic'); return }
    const pkg = {
      ...form,
      originalPrice: Number(form.originalPrice) || 0,
      salePrice: Number(form.salePrice) || 0,
      childPrice: Number(form.childPrice) || 0,
      adults: Number(form.adults) || 0,
      children: Number(form.children) || 0,
      rooms: Number(form.rooms) || 0,
      highlights: (form.highlights || []).filter(Boolean),
      inclusions: (form.inclusions || []).filter(Boolean),
      exclusions: (form.exclusions || []).filter(Boolean),
      itinerary: (form.itinerary || []).map(d => ({ ...d, activities: (d.activities || []).map(a => typeof a === 'string' ? { time: '', emoji: '', title: a, details: [], tags: [] } : { ...a, details: (a.details || []).filter(Boolean) }).filter(a => a.title || a.details?.length) })),
    }
    setSaving(true)
    try {
      if (editId) {
        await fetch(`/api/packages/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pkg) })
      } else {
        await fetch('/api/packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pkg) })
      }
      await fetchPackages()
      setModal(null)
      toast.success(editId ? 'Package updated!' : 'Package added!')
    } catch {
      toast.error('Failed to save package.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await fetch(`/api/packages/${deleteId}`, { method: 'DELETE' })
      await fetchPackages()
      setModal(null); setDeleteId(null)
      toast.success('Package deleted')
    } catch {
      toast.error('Failed to delete package.')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (id, status) => {
    setActionLoading(`approve-${id}-${status}`)
    try {
      const res = await fetch(`/api/packages/${id}/approve`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error()
      await fetchPackages()
      toast.success(`Package ${status}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTogglePkgHidden = async (id, hidden) => {
    setPkgVisLoading(id)
    try {
      const res = await fetch(`/api/packages/${id}/hide`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hidden }) })
      if (!res.ok) throw new Error()
      await fetchPackages()
      toast.success(hidden ? 'Package hidden from website' : 'Package visible on website')
    } catch {
      toast.error('Failed to update visibility')
    } finally {
      setPkgVisLoading(null)
    }
  }

  const handleFeature = async (id, featured, order = 0) => {
    setActionLoading(`feature-${id}`)
    try {
      const res = await fetch(`/api/packages/${id}/feature`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured, order }) })
      if (!res.ok) throw new Error()
      await fetchPackages()
      toast.success(featured ? 'Added to hero' : 'Removed from hero')
    } catch {
      toast.error('Failed to update featured status')
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Agency handlers ───────────────────────────────────────────────────────

  const handleAgencyStatus = async (id, status) => {
    setActionLoading(`agency-${id}-${status}`)
    try {
      const res = await fetch(`/api/agencies/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error()
      await fetchAgencies()
      toast.success(`Agency ${status}`)
    } catch {
      toast.error('Failed to update agency')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteAgency = (id, name) => {
    setConfirm({
      message: `Delete agency "${name}"? Their packages will remain but be unlinked.`,
      onConfirm: async () => {
        setConfirm(null)
        try {
          await fetch(`/api/agencies/${id}`, { method: 'DELETE' })
          await fetchAgencies()
          toast.success('Agency deleted')
        } catch { toast.error('Failed to delete agency') }
      },
    })
  }

  // ─── Destination handlers ──────────────────────────────────────────────────

  const handleAddDestination = async () => {
    if (!newDest.name.trim()) { toast.error('Category name is required'); return }
    setDestSaving(true)
    try {
      const res = await fetch('/api/destinations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDest) })
      if (!res.ok) { const { error } = await res.json(); toast.error(error || 'Failed'); return }
      await fetchDestinations()
      setNewDest({ name: '', color: '#8A6E1C', image_url: '', description: '', emoji: '📍', image_pos: '' })
      toast.success('Category added!')
    } catch { toast.error('Failed to add destination.') }
    finally { setDestSaving(false) }
  }

  const handleUpdateDestination = async (id) => {
    try {
      const res = await fetch(`/api/destinations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editDestForm) })
      if (!res.ok) throw new Error()
      await fetchDestinations(); setEditDestId(null)
      toast.success('Category updated!')
    } catch { toast.error('Failed to update destination.') }
  }

  const handleToggleDestFeatured = async (id, featured) => {
    setDestVisLoading(id)
    try {
      const res = await fetch(`/api/destinations/${id}/feature`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured }) })
      if (!res.ok) throw new Error()
      await fetchDestinations()
      toast.success(featured ? 'Category shown on website' : 'Category hidden from website')
    } catch { toast.error('Failed to update destination visibility') }
    finally { setDestVisLoading(null) }
  }

  const handleDeleteDestination = (id, name) => {
    setConfirm({
      message: `Delete "${name}"? Existing packages will not be affected.`,
      onConfirm: async () => {
        setConfirm(null)
        try {
          await fetch(`/api/destinations/${id}`, { method: 'DELETE' })
          await fetchDestinations()
          toast.success('Category deleted')
        } catch { toast.error('Failed to delete destination.') }
      },
    })
  }

  // ─── Listing handlers (homestays & houseboats) ──────────────────────────────
  const LISTING_LABEL = { homestay: 'Homestay', houseboat: 'Houseboat' }

  const handleAddListing = async (type) => {
    if (!newListing.name.trim()) { toast.error(`${LISTING_LABEL[type]} name is required`); return }
    setListingSaving(true)
    try {
      const res = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newListing, type }) })
      if (!res.ok) { const { error } = await res.json(); toast.error(error || 'Failed'); return }
      await fetchListings()
      setNewListing({ name: '', color: '#8A6E1C', image_url: '', description: '', location: '', price: '', emoji: type === 'houseboat' ? '🛶' : '🏡', image_pos: '' })
      toast.success(`${LISTING_LABEL[type]} added!`)
    } catch { toast.error('Failed to add.') }
    finally { setListingSaving(false) }
  }

  const handleUpdateListing = async (id) => {
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editListingForm) })
      if (!res.ok) throw new Error()
      await fetchListings(); setEditListingId(null)
      toast.success('Updated!')
    } catch { toast.error('Failed to update.') }
  }

  const handleToggleListingFeatured = async (id, featured) => {
    setListingVisLoading(id)
    try {
      const res = await fetch(`/api/listings/${id}/feature`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured }) })
      if (!res.ok) throw new Error()
      await fetchListings()
      toast.success(featured ? 'Shown on website' : 'Hidden from website')
    } catch { toast.error('Failed to update visibility') }
    finally { setListingVisLoading(null) }
  }

  const handleDeleteListing = (id, name) => {
    setConfirm({
      message: `Delete "${name}"?`,
      onConfirm: async () => {
        setConfirm(null)
        try {
          await fetch(`/api/listings/${id}`, { method: 'DELETE' })
          await fetchListings()
          toast.success('Deleted')
        } catch { toast.error('Failed to delete.') }
      },
    })
  }

  const handleDeleteEnquiry = (id) => {
    setConfirm({
      message: 'Delete this enquiry? This cannot be undone.',
      onConfirm: async () => {
        setConfirm(null)
        try {
          await fetch(`/api/enquiries/${id}`, { method: 'DELETE' })
          setEnquiries(prev => prev.filter(e => e.id !== id))
          toast.success('Enquiry deleted')
        } catch { toast.error('Failed to delete enquiry.') }
      },
    })
  }

  const handleSaveSettings = async () => {
    if (!settingsForm.phone.trim()) { toast.error('Phone number is required'); return }
    setSettingsSaving(true)
    try {
      const payload = {
        phone: settingsForm.phone.trim().replace(/\D/g, ''),
        whatsapp: (settingsForm.whatsapp.trim() || settingsForm.phone.trim()).replace(/\D/g, ''),
        email: settingsForm.email.trim(),
        email2: settingsForm.email2.trim(),
        facebook_url: settingsForm.facebook_url.trim(),
        instagram_url: settingsForm.instagram_url.trim(),
        banner_days: String(Math.max(1, parseInt(settingsForm.banner_days) || 30)),
        admin_recovery_email: settingsForm.admin_recovery_email.trim(),
        min_dest_packages: String(Math.max(0, parseInt(settingsForm.min_dest_packages) || 1)),
      }
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error()
      invalidateSettingsCache()
      toast.success('Settings saved!')
    } catch { toast.error('Failed to save settings.') }
    finally { setSettingsSaving(false) }
  }

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) { toast.error('Username cannot be empty'); return }
    if (newUsername.trim() === adminUsername) { toast.info('Username unchanged'); return }
    setUsernameSaving(true)
    try {
      const res = await fetch('/api/auth/admin-profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newUsername: newUsername.trim() }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to update username'); return }
      setAdminUsername(data.username)
      toast.success('Username updated!')
    } catch { toast.error('Failed to update username') }
    finally { setUsernameSaving(false) }
  }

  // ─── Array helpers ────────────────────────────────────────────────────────
  const itinChange = (di, field, val) => setForm(f => ({ ...f, itinerary: (f.itinerary || []).map((d, i) => i === di ? { ...d, [field]: val } : d) }))
  const addDay = () => setForm(f => ({ ...f, itinerary: [...(f.itinerary || []), { day: (f.itinerary || []).length + 1, title: '', description: '', activities: [{ time: '', emoji: '', title: '', details: [''], tags: [] }], image: '', hotel: '' }] }))
  const removeDay = (idx) => setForm(f => ({ ...f, itinerary: (f.itinerary || []).filter((_, i) => i !== idx) }))
  const addActivity = (di) => setForm(f => ({ ...f, itinerary: (f.itinerary || []).map((d, i) => i !== di ? d : { ...d, activities: [...(d.activities || []), { time: '', emoji: '', title: '', details: [''], tags: [] }] }) }))
  const removeActivity = (di, ai) => setForm(f => ({ ...f, itinerary: (f.itinerary || []).map((d, i) => i !== di ? d : { ...d, activities: (d.activities || []).filter((_, j) => j !== ai) }) }))
  const actFieldChange = (di, ai, field, val) => setForm(f => ({ ...f, itinerary: (f.itinerary || []).map((d, i) => { if (i !== di) return d; const acts = [...(d.activities || [])]; acts[ai] = { ...acts[ai], [field]: val }; return { ...d, activities: acts } }) }))
  const actDetailChange = (di, ai, ki, val) => setForm(f => ({ ...f, itinerary: (f.itinerary || []).map((d, i) => { if (i !== di) return d; const acts = [...(d.activities || [])]; const det = [...(acts[ai].details || [])]; det[ki] = val; acts[ai] = { ...acts[ai], details: det }; return { ...d, activities: acts } }) }))
  const addActDetail = (di, ai) => setForm(f => ({ ...f, itinerary: (f.itinerary || []).map((d, i) => { if (i !== di) return d; const acts = [...(d.activities || [])]; acts[ai] = { ...acts[ai], details: [...(acts[ai].details || []), ''] }; return { ...d, activities: acts } }) }))
  const removeActDetail = (di, ai, ki) => setForm(f => ({ ...f, itinerary: (f.itinerary || []).map((d, i) => { if (i !== di) return d; const acts = [...(d.activities || [])]; acts[ai] = { ...acts[ai], details: (acts[ai].details || []).filter((_, j) => j !== ki) }; return { ...d, activities: acts } }) }))

  const addDateGroup = () => setForm(f => ({ ...f, availableDates: [...(f.availableDates || []), { month: '', dates: [{ start: '', end: '' }] }] }))
  const removeDateGroup = (gi) => setForm(f => ({ ...f, availableDates: (f.availableDates || []).filter((_, i) => i !== gi) }))
  const dateGroupChange = (gi, field, val) => setForm(f => ({ ...f, availableDates: (f.availableDates || []).map((g, i) => i === gi ? { ...g, [field]: val } : g) }))
  const addDateRange = (gi) => setForm(f => ({ ...f, availableDates: (f.availableDates || []).map((g, i) => i === gi ? { ...g, dates: [...(g.dates || []), { start: '', end: '' }] } : g) }))
  const removeDateRange = (gi, di) => setForm(f => ({ ...f, availableDates: (f.availableDates || []).map((g, i) => i !== gi ? g : { ...g, dates: (g.dates || []).filter((_, j) => j !== di) }) }))
  const setDateField = (gi, di, field, val) => setForm(f => ({ ...f, availableDates: (f.availableDates || []).map((g, i) => i !== gi ? g : { ...g, dates: (g.dates || []).map((d, j) => j !== di ? d : { ...getDR(d), [field]: val }) }) }))

  // ─── Derived data ─────────────────────────────────────────────────────────
  const uniquePkgAgencies = [...new Set(allPackages.map(p => p.agencyName).filter(Boolean))].sort()

  const filteredPackages = allPackages
    .filter(p => pkgFilter === 'all' || p.destination === pkgFilter)
    .filter(p => pkgStatus === 'all' || p.status === pkgStatus)
    .filter(p => pkgAgencyFilter === 'all' || p.agencyName === pkgAgencyFilter)
    .filter(p => !pkgSearch.trim() || p.id.toLowerCase().includes(pkgSearch.toLowerCase()) || (p.title || '').toLowerCase().includes(pkgSearch.toLowerCase()))

  const pendingCount = allPackages.filter(p => p.status === 'pending').length
  const pendingAgencies = agencies.filter(a => a.status === 'pending').length
  const featuredPackages = allPackages.filter(p => p.featured && p.status === 'approved')

  const filteredAgencies = agencyFilter === 'all' ? agencies : agencies.filter(a => a.status === agencyFilter)

  const S = {
    page:        { minHeight: '100vh', background: '#f5f1eb' },
    topbar:      { position: 'sticky', top: 0, zIndex: 40, background: '#fff', borderBottom: '1px solid #f3f4f6', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' },
    topbarInner: { maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    body:        { maxWidth: 1280, margin: '0 auto', padding: '28px 20px' },
    card:        { background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', overflow: 'hidden' },
    btn:         (bg = '#16294D', col = '#fff') => ({ padding: '8px 16px', borderRadius: 10, background: bg, color: col, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }),
    input:       { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, color: '#111', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' },
    label:       { fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' },
    tag:         (active, color = '#16294D') => ({
                   padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                   background: active ? color : '#fff', color: active ? '#fff' : '#555',
                   boxShadow: active ? 'none' : '0 1px 4px rgba(0,0,0,0.07)',
                 }),
    overlay:     { position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px', overflowY: 'auto' },
    modal:       { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 860, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', marginBottom: 32 },
  }

  const LISTING_META = {
    homestay:  { label: 'Homestay',  plural: 'Homestays',  icon: Home, emoji: '🏡', noun: 'homestays' },
    houseboat: { label: 'Houseboat', plural: 'Houseboats', icon: Ship, emoji: '🛶', noun: 'houseboats' },
  }

  const openListingModal = (type) => {
    setNewListing({ name: '', color: '#8A6E1C', image_url: '', description: '', location: '', price: '', emoji: LISTING_META[type].emoji, image_pos: '' })
    setEditListingId(null)
    setListingModalType(type)
    setModal('listing')
  }

  const renderListingSection = (type, items) => {
    const meta = LISTING_META[type]
    const Icon = meta.icon
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111', margin: 0 }}>{meta.plural}</h2>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>{items.length} total · {items.filter(d => d.featured !== false).length} shown on website</p>
          </div>
          <button onClick={() => openListingModal(type)} style={S.btn()}>
            <Plus size={13} /> Add {meta.label}
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ ...S.card, padding: '60px 24px', textAlign: 'center', color: '#9ca3af' }}>
            <Icon size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: 15 }}>No {meta.noun} yet</p>
            <p style={{ fontSize: 13 }}>Add {meta.noun} to showcase them on your website.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(d => (
              <div key={d.id} style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 56, height: 44, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                      {d.image_url && <img src={d.image_url} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{d.emoji || meta.emoji} {d.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                        {d.location && <span style={{ color: '#6b7280' }}>📍 {d.location}</span>}
                        {d.description && <span style={{ marginLeft: d.location ? 8 : 0, color: '#6b7280' }}>{d.location ? '· ' : ''}{d.description}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleToggleListingFeatured(d.id, !(d.featured !== false))}
                      disabled={listingVisLoading === d.id}
                      title={d.featured !== false ? 'Shown on website — click to hide' : 'Hidden from website — click to show'}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${d.featured !== false ? '#22c55e' : '#e5e7eb'}`, background: d.featured !== false ? '#f0fdf4' : '#f9fafb', cursor: listingVisLoading === d.id ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12, color: d.featured !== false ? '#22c55e' : '#9ca3af', opacity: listingVisLoading === d.id ? 0.7 : 1 }}>
                      {listingVisLoading === d.id
                        ? <span style={{ width: 13, height: 13, border: `2px solid ${d.featured !== false ? '#bbf7d0' : '#e5e7eb'}`, borderTop: `2px solid ${d.featured !== false ? '#22c55e' : '#9ca3af'}`, borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                        : <Eye size={13} />}
                      {d.featured !== false ? 'Visible' : 'Hidden'}
                    </button>
                    <button onClick={() => { setEditListingId(d.id); setEditListingForm({ color: d.color, image_url: d.image_url || '', description: d.description || '', location: d.location || '', price: d.price || '', emoji: d.emoji || meta.emoji, image_pos: d.image_pos || '' }); setListingModalType(type); setModal('listing') }}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDeleteListing(d.id, d.name)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f1eb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #FAF7EC', borderTop: '3px solid #8A6E1C', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Sidebar Layout */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{ width: 250, background: '#fff', borderRight: '1px solid #f3f4f6', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f3f4f6' }}>
            <Image src="/logo.png" alt="Prashiv Holiday" width={96} height={96} style={{ objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
            {[
              { key: 'packages',      label: 'Packages',     icon: Package,   badge: pendingCount > 0 ? pendingCount : null },
              { key: 'destinations',  label: 'Categories',   icon: MapPin },
              { key: 'enquiries',     label: 'Enquiries',    icon: Inbox,     badge: enquiries.length > 0 && section !== 'enquiries' ? enquiries.length : null },
              { key: 'testimonials',  label: 'Testimonials', icon: MessageCircle },
              { key: 'gallery',       label: 'Gallery',      icon: ImageIcon },
              { key: 'team',          label: 'Team',         icon: Users },
              { key: 'settings',      label: 'Settings',     icon: Settings },
            ].map(({ key, label, icon: Icon, badge }) => (
              <button key={key} onClick={() => setSection(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, border: 'none', background: section === key ? '#fef2f2' : 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer', borderRight: `3px solid ${section === key ? '#16294D' : 'transparent'}`, color: section === key ? '#16294D' : '#6b7280', position: 'relative' }}>
                <Icon size={16} /> {label}
                {badge && (
                  <span style={{ marginLeft: 'auto', background: '#16294D', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ padding: '20px', borderTop: '1px solid #f3f4f6' }}>
            <button onClick={logout} style={{ ...S.btn('#fef2f2', '#dc2626'), width: '100%', justifyContent: 'center' }}>
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 40 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, textTransform: 'capitalize' }}>{section === 'destinations' ? 'Categories' : section}</h1>
            <Link href="/" target="_blank" style={{ ...S.btn('#f3f4f6', '#555'), textDecoration: 'none' }}>
              <ExternalLink size={13} /> View Site
            </Link>
          </div>
          <div style={S.body}>

        {/* ── Packages ── */}
        {section === 'packages' && (
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total', value: allPackages.length, color: '#111' },
                { label: 'Featured', value: featuredPackages.length, color: '#8A6E1C' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Search + Agency filter */}
            <div style={{ marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={pkgSearch}
                onChange={e => setPkgSearch(e.target.value)}
                placeholder="Search by Package ID or title..."
                style={{ width: '100%', maxWidth: 320, padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, color: '#111', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
              {uniquePkgAgencies.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setAgencyDropdownOpen(o => !o)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${pkgAgencyFilter !== 'all' ? '#8A6E1C' : '#e5e7eb'}`, background: pkgAgencyFilter !== 'all' ? '#FBF6E7' : '#fff', fontSize: 13, color: pkgAgencyFilter !== 'all' ? '#8A6E1C' : '#374151', cursor: 'pointer', fontWeight: pkgAgencyFilter !== 'all' ? 700 : 400, minWidth: 180, justifyContent: 'space-between' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={13} />
                      {pkgAgencyFilter === 'all' ? 'All Agencies' : pkgAgencyFilter}
                    </span>
                    <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
                  </button>
                  {agencyDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: 4, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 240, overflow: 'hidden' }}
                      onMouseLeave={() => setAgencyDropdownOpen(false)}
                    >
                      <div style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }}>
                        <input
                          autoFocus
                          value={agencyDropdownSearch}
                          onChange={e => setAgencyDropdownSearch(e.target.value)}
                          placeholder="Search agency..."
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {[{ value: 'all', label: 'All Agencies' }, ...uniquePkgAgencies.filter(a => a.toLowerCase().includes(agencyDropdownSearch.toLowerCase())).map(a => ({ value: a, label: a }))].map(opt => (
                          <button key={opt.value} onClick={() => { setPkgAgencyFilter(opt.value); setAgencyDropdownOpen(false); setAgencyDropdownSearch('') }}
                            style={{ width: '100%', padding: '9px 14px', textAlign: 'left', border: 'none', background: pkgAgencyFilter === opt.value ? '#FBF6E7' : 'none', color: pkgAgencyFilter === opt.value ? '#8A6E1C' : '#374151', fontSize: 13, fontWeight: pkgAgencyFilter === opt.value ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {opt.value !== 'all' && <Building2 size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />}
                            {opt.label}
                          </button>
                        ))}
                        {agencyDropdownSearch && uniquePkgAgencies.filter(a => a.toLowerCase().includes(agencyDropdownSearch.toLowerCase())).length === 0 && (
                          <div style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>No agencies found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {pkgAgencyFilter !== 'all' && (
                <button onClick={() => setPkgAgencyFilter('all')} style={{ fontSize: 12, color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>
                  Clear ✕
                </button>
              )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Category filter */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setCatDropdownOpen(o => !o)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${pkgFilter !== 'all' ? '#8A6E1C' : '#e5e7eb'}`, background: pkgFilter !== 'all' ? '#FBF6E7' : '#fff', fontSize: 13, color: pkgFilter !== 'all' ? '#8A6E1C' : '#374151', cursor: 'pointer', fontWeight: pkgFilter !== 'all' ? 700 : 400, minWidth: 180, justifyContent: 'space-between' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} />
                      {pkgFilter === 'all' ? 'All Categories' : pkgFilter}
                    </span>
                    <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
                  </button>
                  {catDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: 4, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 220, overflow: 'hidden' }}
                      onMouseLeave={() => setCatDropdownOpen(false)}
                    >
                      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                        {[{ value: 'all', label: 'All Categories' }, ...destinations.map(d => ({ value: d.name, label: d.name }))].map(opt => (
                          <button key={opt.value} onClick={() => { setPkgFilter(opt.value); setCatDropdownOpen(false) }}
                            style={{ width: '100%', padding: '9px 14px', textAlign: 'left', border: 'none', background: pkgFilter === opt.value ? '#FBF6E7' : 'none', color: pkgFilter === opt.value ? '#8A6E1C' : '#374151', fontSize: 13, fontWeight: pkgFilter === opt.value ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {opt.value !== 'all' && <MapPin size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setNewDest({ name: '', color: '#8A6E1C', image_url: '', description: '', emoji: '📍', image_pos: '' }); setEditDestId(null); setModal('destination') }} style={S.btn('#f3f4f6', '#555')}>
                  <MapPin size={13} /> Categories
                </button>
<button onClick={openAdd} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#8A6E1C,#8A6E1C)', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={16} /> Add Package
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={S.card}>
              {filteredPackages.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9ca3af' }}>
                  <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>No packages match the selected filters.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                        {['Pkg ID', 'Package', 'Category', 'Price', 'Status', 'Hero', 'Visible', 'Actions'].map((h, i) => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: i >= 5 ? 'center' : 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPackages.map((pkg, idx) => {
                        const sc = STATUS_CONFIG[pkg.status] || STATUS_CONFIG.pending
                        return (
                          <tr key={pkg.id} style={{ borderBottom: idx < filteredPackages.length - 1 ? '1px solid #f9fafb' : 'none', opacity: pkg.hidden ? 0.55 : 1 }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#8A6E1C', background: '#FBF6E7', padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{pkg.id}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 44, height: 36, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                                  {pkg.image && <img src={pkg.image} alt={pkg.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{pkg.title}</div>
                                  {pkg.agencyName && <div style={{ fontSize: 10, color: '#8A6E1C', marginTop: 1, fontWeight: 600 }}>🏢 {pkg.agencyName}</div>}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#fff', background: pkg.badgeColor || destColor(pkg.destination) }}>{pkg.destination || '—'}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700 }}>{fmt(pkg.salePrice)}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {pkg.status === 'pending' ? (
                                <div style={{ display: 'flex', gap: 4 }}>
                                  { /* Package approve/reject removed */ }
                                </div>
                              ) : (
                                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg }}>{sc.label}</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              {pkg.status === 'approved' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                  <button
                                    onClick={() => handleFeature(pkg.id, !pkg.featured, pkg.featured ? 0 : featuredPackages.length)}
                                    disabled={actionLoading === `feature-${pkg.id}`}
                                    title={pkg.featured ? 'Remove from hero' : 'Add to hero'}
                                    style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${pkg.featured ? '#fde68a' : '#e5e7eb'}`, background: pkg.featured ? '#fffbeb' : 'none', cursor: actionLoading === `feature-${pkg.id}` ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {actionLoading === `feature-${pkg.id}`
                                      ? <span style={{ width: 10, height: 10, border: '2px solid #fde68a', borderTop: '2px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                                      : <Star size={14} style={{ color: pkg.featured ? '#f59e0b' : '#d1d5db', fill: pkg.featured ? '#f59e0b' : 'none' }} />
                                    }
                                  </button>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleTogglePkgHidden(pkg.id, !pkg.hidden)}
                                disabled={pkgVisLoading === pkg.id}
                                title={pkg.hidden ? 'Hidden from website — click to show' : 'Visible on website — click to hide'}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, border: `1.5px solid ${pkg.hidden ? '#e5e7eb' : '#22c55e'}`, background: pkg.hidden ? '#f9fafb' : '#f0fdf4', cursor: pkgVisLoading === pkg.id ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 11, color: pkg.hidden ? '#9ca3af' : '#22c55e', opacity: pkgVisLoading === pkg.id ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                                {pkgVisLoading === pkg.id
                                  ? <span style={{ width: 10, height: 10, border: `2px solid ${pkg.hidden ? '#e5e7eb' : '#bbf7d0'}`, borderTop: `2px solid ${pkg.hidden ? '#9ca3af' : '#22c55e'}`, borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                                  : <Eye size={11} />}
                                {pkg.hidden ? 'Hidden' : 'Visible'}
                              </button>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                                <Link href={`/packages/${pkg.id}`} target="_blank"
                                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textDecoration: 'none' }}>
                                  <Eye size={13} />
                                </Link>
                                <button onClick={() => openEdit(pkg)} title="Edit"
                                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => openDuplicate(pkg)} title="Duplicate"
                                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                  <Copy size={13} />
                                </button>
                                <button onClick={() => { setDeleteId(pkg.id); setModal('delete') }}
                                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Destinations ── */}
        {section === 'destinations' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111', margin: 0 }}>Categories</h2>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>{destinations.length} total · {destinations.filter(d => d.featured !== false).length} shown on website</p>
              </div>
              <button onClick={() => { setNewDest({ name: '', color: '#8A6E1C', image_url: '', description: '', emoji: '📍', image_pos: '' }); setEditDestId(null); setModal('destination') }} style={S.btn()}>
                <Plus size={13} /> Add Destination
              </button>
            </div>

            {destinations.length === 0 ? (
              <div style={{ ...S.card, padding: '60px 24px', textAlign: 'center', color: '#9ca3af' }}>
                <MapPin size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontWeight: 600, fontSize: 15 }}>No categories yet</p>
                <p style={{ fontSize: 13 }}>Add categories to organise your packages.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {destinations.map(d => (
                  <div key={d.id} style={{ ...S.card, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 56, height: 44, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                          {d.image_url && <img src={d.image_url} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{d.emoji || '📍'} {d.name}</span>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                          </div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                            {allPackages.filter(p => p.destination === d.name).length} packages
                            {d.description && <span style={{ marginLeft: 8, color: '#6b7280' }}>· {d.description}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleToggleDestFeatured(d.id, !(d.featured !== false))}
                          disabled={destVisLoading === d.id}
                          title={d.featured !== false ? 'Shown on website — click to hide' : 'Hidden from website — click to show'}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${d.featured !== false ? '#22c55e' : '#e5e7eb'}`, background: d.featured !== false ? '#f0fdf4' : '#f9fafb', cursor: destVisLoading === d.id ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12, color: d.featured !== false ? '#22c55e' : '#9ca3af', opacity: destVisLoading === d.id ? 0.7 : 1 }}>
                          {destVisLoading === d.id
                            ? <span style={{ width: 13, height: 13, border: `2px solid ${d.featured !== false ? '#bbf7d0' : '#e5e7eb'}`, borderTop: `2px solid ${d.featured !== false ? '#22c55e' : '#9ca3af'}`, borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                            : <Eye size={13} />}
                          {d.featured !== false ? 'Visible' : 'Hidden'}
                        </button>
                        <button onClick={() => { setEditDestId(d.id); setEditDestForm({ color: d.color, image_url: d.image_url || '', description: d.description || '', emoji: d.emoji || '📍', image_pos: d.image_pos || '' }); setModal('destination') }}
                          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDeleteDestination(d.id, d.name)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Homestays ── */}
        {section === 'homestays' && renderListingSection('homestay', homestays)}

        {/* ── Houseboats ── */}
        {section === 'houseboats' && renderListingSection('houseboat', houseboats)}

        {/* ── Agencies ── */}
        {section === 'agencies' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111', margin: 0 }}>Agencies</h2>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>{agencies.length} registered · {pendingAgencies} pending review</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={fetchAgencies} style={S.btn('#f3f4f6', '#555')}>Refresh</button>
              </div>
            </div>

            {filteredAgencies.length === 0 ? (
              <div style={{ ...S.card, padding: '60px 24px', textAlign: 'center', color: '#9ca3af' }}>
                <Building2 size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontWeight: 600, fontSize: 15 }}>No agencies yet</p>
                <p style={{ fontSize: 13 }}>When travel agencies register, they appear here for review.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredAgencies.map(agency => {
                  const sc = STATUS_CONFIG[agency.status] || STATUS_CONFIG.pending
                  return (
                    <div key={agency.id} style={{ ...S.card, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#16294D,#0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Building2 size={16} style={{ color: '#fff' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{agency.name}</div>
                              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                {agency.package_count} packages · Applied {fmtDate(agency.created_at)}
                              </div>
                            </div>
                            <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg }}>{sc.label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: agency.description ? 8 : 0, alignItems: 'center' }}>
                            <a href={`mailto:${agency.email}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', textDecoration: 'none' }}>
                              <Mail size={13} style={{ color: '#6b7280' }} /> {agency.email}
                            </a>
                            <a href={`tel:${agency.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', textDecoration: 'none' }}>
                              <Phone size={13} style={{ color: '#8A6E1C' }} /> {agency.phone}
                            </a>
                            <a href={`https://wa.me/${agency.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#25d366', textDecoration: 'none', padding: '4px 12px', borderRadius: 999, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                              <MessageCircle size={12} /> WhatsApp
                            </a>
                            {agency.website && (
                              <a href={agency.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#16294D', textDecoration: 'none' }}>
                                <ExternalLink size={13} /> {agency.website}
                              </a>
                            )}
                          </div>
                          {agency.description && (
                            <p style={{ fontSize: 13, color: '#6b7280', background: '#f9fafb', borderRadius: 10, padding: '8px 12px', margin: 0, lineHeight: 1.6 }}>{agency.description}</p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => setDeleteId({ type: 'agency', id: agency.id })}
                            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Enquiries ── */}
        {section === 'enquiries' && (() => {
          const TYPE_TABS = [
            { key: 'all', label: 'All' },
            { key: 'package', label: 'Package' },
            { key: 'flight', label: 'Flight' },
            { key: 'train', label: 'Train' },
          ]
          const shownEnquiries = enqCategory === 'all'
            ? enquiries
            : enquiries.filter(e => enquiryType(e) === enqCategory)
          const exportCSV = () => {
            if (enqCategory === 'all') return
            const csv = enquiriesToCSV(shownEnquiries, enqCategory)
            const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `enquiries-${enqCategory}-${new Date().toISOString().slice(0, 10)}.csv`
            document.body.appendChild(a); a.click(); a.remove()
            URL.revokeObjectURL(url)
          }
          const activeLabel = TYPE_TABS.find(t => t.key === enqCategory)?.label
          return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111', margin: 0 }}>Customer Enquiries</h2>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>{shownEnquiries.length} shown · {enquiries.length} total</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {enqCategory !== 'all' && (
                  <button onClick={exportCSV} disabled={shownEnquiries.length === 0} style={{ ...S.btn('#16294D', '#fff'), opacity: shownEnquiries.length === 0 ? 0.5 : 1, cursor: shownEnquiries.length === 0 ? 'not-allowed' : 'pointer' }}>
                    <Download size={13} /> Export {activeLabel}
                  </button>
                )}
                <button onClick={fetchEnquiries} style={S.btn('#f3f4f6', '#555')}>Refresh</button>
              </div>
            </div>
            {enqCategory === 'all' && enquiries.length > 0 && (
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '-4px 0 12px' }}>Pick a category below to export it to Excel.</p>
            )}
            {enquiries.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {TYPE_TABS.map(t => (
                  <button key={t.key} onClick={() => setEnqCategory(t.key)} style={S.tag(enqCategory === t.key)}>
                    {t.label}{t.key !== 'all' && <span style={{ opacity: 0.6 }}> ({enquiries.filter(e => enquiryType(e) === t.key).length})</span>}
                  </button>
                ))}
              </div>
            )}
            {shownEnquiries.length === 0 ? (
              <div style={{ ...S.card, padding: '60px 24px', textAlign: 'center', color: '#9ca3af' }}>
                <Inbox size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontWeight: 600, fontSize: 15 }}>{enquiries.length === 0 ? 'No enquiries yet' : 'No enquiries in this category'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {shownEnquiries.map(enq => (
                  <div key={enq.id} style={{ ...S.card, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{enq.name}</span>
                          <span style={{ fontSize: 11, background: '#EEF2F8', color: '#16294D', padding: '2px 10px', borderRadius: 999, fontWeight: 700 }}>{ENQ_TYPE_LABEL[enquiryType(enq)]}</span>
                          {enquiryType(enq) === 'package' && enq.destination && <span style={{ fontSize: 11, background: '#f3f4f6', color: '#374151', padding: '2px 10px', borderRadius: 999, fontWeight: 600 }}>{enq.destination}</span>}
                          {enq.package_title && <span style={{ fontSize: 11, background: '#FBF6E7', color: '#8A6E1C', padding: '2px 10px', borderRadius: 999, fontWeight: 600 }}>{enq.package_title}</span>}
                          <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={10} /> {fmtDate(enq.created_at)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <a href={`tel:+${enq.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', textDecoration: 'none' }}><Phone size={13} style={{ color: '#8A6E1C' }} /> {enq.phone}</a>
                          <a href={`https://wa.me/${enq.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#25d366', textDecoration: 'none' }}><MessageCircle size={13} /> WhatsApp</a>
                          {enq.email && <a href={`mailto:${enq.email}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', textDecoration: 'none' }}><Mail size={13} style={{ color: '#6b7280' }} /> {enq.email}</a>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => setEnqModal(enq)} style={{ ...S.btn('#f3f4f6', '#374151'), padding: '6px 12px' }}>
                          <Eye size={13} /> View
                        </button>
                        <button onClick={() => handleDeleteEnquiry(enq.id)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {enqModal && (
              <div style={S.overlay} onClick={() => setEnqModal(null)}>
                <div style={{ ...S.modal, maxWidth: 560 }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, background: '#EEF2F8', color: '#16294D', padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>{ENQ_TYPE_LABEL[enquiryType(enqModal)]}</span>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', margin: 0 }}>{enqModal.name}</h3>
                    </div>
                    <button onClick={() => setEnqModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><X size={18} /></button>
                  </div>
                  <div style={{ padding: '18px 22px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 10, columnGap: 12, fontSize: 13, marginBottom: 16 }}>
                      <span style={{ color: '#9ca3af', fontWeight: 600 }}>Received</span>
                      <span style={{ color: '#111' }}>{fmtDate(enqModal.created_at)}</span>
                      <span style={{ color: '#9ca3af', fontWeight: 600 }}>Phone</span>
                      <span><a href={`tel:+${enqModal.phone}`} style={{ color: '#8A6E1C', textDecoration: 'none', fontWeight: 600 }}>{enqModal.phone}</a> · <a href={`https://wa.me/${enqModal.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600 }}>WhatsApp</a></span>
                      {enqModal.email && <><span style={{ color: '#9ca3af', fontWeight: 600 }}>Email</span><span><a href={`mailto:${enqModal.email}`} style={{ color: '#111', textDecoration: 'none' }}>{enqModal.email}</a></span></>}
                      {enquiryType(enqModal) === 'package' && enqModal.destination && <><span style={{ color: '#9ca3af', fontWeight: 600 }}>Destination</span><span style={{ color: '#111' }}>{enqModal.destination}</span></>}
                      {enqModal.package_id && <><span style={{ color: '#9ca3af', fontWeight: 600 }}>Package ID</span><span style={{ color: '#111', fontFamily: 'monospace' }}>{enqModal.package_id}</span></>}
                      {enqModal.package_title && <><span style={{ color: '#9ca3af', fontWeight: 600 }}>Package</span><span style={{ color: '#111' }}>{enqModal.package_title}</span></>}
                    </div>
                    {enqModal.message && (
                      <>
                        <span style={{ color: '#9ca3af', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Details</span>
                        <pre style={{ marginTop: 6, fontSize: 12.5, color: '#374151', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 10, padding: '12px 14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', lineHeight: 1.65, maxHeight: 320, overflowY: 'auto' }}>{enqModal.message}</pre>
                      </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
                      <button onClick={() => { handleDeleteEnquiry(enqModal.id); setEnqModal(null) }} style={S.btn('#fef2f2', '#dc2626')}><Trash2 size={13} /> Delete</button>
                      <button onClick={() => setEnqModal(null)} style={S.btn('#f3f4f6', '#374151')}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
          )
        })()}

        {/* ── Settings ── */}
        
        {section === 'testimonials' && (
          <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Testimonials</h1>
                <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Manage client testimonials displayed on the homepage.</p>
              </div>
              <button onClick={() => { setTestimonialModal('add'); setTestimonialForm({ name: '', text: '' }) }} style={{ ...S.btn('#FAF7EC', '#8A6E1C'), display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={16} /> Add Testimonial
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {testimonials.map(t => (
                <div key={t.id} style={{ ...S.card, padding: 24, position: 'relative' }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#111' }}>{t.name}</div>
                  <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 16 }}>&quot;{t.text}&quot;</p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                    <button onClick={() => { setTestimonialModal('edit'); setTestimonialForm(t) }} style={{ ...S.btn('#f3f4f6', '#555'), padding: '6px 12px' }}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={async () => {
                      if (!confirm('Delete this testimonial?')) return
                      try {
                        await fetch('/api/testimonials?id=' + t.id, { method: 'DELETE' })
                        fetchTestimonials()
                        toast.success('Testimonial deleted')
                      } catch { toast.error('Failed to delete') }
                    }} style={{ ...S.btn('#fef2f2', '#dc2626'), padding: '6px 12px' }}>
                      <Trash size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#FAF7EC', borderRadius: 16, color: '#9ca3af' }}>
                  No testimonials found.
                </div>
              )}
            </div>
          </div>
        )}

        {section === 'gallery' && (
          <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Gallery Images</h1>
                <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Manage images shown in the landing page gallery section.</p>
              </div>
              <div style={{ position: 'relative' }}>
                <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={galleryUploading}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: galleryUploading ? 'not-allowed' : 'pointer' }} />
                <button disabled={galleryUploading} style={{ ...S.btn('#FAF7EC', '#8A6E1C'), display: 'flex', alignItems: 'center', gap: 6 }}>
                  {galleryUploading ? <span style={{ width: 14, height: 14, border: '2px solid #e5dbce', borderTop: '2px solid #8A6E1C', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                  Add Image
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {gallery.map(img => (
                <div key={img.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img src={img.image_url} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => handleDeleteGallery(img.id)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash size={14} />
                  </button>
                </div>
              ))}
              {gallery.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#FAF7EC', borderRadius: 16, color: '#9ca3af' }}>
                  No images in gallery yet.
                </div>
              )}
            </div>
          </div>
        )}

        {section === 'team' && <TeamAdmin />}

        {section === 'settings' && (
          <>
          <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', background: '#fff', padding: '40px 48px', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 24, color: '#111', margin: 0 }}>Settings</h2>
              <button onClick={handleSaveSettings} disabled={settingsSaving}
                style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: settingsSaving ? 'not-allowed' : 'pointer', background: '#e95a14', color: '#fff', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7, opacity: settingsSaving ? 0.7 : 1 }}>
                {settingsSaving ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Saving...</> : 'Save Changes'}
              </button>
            </div>

            {/* Section 1: Contact Information */}
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>Contact Information</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Manage your contact details and how customers reach you.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Phone */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: '0 0 250px', fontSize: 14, fontWeight: 500, color: '#374151' }}>Phone Number</div>
                  <div style={{ flex: 1 }}>
                    <input value={settingsForm.phone} onChange={e => setSettingsForm(s => ({ ...s, phone: e.target.value }))} style={{ ...S.input, maxWidth: 400, borderRadius: 6 }} placeholder="e.g. 918062179246" />
                  </div>
                </div>

                {/* WhatsApp */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: '0 0 250px', fontSize: 14, fontWeight: 500, color: '#374151' }}>WhatsApp Number</div>
                  <div style={{ flex: 1 }}>
                    <input value={settingsForm.whatsapp} onChange={e => setSettingsForm(s => ({ ...s, whatsapp: e.target.value }))} style={{ ...S.input, maxWidth: 400, borderRadius: 6 }} placeholder="e.g. 918062179246" />
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: '0 0 250px', fontSize: 14, fontWeight: 500, color: '#374151' }}>Business Email</div>
                  <div style={{ flex: 1 }}>
                    <input type="email" value={settingsForm.email} onChange={e => setSettingsForm(s => ({ ...s, email: e.target.value }))} style={{ ...S.input, maxWidth: 400, borderRadius: 6 }} placeholder="hello@example.com" />
                  </div>
                </div>

                {/* Secondary Email */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: '0 0 250px', fontSize: 14, fontWeight: 500, color: '#374151' }}>Secondary Email</div>
                  <div style={{ flex: 1 }}>
                    <input type="email" value={settingsForm.email2} onChange={e => setSettingsForm(s => ({ ...s, email2: e.target.value }))} style={{ ...S.input, maxWidth: 400, borderRadius: 6 }} placeholder="support@example.com" />
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ height: 1, background: '#f3f4f6', margin: '32px 0' }} />

            {/* Section 2: Social Links */}
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>Social Links</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Update your social media links displayed on the website.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Facebook */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: '0 0 250px', fontSize: 14, fontWeight: 500, color: '#374151' }}>Facebook URL</div>
                  <div style={{ flex: 1 }}>
                    <input type="url" value={settingsForm.facebook_url || ''} onChange={e => setSettingsForm(s => ({ ...s, facebook_url: e.target.value }))} style={{ ...S.input, maxWidth: 400, borderRadius: 6 }} placeholder="https://facebook.com/..." />
                  </div>
                </div>

                {/* Instagram */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: '0 0 250px', fontSize: 14, fontWeight: 500, color: '#374151' }}>Instagram URL</div>
                  <div style={{ flex: 1 }}>
                    <input type="url" value={settingsForm.instagram_url || ''} onChange={e => setSettingsForm(s => ({ ...s, instagram_url: e.target.value }))} style={{ ...S.input, maxWidth: 400, borderRadius: 6 }} placeholder="https://instagram.com/..." />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: '#f3f4f6', margin: '32px 0' }} />

            {/* Section 3: Preferences */}
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>Preferences</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Manage your application preferences and layout settings.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Min Dest Packages */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: '0 0 250px', fontSize: 14, fontWeight: 500, color: '#374151' }}>Category Visibility</div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="number" min="0" max="99" value={settingsForm.min_dest_packages} onChange={e => setSettingsForm(s => ({ ...s, min_dest_packages: e.target.value }))} style={{ ...S.input, maxWidth: 90, borderRadius: 6 }} />
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Minimum packages required to show a destination.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ height: 1, background: '#f3f4f6', margin: '32px 0' }} />

            {/* Section 4: Security */}
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>Security</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Keep your admin account secure with extra alerts.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Admin Username */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: '0 0 250px', fontSize: 14, fontWeight: 500, color: '#374151' }}>Login Username</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, maxWidth: 400 }}>
                      <input value={newUsername} onChange={e => setNewUsername(e.target.value)} style={{ ...S.input, flex: 1, borderRadius: 6 }} placeholder="e.g. admin" />
                      <button onClick={handleUpdateUsername} disabled={usernameSaving || !newUsername.trim() || newUsername.trim() === adminUsername}
                        style={{ ...S.btn('#f3f4f6', '#555'), flexShrink: 0, opacity: (usernameSaving || !newUsername.trim() || newUsername.trim() === adminUsername) ? 0.5 : 1, cursor: (usernameSaving || !newUsername.trim() || newUsername.trim() === adminUsername) ? 'not-allowed' : 'pointer', borderRadius: 6 }}>
                        {usernameSaving ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recovery Email */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: '0 0 250px', fontSize: 14, fontWeight: 500, color: '#374151' }}>Recovery Email</div>
                  <div style={{ flex: 1 }}>
                    <input type="email" value={settingsForm.admin_recovery_email} onChange={e => setSettingsForm(s => ({ ...s, admin_recovery_email: e.target.value }))} style={{ ...S.input, maxWidth: 400, borderRadius: 6 }} placeholder="admin@example.com" />
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          </>
        )}
      </div>
        </div>
      </div>

      {/* ── Add/Edit Package Modal ── */}
      {modal === 'form' && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(135deg,#8A6E1C,#8A6E1C)' }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{showPreview ? 'Package Preview' : editId ? 'Edit Package' : 'Add Package'}</h2>
              <button onClick={() => setModal(null)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
            </div>
            {!showPreview && (
            <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', padding: '0 20px' }}>
              {[['basic','Basic'], ...(['homestay','houseboat'].includes(form.category) ? [['stay','Stay Details']] : []), ['itinerary','Itinerary'],['media','Media & Lists']].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', borderBottom: `2px solid ${tab === k ? '#8A6E1C' : 'transparent'}`, color: tab === k ? '#8A6E1C' : '#9ca3af' }}>{l}</button>
              ))}
            </div>
            )}
            <div style={{ padding: 20, maxHeight: '70vh', overflowY: 'auto' }}>
              {showPreview && <PackagePreview pkg={form} />}
              {!showPreview && tab === 'basic' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={S.label}>Package ID</label>
                    <input value={form.id} readOnly style={{ ...S.input, background: '#f0f0f0', color: '#6b7280', fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.04em', cursor: 'default' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5, paddingBottom: 10 }}>
                      Auto-generated based on category.<br />
                      <span style={{ color: '#6b7280' }}>PKG · GPKG · HS · OTH</span>
                    </div>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={S.label}>Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={S.input} placeholder="e.g. Munnar Tea Estate Trek" />
                  </div>
                  <div>
                    <label style={S.label}>Subtitle</label>
                    <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} style={S.input} />
                  </div>
                  <div>
                    <label style={S.label}>Badge Label</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} style={S.input} placeholder="e.g. Hills & Lakes" />
                      <input type="color" value={form.badgeColor || '#16294D'} onChange={e => setForm(f => ({ ...f, badgeColor: e.target.value }))} style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'none', cursor: 'pointer', flexShrink: 0, padding: 2 }} title="Badge colour" />
                    </div>
                  </div>
                  <div>
                    <label style={S.label}>Price Note</label>
                    <input value={form.priceNote} onChange={e => setForm(f => ({ ...f, priceNote: e.target.value }))} style={S.input} placeholder="Per Person" />
                  </div>

                  {(() => {
                    const isHS = form.category === 'homestay'
                    const isHB = form.category === 'houseboat'
                    const optionList = isHS ? homestays : isHB ? houseboats : destinations
                    const fieldLabel = isHS ? 'Homestay' : isHB ? 'Houseboat' : 'Category'
                    return (
                      <div>
                        <label style={S.label}>{fieldLabel}</label>
                        <select value={form.destination} onChange={e => { const d = optionList.find(d => d.name === e.target.value); setForm(f => ({ ...f, destination: e.target.value, badgeColor: d?.color ?? f.badgeColor })) }} style={{ ...S.input, cursor: 'pointer' }}>
                          <option value="">Select {fieldLabel.toLowerCase()}</option>
                          {optionList.map(d => <option key={d.id} value={d.name}>{d.emoji ? `${d.emoji} ` : ''}{d.name}</option>)}
                        </select>
                      </div>
                    )
                  })()}
                  <div>
                    <label style={S.label}>Duration</label>
                    <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={S.input} placeholder="e.g. 3" min="1" />
                  </div>
                  <div>
                    <label style={S.label}>Stay / Hotels</label>
                    <input value={form.hotels} onChange={e => setForm(f => ({ ...f, hotels: e.target.value }))} style={S.input} />
                  </div>
                  <div>
                    <label style={S.label}>Original Price (₹)</label>
                    <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} style={S.input} />
                  </div>
                  <div>
                    <label style={S.label}>Sale Price (₹) * <span style={{ textTransform: 'none', fontWeight: 600, color: '#9ca3af' }}>· per adult</span></label>
                    <input type="number" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} style={S.input} />
                  </div>
                  <div>
                    <label style={S.label}>Price per Child (₹)</label>
                    <input type="number" value={form.childPrice} onChange={e => setForm(f => ({ ...f, childPrice: e.target.value }))} style={S.input} />
                  </div>
                  <div>
                    <label style={S.label}>Child Age Range</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" min="0" value={form.childAgeMin} onChange={e => setForm(f => ({ ...f, childAgeMin: e.target.value }))} style={S.input} placeholder="2" />
                      <span style={{ color: '#9ca3af', fontSize: 13 }}>to</span>
                      <input type="number" min="0" value={form.childAgeMax} onChange={e => setForm(f => ({ ...f, childAgeMax: e.target.value }))} style={S.input} placeholder="11" />
                      <span style={{ color: '#9ca3af', fontSize: 13 }}>yrs</span>
                    </div>
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={S.label}>Adults</label>
                      <input type="number" min="0" value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))} style={S.input} placeholder="2" />
                    </div>
                    <div>
                      <label style={S.label}>Children</label>
                      <input type="number" min="0" value={form.children} onChange={e => setForm(f => ({ ...f, children: e.target.value }))} style={S.input} placeholder="0" />
                    </div>
                    <div>
                      <label style={S.label}>Rooms</label>
                      <input type="number" min="0" value={form.rooms} onChange={e => setForm(f => ({ ...f, rooms: e.target.value }))} style={S.input} placeholder="1" />
                    </div>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={S.label}>Overview</label>
                    <textarea rows={3} value={form.overview} onChange={e => setForm(f => ({ ...f, overview: e.target.value }))} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={S.label}>Note (optional)</label>
                    <textarea rows={2} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} placeholder="e.g. Rates vary on customization, special terms, important info..." />
                  </div>
                  {form.category === 'group' && (
                    <div style={{ gridColumn: '1/-1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 }}>
                        <label style={S.label}>Available Dates</label>
                        <button onClick={addDateGroup} style={{ fontSize: 12, fontWeight: 600, color: '#8A6E1C', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Plus size={12} /> Add Batch
                        </button>
                      </div>
                      {(form.availableDates || []).length === 0 && (
                        <p style={{ fontSize: 12, color: '#9ca3af', background: '#f9fafb', borderRadius: 10, padding: '10px 14px', margin: 0 }}>No departure dates yet. Click &ldquo;Add Batch&rdquo; to add a group of dates.</p>
                      )}
                      {(form.availableDates || []).map((group, gi) => {
                        const firstStart = getDR(group.dates?.[0]).start
                        return (
                          <div key={gi} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 8, background: '#fafafa' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <input
                                value={group.month}
                                onChange={e => dateGroupChange(gi, 'month', e.target.value)}
                                style={{ ...S.input, fontSize: 12, flex: 1 }}
                                placeholder={autoMonth(firstStart) || 'Month label (auto-fills from dates)'}
                              />
                              <button onClick={() => removeDateGroup(gi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', flexShrink: 0 }}><X size={14} /></button>
                            </div>
                            {(group.dates || []).map((dr, di) => {
                              const d = getDR(dr)
                              return (
                                <div key={di} style={{ marginBottom: 8 }}>
                                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <input type="date" value={d.start} onChange={e => setDateField(gi, di, 'start', e.target.value)} style={{ ...S.input, fontSize: 12, flex: 1 }} />
                                    <span style={{ color: '#9ca3af', fontSize: 13, flexShrink: 0 }}>→</span>
                                    <input type="date" value={d.end} onChange={e => setDateField(gi, di, 'end', e.target.value)} style={{ ...S.input, fontSize: 12, flex: 1 }} />
                                    {(group.dates || []).length > 1 && (
                                      <button onClick={() => removeDateRange(gi, di)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', flexShrink: 0 }}><X size={13} /></button>
                                    )}
                                  </div>
                                  {(d.start || d.end) && (
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, paddingLeft: 2 }}>{fmtRange(d.start, d.end)}</div>
                                  )}
                                </div>
                              )
                            })}
                            <button onClick={() => addDateRange(gi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A6E1C', fontSize: 12, fontWeight: 600, padding: '2px 0' }}>+ Add date range</button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
              {!showPreview && tab === 'itinerary' && (
                <div>
                  {(form.itinerary || []).map((day, di) => (
                    <div key={di} style={{ border: '1px solid #f3f4f6', borderRadius: 12, padding: 14, marginBottom: 10, background: '#fafafa' }}>
                      {/* Day header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#8A6E1C,#8A6E1C)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{day.day}</div>
                        {(form.itinerary || []).length > 1 && <button onClick={() => removeDay(di)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex' }}><Trash2 size={14} /></button>}
                      </div>
                      <input value={day.title} onChange={e => itinChange(di, 'title', e.target.value)} style={{ ...S.input, marginBottom: 8 }} placeholder={`Day ${day.day} title (e.g. Arrival & Sightseeing)`} />
                      <textarea rows={2} value={day.description} onChange={e => itinChange(di, 'description', e.target.value)} style={{ ...S.input, resize: 'none', marginBottom: 8, lineHeight: 1.5 }} placeholder="Brief day description..." />
                      {/* Hotel / overnight */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <span style={{ fontSize: 14 }}>🛏</span>
                        <input value={day.hotel || ''} onChange={e => itinChange(di, 'hotel', e.target.value)} style={{ ...S.input, fontSize: 12 }} placeholder="Overnight stay at... (e.g. The ONE Legian)" />
                      </div>
                      {/* Day image */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 5 }}>Day Image (optional)</div>
                        <ImageUploader url={day.image || ''} onUrlChange={v => itinChange(di, 'image', v)} pos={day.imagePos} onPosChange={v => itinChange(di, 'imagePos', v)} height={180} rounded={7} />
                      </div>
                      {/* Activities */}
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Activities / Schedule</div>
                      {(day.activities || []).map((act, ai) => {
                        const a = typeof act === 'string' ? { time: '', emoji: '', title: act, details: [''], tags: [] } : act
                        return (
                          <div key={ai} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, marginBottom: 8, background: '#fff' }}>
                            {/* Time + Emoji + Title row */}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
                              <input value={a.time} onChange={e => actFieldChange(di, ai, 'time', e.target.value)} style={{ ...S.input, width: 80, flexShrink: 0, fontFamily: 'monospace', textAlign: 'center' }} placeholder="09:00" />
                              <input value={a.emoji} onChange={e => actFieldChange(di, ai, 'emoji', e.target.value)} style={{ ...S.input, width: 52, flexShrink: 0, textAlign: 'center', fontSize: 16 }} placeholder="🏄" />
                              <input value={a.title} onChange={e => actFieldChange(di, ai, 'title', e.target.value)} style={{ ...S.input, flex: 1 }} placeholder="Activity title..." />
                              {(day.activities || []).length > 1 && (
                                <button onClick={() => removeActivity(di, ai)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', flexShrink: 0 }}><Trash2 size={13} /></button>
                              )}
                            </div>
                            {/* Detail checkpoints */}
                            <div style={{ marginBottom: 6 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>✓ Details / Checkpoints</div>
                              {(a.details || []).map((det, ki) => (
                                <div key={ki} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                                  <span style={{ color: '#22c55e', fontSize: 12, paddingTop: 10, flexShrink: 0 }}>✓</span>
                                  <input value={det} onChange={e => actDetailChange(di, ai, ki, e.target.value)} style={{ ...S.input, fontSize: 12, flex: 1 }} placeholder="e.g. Pick up time 09:00 am, Start from hotel" />
                                  {(a.details || []).length > 1 && <button onClick={() => removeActDetail(di, ai, ki)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', flexShrink: 0 }}><X size={12} /></button>}
                                </div>
                              ))}
                              <button onClick={() => addActDetail(di, ai)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 11, fontWeight: 600, padding: '2px 0' }}>+ Add detail</button>
                            </div>
                            {/* Tags */}
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Tags (comma-separated)</div>
                              <input value={(a.tags || []).join(', ')} onChange={e => actFieldChange(di, ai, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} style={{ ...S.input, fontSize: 12 }} placeholder="e.g. Private Transfers, Meal Included" />
                              {(a.tags || []).length > 0 && (
                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
                                  {(a.tags || []).map((tag, ti) => (
                                    <span key={ti} style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#e0f2fe', color: '#0369a1' }}>{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <button onClick={() => addActivity(di)} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: '1.5px dashed #e5e7eb', background: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>+ Add Activity</button>
                    </div>
                  ))}
                  <button onClick={addDay} style={{ width: '100%', padding: '10px 0', borderRadius: 12, border: '2px dashed #fbd0b5', background: 'none', cursor: 'pointer', color: '#8A6E1C', fontSize: 13, fontWeight: 600 }}>+ Add Day</button>
                </div>
              )}
              {!showPreview && tab === 'stay' && (
                <HomestayFields form={form} setForm={setForm} S={S} pkgOptions={pkgOptions} onOptionsUpdate={setPkgOptions} />
              )}

              {!showPreview && tab === 'media' && (
                <div>
                  {[{ l: 'Card Image', f: 'image', h: 260 }, { l: 'Hero Image', f: 'heroImage', h: 380 }].map(({ l, f, h }) => (
                    <div key={f} style={{ marginBottom: 14 }}>
                      <label style={S.label}>{l}</label>
                      <ImageUploader url={form[f] || ''} onUrlChange={v => setForm(p => ({ ...p, [f]: v }))} pos={form[`${f}Pos`]} onPosChange={v => setForm(p => ({ ...p, [`${f}Pos`]: v }))} height={h} />
                    </div>
                  ))}

                  {[
                    { l: 'Highlights', f: 'highlights', type: 'highlight', color: '#8A6E1C' },
                    { l: 'Inclusions', f: 'inclusions', type: 'inclusion', color: '#22c55e' },
                    { l: 'Exclusions', f: 'exclusions', type: 'exclusion', color: '#ef4444' },
                  ].map(({ l, f, type, color }) => (
                    <div key={f} style={{ marginBottom: 18 }}>
                      <label style={S.label}>{l}</label>
                      <TagSelector
                        type={type}
                        selected={form[f] || []}
                        onChange={val => setForm(p => ({ ...p, [f]: val }))}
                        options={pkgOptions[type] || []}
                        onOptionsUpdate={setPkgOptions}
                        color={color}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
              {showPreview ? (
                <button onClick={() => setShowPreview(false)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginRight: 'auto' }}>← Back to Edit</button>
              ) : (
                <button onClick={() => setModal(null)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              )}
              {!showPreview && (
                <button onClick={() => setShowPreview(true)} style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid #8A6E1C', background: '#fff', color: '#8A6E1C', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={14} /> Preview
                </button>
              )}
              <button onClick={handleSave} disabled={saving} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#8A6E1C,#8A6E1C)', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
                {saving ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Saving...</> : <><Check size={14} /> {editId ? 'Save Changes' : 'Add Package'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Destinations Modal ── */}
      {modal === 'destination' && (
        <div style={{ ...S.overlay, alignItems: 'center' }} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(135deg,#16294D,#16294D)', flexShrink: 0 }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={16} /> Manage Categories</h2>
              <button onClick={() => setModal(null)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              {destinations.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <label style={S.label}>Existing Categories</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {destinations.map(d => (
                      <div key={d.id} style={{ borderRadius: 12, border: '1px solid #f3f4f6', background: '#fafafa', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{d.emoji || '📍'} {d.name}</span>
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>{allPackages.filter(p => p.destination === d.name).length} pkgs</span>
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => handleToggleDestFeatured(d.id, !d.featured)}
                              disabled={destVisLoading === d.id}
                              title={d.featured !== false ? 'Shown on website (click to hide)' : 'Hidden from website (click to show)'}
                              style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${d.featured !== false ? '#bbf7d0' : '#e5e7eb'}`, background: d.featured !== false ? '#f0fdf4' : '#f9fafb', cursor: destVisLoading === d.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.featured !== false ? '#22c55e' : '#d1d5db', opacity: destVisLoading === d.id ? 0.7 : 1 }}>
                              {destVisLoading === d.id
                                ? <span style={{ width: 11, height: 11, border: `2px solid ${d.featured !== false ? '#bbf7d0' : '#e5e7eb'}`, borderTop: `2px solid ${d.featured !== false ? '#22c55e' : '#9ca3af'}`, borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                                : <Eye size={12} />}
                            </button>
                            <button onClick={() => { if (editDestId === d.id) { setEditDestId(null); return }; setEditDestId(d.id); setEditDestForm({ color: d.color, image_url: d.image_url || '', description: d.description || '', emoji: d.emoji || '📍', image_pos: d.image_pos || '' }) }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: editDestId === d.id ? '#FBF6E7' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: editDestId === d.id ? '#8A6E1C' : '#9ca3af' }}><Pencil size={12} /></button>
                            <button onClick={() => handleDeleteDestination(d.id, d.name)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}><Trash2 size={12} /></button>
                          </div>
                        </div>
                        {editDestId === d.id && (
                          <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8, marginTop: 12 }}>
                              <div><label style={{ ...S.label, marginBottom: 4 }}>Emoji</label><input value={editDestForm.emoji} onChange={e => setEditDestForm(f => ({ ...f, emoji: e.target.value }))} style={{ ...S.input, fontSize: 18, textAlign: 'center' }} maxLength={2} /></div>
                              <div><label style={{ ...S.label, marginBottom: 4 }}>Color</label><input type="color" value={editDestForm.color} onChange={e => setEditDestForm(f => ({ ...f, color: e.target.value }))} style={{ width: 50, height: 42, borderRadius: 8, border: '1.5px solid #e5e7eb', cursor: 'pointer', padding: 2 }} /></div>
                            </div>
                            <div style={{ marginBottom: 8 }}><label style={{ ...S.label, marginBottom: 4 }}>Image</label><ImageUploader url={editDestForm.image_url} onUrlChange={v => setEditDestForm(f => ({ ...f, image_url: v }))} pos={editDestForm.image_pos} onPosChange={v => setEditDestForm(f => ({ ...f, image_pos: v }))} height={200} /></div>
                            <div style={{ marginBottom: 10 }}><label style={{ ...S.label, marginBottom: 4 }}>Description</label><input value={editDestForm.description} onChange={e => setEditDestForm(f => ({ ...f, description: e.target.value }))} style={S.input} /></div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => setEditDestId(null)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                              <button onClick={() => handleUpdateDestination(d.id)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#16294D,#16294D)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Save</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <label style={S.label}>Add New Destination</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
                <input value={newDest.name} onChange={e => setNewDest(d => ({ ...d, name: e.target.value }))} style={S.input} placeholder="e.g. Thekkady" onKeyDown={e => e.key === 'Enter' && handleAddDestination()} />
                <input type="color" value={newDest.color} onChange={e => setNewDest(d => ({ ...d, color: e.target.value }))} style={{ width: 50, height: 42, borderRadius: 8, border: '1.5px solid #e5e7eb', cursor: 'pointer', padding: 2 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div><label style={{ ...S.label, marginBottom: 4 }}>Emoji</label><input value={newDest.emoji} onChange={e => setNewDest(d => ({ ...d, emoji: e.target.value }))} style={{ ...S.input, textAlign: 'center', fontSize: 18 }} maxLength={2} /></div>
                <div><label style={{ ...S.label, marginBottom: 4 }}>Description</label><input value={newDest.description} onChange={e => setNewDest(d => ({ ...d, description: e.target.value }))} style={S.input} /></div>
              </div>
              <div style={{ marginBottom: 4 }}><label style={{ ...S.label, marginBottom: 4 }}>Card Image</label><ImageUploader url={newDest.image_url} onUrlChange={v => setNewDest(d => ({ ...d, image_url: v }))} pos={newDest.image_pos} onPosChange={v => setNewDest(d => ({ ...d, image_pos: v }))} height={200} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #f3f4f6', background: '#fafafa', flexShrink: 0 }}>
              <button onClick={() => setModal(null)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Close</button>
              <button onClick={handleAddDestination} disabled={destSaving} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: destSaving ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#16294D,#16294D)', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: destSaving ? 0.7 : 1 }}>
                {destSaving ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Adding...</> : <><Plus size={14} /> Add</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Listings Modal (Homestays & Houseboats) ── */}
      {modal === 'listing' && listingModalType && (() => {
        const meta = LISTING_META[listingModalType]
        const Icon = meta.icon
        const items = listingModalType === 'houseboat' ? houseboats : homestays
        return (
          <div style={{ ...S.overlay, alignItems: 'center' }} onClick={e => e.target === e.currentTarget && setModal(null)}>
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(135deg,#16294D,#16294D)', flexShrink: 0 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><Icon size={16} /> Manage {meta.plural}</h2>
                <button onClick={() => setModal(null)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
              </div>
              <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
                {items.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <label style={S.label}>Existing {meta.plural}</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {items.map(d => (
                        <div key={d.id} style={{ borderRadius: 12, border: '1px solid #f3f4f6', background: '#fafafa', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 14, height: 14, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                              <span style={{ fontWeight: 600, fontSize: 13 }}>{d.emoji || meta.emoji} {d.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                onClick={() => handleToggleListingFeatured(d.id, !(d.featured !== false))}
                                disabled={listingVisLoading === d.id}
                                title={d.featured !== false ? 'Shown on website (click to hide)' : 'Hidden from website (click to show)'}
                                style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${d.featured !== false ? '#bbf7d0' : '#e5e7eb'}`, background: d.featured !== false ? '#f0fdf4' : '#f9fafb', cursor: listingVisLoading === d.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.featured !== false ? '#22c55e' : '#d1d5db', opacity: listingVisLoading === d.id ? 0.7 : 1 }}>
                                {listingVisLoading === d.id
                                  ? <span style={{ width: 11, height: 11, border: `2px solid ${d.featured !== false ? '#bbf7d0' : '#e5e7eb'}`, borderTop: `2px solid ${d.featured !== false ? '#22c55e' : '#9ca3af'}`, borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                                  : <Eye size={12} />}
                              </button>
                              <button onClick={() => { if (editListingId === d.id) { setEditListingId(null); return }; setEditListingId(d.id); setEditListingForm({ color: d.color, image_url: d.image_url || '', description: d.description || '', location: d.location || '', price: d.price || '', emoji: d.emoji || meta.emoji, image_pos: d.image_pos || '' }) }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: editListingId === d.id ? '#FBF6E7' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: editListingId === d.id ? '#8A6E1C' : '#9ca3af' }}><Pencil size={12} /></button>
                              <button onClick={() => handleDeleteListing(d.id, d.name)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}><Trash2 size={12} /></button>
                            </div>
                          </div>
                          {editListingId === d.id && (
                            <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f3f4f6' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8, marginTop: 12 }}>
                                <div><label style={{ ...S.label, marginBottom: 4 }}>Emoji</label><input value={editListingForm.emoji} onChange={e => setEditListingForm(f => ({ ...f, emoji: e.target.value }))} style={{ ...S.input, fontSize: 18, textAlign: 'center' }} maxLength={2} /></div>
                                <div><label style={{ ...S.label, marginBottom: 4 }}>Color</label><input type="color" value={editListingForm.color} onChange={e => setEditListingForm(f => ({ ...f, color: e.target.value }))} style={{ width: 50, height: 42, borderRadius: 8, border: '1.5px solid #e5e7eb', cursor: 'pointer', padding: 2 }} /></div>
                              </div>
                              <div style={{ marginBottom: 8 }}><label style={{ ...S.label, marginBottom: 4 }}>Image</label><ImageUploader url={editListingForm.image_url} onUrlChange={v => setEditListingForm(f => ({ ...f, image_url: v }))} pos={editListingForm.image_pos} onPosChange={v => setEditListingForm(f => ({ ...f, image_pos: v }))} height={200} /></div>
                              <div style={{ marginBottom: 10 }}><label style={{ ...S.label, marginBottom: 4 }}>Description</label><input value={editListingForm.description} onChange={e => setEditListingForm(f => ({ ...f, description: e.target.value }))} style={S.input} /></div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => setEditListingId(null)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={() => handleUpdateListing(d.id)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#16294D,#16294D)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Save</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <label style={S.label}>Add New Destination</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
                  <input value={newListing.name} onChange={e => setNewListing(d => ({ ...d, name: e.target.value }))} style={S.input} placeholder={listingModalType === 'houseboat' ? 'e.g. Royal Kettuvallam' : 'e.g. Backwater Villa'} onKeyDown={e => e.key === 'Enter' && handleAddListing(listingModalType)} />
                  <input type="color" value={newListing.color} onChange={e => setNewListing(d => ({ ...d, color: e.target.value }))} style={{ width: 50, height: 42, borderRadius: 8, border: '1.5px solid #e5e7eb', cursor: 'pointer', padding: 2 }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ ...S.label, marginBottom: 4 }}>Emoji</label><input value={newListing.emoji} onChange={e => setNewListing(d => ({ ...d, emoji: e.target.value }))} style={{ ...S.input, textAlign: 'center', fontSize: 18, width: 60 }} maxLength={2} />
                </div>
                <div style={{ marginBottom: 8 }}><label style={{ ...S.label, marginBottom: 4 }}>Description</label><input value={newListing.description} onChange={e => setNewListing(d => ({ ...d, description: e.target.value }))} style={S.input} /></div>
                <div style={{ marginBottom: 4 }}><label style={{ ...S.label, marginBottom: 4 }}>Card Image</label><ImageUploader url={newListing.image_url} onUrlChange={v => setNewListing(d => ({ ...d, image_url: v }))} pos={newListing.image_pos} onPosChange={v => setNewListing(d => ({ ...d, image_pos: v }))} height={200} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #f3f4f6', background: '#fafafa', flexShrink: 0 }}>
                <button onClick={() => setModal(null)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Close</button>
                <button onClick={() => handleAddListing(listingModalType)} disabled={listingSaving} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: listingSaving ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#16294D,#16294D)', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: listingSaving ? 0.7 : 1 }}>
                  {listingSaving ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Adding...</> : <><Plus size={14} /> Add</>}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Confirm Dialog ── */}
      {confirm && (
        <div style={{ ...S.overlay, alignItems: 'center', zIndex: 70 }} onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 360, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><AlertTriangle size={24} style={{ color: '#ef4444' }} /></div>
            <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 8 }}>Are you sure?</h3>
            <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, marginBottom: 22 }}>{confirm.message}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirm(null)} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirm.onConfirm} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Package ── */}
      {modal === 'delete' && (
        <div style={{ ...S.overlay, alignItems: 'center' }} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 380, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><AlertTriangle size={24} style={{ color: '#ef4444' }} /></div>
            <h3 style={{ fontWeight: 700, fontSize: 18, color: '#111', marginBottom: 8 }}>Delete Package?</h3>
            <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, marginBottom: 22 }}>This will permanently remove the package. This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setModal(null); setDeleteId(null) }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Testimonial Modal ── */}
      {testimonialModal && (
        <div style={S.modalOverlay}>
          <div style={{ ...S.modal, maxWidth: 500 }}>
            <div style={S.modalHeader}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{testimonialModal === 'add' ? 'Add' : 'Edit'} Testimonial</h2>
              <button onClick={() => setTestimonialModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button>
            </div>
            <div style={S.modalBody}>
              <div style={S.formGroup}>
                <label style={S.label}>Client Name *</label>
                <input value={testimonialForm.name || ''} onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })} style={S.input} placeholder="e.g. John Doe" />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Testimonial *</label>
                <textarea value={testimonialForm.text || ''} onChange={e => setTestimonialForm({ ...testimonialForm, text: e.target.value })} style={{ ...S.input, minHeight: 120 }} placeholder="What they said..." />
              </div>
            </div>
            <div style={S.modalFooter}>
              <button onClick={() => setTestimonialModal(null)} style={S.btn('#f3f4f6', '#4b5563')}>Cancel</button>
              <button disabled={testimonialSaving || !testimonialForm.name || !testimonialForm.text} onClick={async () => {
                setTestimonialSaving(true)
                try {
                  const method = testimonialModal === 'add' ? 'POST' : 'PUT'
                  const res = await fetch('/api/testimonials', {
                    method, headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testimonialForm)
                  })
                  if (res.ok) {
                    toast.success(testimonialModal === 'add' ? 'Testimonial added' : 'Testimonial updated')
                    setTestimonialModal(null)
                    fetchTestimonials()
                  } else throw new Error()
                } catch { toast.error('Failed to save testimonial') }
                finally { setTestimonialSaving(false) }
              }} style={S.btn('#8A6E1C', '#fff')}>
                {testimonialSaving ? 'Saving...' : 'Save Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
