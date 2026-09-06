'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function MagneticButton({ children, className = '', onClick, style = {} }) {
  const magnetic = useRef(null)

  useEffect(() => {
    const xTo = gsap.quickTo(magnetic.current, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' })
    const yTo = gsap.quickTo(magnetic.current, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' })

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const { height, width, left, top } = magnetic.current.getBoundingClientRect()
      const x = clientX - (left + width / 2)
      const y = clientY - (top + height / 2)
      xTo(x * 0.35)
      yTo(y * 0.35)
    }

    const handleMouseLeave = () => {
      xTo(0)
      yTo(0)
    }

    const el = magnetic.current
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div ref={magnetic} className={className} style={{ display: 'inline-block', cursor: 'pointer', ...style }} onClick={onClick}>
      {children}
    </div>
  )
}
