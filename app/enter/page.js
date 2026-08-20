'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PasswordChangedNoticeContent() {
  const searchParams = useSearchParams();

  if (searchParams.get('e') !== 'pw') return null;

  return (
    <p className="mb-4 text-sm text-gold-200">
      合言葉が変更されました。新しい合言葉を入力してください。
    </p>
  );
}

function PasswordChangedNotice() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted ? <PasswordChangedNoticeContent /> : null;
}

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
      } else if (res.status === 503) {
        setError('ただいまログインできません。しばらく時間をおいてお試しください。');
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
        {/* castle 紋章シール（白単色・入口の紋章） */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/castle-crest-white.png"
          alt="Castle — Team Ryo Ishii"
          width="116"
          height="127"
          className="mx-auto mb-7 w-[116px] h-auto"
        />
        <h1 className="wordmark gold-clip font-cinzel font-semibold leading-none">
          QUALIA
        </h1>
        <p className="mt-3 font-cormorant italic text-gold-300 text-[12px] tracking-[0.34em] [font-variant:small-caps]">
          Members Only
        </p>
        <p className="mt-2 text-navy-100 text-[13px] font-sansjp tracking-[0.08em]">メンバーページ</p>

        <form onSubmit={handleSubmit} className="mt-10">
          {!error && (
            <Suspense fallback={null}>
              <PasswordChangedNotice />
            </Suspense>
          )}
          <label className="block text-left text-navy-100 text-[12px] mb-2 tracking-[0.06em] font-sansjp">
            合言葉（パスワード）
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            autoComplete="off"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-navy-800/70 border border-gold-400/40 text-white placeholder-navy-200/50 text-center tracking-wide focus:border-gold-400 focus:outline-none transition-colors"
          />
          {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="btn-gold mt-6 w-full py-3 rounded-xl font-sansjp font-semibold text-[15px] tracking-[0.06em]"
          >
            {loading ? '確認中…' : 'はいる'}
          </button>
        </form>
      </div>
    </main>
  );
}
