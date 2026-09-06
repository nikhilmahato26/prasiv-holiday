'use client'
import { useRef, useState } from 'react'
import { Move } from 'lucide-react'

// Parse "50% 50%" → { x, y }
function parsePos(value) {
  if (typeof value === 'string' && value.includes('%')) {
    const [x, y] = value.split(' ').map(p => parseFloat(p))
    if (!isNaN(x) && !isNaN(y)) return { x, y }
  }
  return { x: 50, y: 50 }
}
const clamp = n => Math.max(0, Math.min(100, n))

/**
 * Draggable image box — drag the image to choose which part shows inside the
 * fixed frame. Emits an object-position string like "40% 25%" via onChange.
 */
export default function ImagePositioner({ src, value, onChange, height = 160, rounded = 10 }) {
  const boxRef = useRef(null)
  const drag = useRef(null)
  const [dragging, setDragging] = useState(false)
  const pos = parsePos(value)

  if (!src) return null

  const onPointerDown = (e) => {
    const rect = boxRef.current.getBoundingClientRect()
    drag.current = { startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y, w: rect.width, h: rect.height }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const d = drag.current
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    // Drag the image: moving the pointer right pans to reveal the left side.
    const nx = clamp(d.posX - (dx / d.w) * 100)
    const ny = clamp(d.posY - (dy / d.h) * 100)
    onChange(`${Math.round(nx)}% ${Math.round(ny)}%`)
  }
  const onPointerUp = (e) => {
    drag.current = null
    setDragging(false)
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
  }

  return (
    <div
      ref={boxRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ position: 'relative', marginTop: 6, width: '100%', height, borderRadius: rounded, overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', userSelect: 'none', background: '#f3f4f6' }}
    >
      <img
        src={src}
        alt="preview"
        draggable={false}
        onError={e => { e.target.style.display = 'none' }}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${pos.x}% ${pos.y}%`, pointerEvents: 'none' }}
      />
      <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 600, pointerEvents: 'none', opacity: dragging ? 0 : 1, transition: 'opacity 0.15s' }}>
        <Move size={11} /> Drag to reposition
      </div>
    </div>
  )
}
