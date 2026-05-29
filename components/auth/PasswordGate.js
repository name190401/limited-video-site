'use client'

import { useState } from 'react'

export default function PasswordGate({ groupIndex, groupName, onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, groupIndex }),
      })

      const data = await res.json()

      if (data.success) {
        sessionStorage.setItem(`video_group_${groupIndex}_auth`, 'true')
        onSuccess()
      } else {
        setError('パスワードが違います')
      }
    } catch {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-200 border border-gold-400/20 rounded-2xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gold-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">{groupName || 'コンテンツ保護'}</h3>
        <p className="text-gray-400 text-sm mt-1">パスワードを入力してください</p>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value.toUpperCase())}
          placeholder="パスワード（6文字）"
          className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-dark-400 border border-gold-400/30 rounded-xl text-white placeholder-gray-600 focus:border-gold-400 focus:outline-none transition-colors"
          maxLength={6}
          autoComplete="off"
          disabled={loading}
        />
        {error && (
          <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || password.length !== 6}
          className="w-full mt-4 bg-gold-gradient hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-dark-600 font-semibold py-3 rounded-xl transition-opacity"
        >
          {loading ? '確認中...' : '視聴する'}
        </button>
      </form>
    </div>
  )
}
