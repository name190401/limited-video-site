'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const GROUP_NAMES = ['基本セット', '製品・トレーニング', '応用セット']

export default function AdminPage() {
  const [passwords, setPasswords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedKey, setCopiedKey] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchPasswords()
  }, [])

  const fetchPasswords = async () => {
    try {
      const res = await fetch('/api/password/list')
      if (res.status === 401) {
        router.push('/')
        return
      }
      const data = await res.json()
      if (data.passwords) {
        setPasswords(data.passwords)
      } else {
        setError('パスワードの取得に失敗しました')
      }
    } catch (err) {
      setError('サーバーエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleCopy = (password, key) => {
    navigator.clipboard.writeText(password)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const getDateLabel = (index) => {
    if (index === 0) return '今日'
    if (index === 1) return '明日'
    return ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-600 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
          <p className="text-gold-400/60 text-sm">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-600 flex items-center justify-center p-4">
        <div className="bg-dark-400 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-gold-400/60 hover:text-gold-400 text-sm transition-colors"
          >
            トップへ戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-600">
      {/* Header */}
      <header className="border-b border-gold-400/20">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gold-gradient tracking-wide">
            管理者ダッシュボード
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="/member"
              className="text-gold-400/60 hover:text-gold-400 text-sm transition-colors"
            >
              メンバーページ
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-gold-400/20 text-gold-400/60 hover:text-gold-400 hover:border-gold-400/40 text-sm transition-all"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Today's Passwords - Prominent Display */}
        {passwords.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gold-gradient mb-6">
              本日のパスワード
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {passwords[0].groups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="bg-dark-400 border border-gold-400/30 rounded-2xl p-6 glow-gold text-center"
                >
                  <p className="text-gold-400/60 text-sm mb-1">
                    グループ {gIdx}
                  </p>
                  <p className="text-gold-400 font-semibold mb-4">
                    {GROUP_NAMES[gIdx]}
                  </p>
                  <p className="text-4xl font-mono font-bold text-white tracking-[0.25em] mb-4">
                    {group.password}
                  </p>
                  <button
                    onClick={() =>
                      handleCopy(group.password, `today-${gIdx}`)
                    }
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                      copiedKey === `today-${gIdx}`
                        ? 'bg-gold-400 text-dark-600'
                        : 'bg-gold-400/10 text-gold-400 hover:bg-gold-400/20 border border-gold-400/20'
                    }`}
                  >
                    {copiedKey === `today-${gIdx}`
                      ? 'コピーしました'
                      : 'コピー'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Groups - 7 Day View */}
        <div className="space-y-8">
          {GROUP_NAMES.map((groupName, gIdx) => (
            <div key={gIdx}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-400/20 flex items-center justify-center text-gold-400 text-sm font-bold">
                  {gIdx}
                </span>
                {groupName}
                <span className="text-gold-400/30 text-sm font-normal">
                  -- 7日間のパスワード
                </span>
              </h3>
              <div className="bg-dark-400 border border-gold-400/10 rounded-2xl overflow-hidden">
                {passwords.map((day, dayIndex) => {
                  const group = day.groups.find(
                    (g) => g.groupIndex === gIdx
                  )
                  if (!group) return null

                  const isToday = dayIndex === 0
                  const label = getDateLabel(dayIndex)

                  return (
                    <div
                      key={day.date}
                      className={`flex items-center justify-between px-6 py-4 ${
                        dayIndex !== passwords.length - 1
                          ? 'border-b border-gold-400/5'
                          : ''
                      } ${
                        isToday ? 'bg-gold-400/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {label && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isToday
                                ? 'bg-gold-400/20 text-gold-400'
                                : 'bg-dark-200 text-gold-400/60'
                            }`}
                          >
                            {label}
                          </span>
                        )}
                        <span className="text-white/60 text-sm">
                          {formatDate(day.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono font-bold text-lg tracking-widest ${
                            isToday ? 'text-gold-400' : 'text-white/70'
                          }`}
                        >
                          {group.password}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              group.password,
                              `${gIdx}-${dayIndex}`
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                            copiedKey === `${gIdx}-${dayIndex}`
                              ? 'bg-gold-400 text-dark-600'
                              : 'bg-dark-200 text-gold-400/50 hover:text-gold-400 hover:bg-dark-50'
                          }`}
                        >
                          {copiedKey === `${gIdx}-${dayIndex}`
                            ? 'OK'
                            : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Usage Notes */}
        <div className="mt-12 bg-dark-400/50 border border-gold-400/10 rounded-2xl p-6">
          <h3 className="text-gold-400/80 font-semibold mb-3">運用メモ</h3>
          <ul className="text-white/40 text-sm space-y-2">
            <li>
              -- パスワードは毎日 0:00（UTC）に自動で切り替わります
            </li>
            <li>
              -- グループごとに異なるパスワードが生成されます
            </li>
            <li>
              -- LINE やメールで該当グループのパスワードを共有してください
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
