'use client'
import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scroll = `${(totalScroll / windowHeight) * 100}`
      setProgress(scroll)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '4px',
      backgroundColor: 'rgba(0,0,0,0.05)',
      zIndex: 10000,
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        backgroundColor: '#8A6E1C',
        transition: 'width 0.1s ease-out'
      }} />
    </div>
  )
}
