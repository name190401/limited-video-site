'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EnterPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/layer1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace('/');
        router.refresh();
      } else if (res.status === 429) {
        setError('試行回数が多すぎます。しばらく時間をおいてお試しください。');
      } else {
        setError('パスワードが違います');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-navy-900 via-navy-700 to-navy-800">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-5xl tracking-wide text-white">QUALIA</h1>
        <p className="mt-3 text-navy-100 text-sm">メンバーページ</p>

        <form onSubmit={handleSubmit} className="mt-10">
          <label className="block text-left text-navy-100 text-sm mb-2">
            合言葉（パスワード）
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            autoComplete="off"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-navy-800/70 border border-gold-400/30 text-white placeholder-navy-200/50 text-center tracking-wide focus:border-gold-400 focus:outline-none transition-colors"
          />
          {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="mt-6 w-full py-3 rounded-xl font-semibold text-navy-900 bg-gradient-to-r from-gold-300 to-gold-500 disabled:opacity-50 transition-opacity"
          >
            {loading ? '確認中…' : 'はいる'}
          </button>
        </form>
      </div>
    </main>
  );
}
