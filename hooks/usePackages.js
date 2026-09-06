'use client'
import { useState, useEffect, useCallback } from 'react'

export function usePackages() {
  const [packages, setPackages] = useState([])
  const [loaded, setLoaded] = useState(false)

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages')
      const data = res.ok ? await res.json() : []
      setPackages(Array.isArray(data) ? data : [])
    } catch {
      setPackages([])
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  return { packages, loaded, refresh: fetchPackages }
}
