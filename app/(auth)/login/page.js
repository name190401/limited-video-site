'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('メールアドレスまたはパスワードが正しくありません。');
        return;
      }

      router.push('/member');
    } catch (err) {
      setError('ログイン中にエラーが発生しました。しばらくしてから再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back to top */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/30 hover:text-gold-300 text-sm mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          トップページに戻る
        </Link>

        {/* Card */}
        <div className="bg-dark-400/80 border border-white/[0.06] rounded-xl p-8 md:p-10 glow-gold">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gold-400/10 rounded-lg flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gold-gradient">ログイン</h1>
            <p className="text-white/40 text-sm mt-2">メンバーアカウントでログイン</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-wide uppercase">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-dark-600/80 border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-wide uppercase">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-dark-600/80 border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-gradient text-dark-600 font-semibold py-3.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none text-sm"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  ログイン中...
                </span>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-white/40 text-sm">
              アカウントをお持ちでない方は
            </p>
            <Link
              href="/register"
              className="inline-block mt-2 text-gold-300 hover:text-gold-200 text-sm font-medium transition-colors"
            >
              新規登録はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
