'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const PlanGateContext = createContext(null)

/**
 * Layer2 の解除状態と保護動画を全セクションで共有する。
 * Server Component の children はそのまま受け取り、クライアント側の状態だけを提供する。
 */
export default function PlanGateProvider({ children }) {
  const [status, setStatus] = useState('checking')
  const [protectedVideos, setProtectedVideos] = useState([])

  const fetchContent = useCallback(async () => {
    const res = await fetch('/api/plan/content', { cache: 'no-store' })
    if (!res.ok) return { ok: false, status: res.status }
    const data = await res.json()
    setProtectedVideos(data?.videos || [])
    setStatus('unlocked')
    return { ok: true, status: res.status }
  }, [])

  useEffect(() => {
    let alive = true
    fetch('/api/plan/status', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        if (!alive) return
        if (!data?.unlocked) {
          setStatus('locked')
          return
        }
        const result = await fetchContent()
        if (alive && !result.ok) setStatus('locked')
      })
      .catch(() => {
        if (alive) setStatus('locked')
      })
    return () => {
      alive = false
    }
  }, [fetchContent])

  const unlock = useCallback(async (password) => {
    try {
      const res = await fetch('/api/auth/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) return { ok: false, status: res.status }
      return fetchContent()
    } catch {
      return { ok: false, status: 0 }
    }
  }, [fetchContent])

  const videosFor = useCallback((sectionKey) => (
    protectedVideos
      .filter((video) => video.section_key === sectionKey)
      .sort((a, b) => a.sort_order - b.sort_order)
  ), [protectedVideos])

  const merge = useCallback((serverVideos) => {
    if (status !== 'unlocked') return serverVideos
    const byId = new Map(protectedVideos.map((video) => [video.id, video]))
    return serverVideos.map((video) => {
      const unlockedVideo = byId.get(video.id)
      return unlockedVideo
        ? { ...video, ...unlockedVideo, locked: false }
        : video
    })
  }, [protectedVideos, status])

  const value = useMemo(() => ({ status, unlock, videosFor, merge }), [status, unlock, videosFor, merge])

  return <PlanGateContext.Provider value={value}>{children}</PlanGateContext.Provider>
}

/** Layer2 共通ゲートの状態と操作を取得する。 */
export function usePlanGate() {
  const context = useContext(PlanGateContext)
  if (!context) throw new Error('usePlanGate must be used within PlanGateProvider')
  return context
}
