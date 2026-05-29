'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('このメールアドレスは既に登録されています。');
        } else {
          setError('登録中にエラーが発生しました。入力内容をご確認ください。');
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('登録中にエラーが発生しました。しばらくしてから再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back to login */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-white/30 hover:text-gold-300 text-sm mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ログインページに戻る
        </Link>

        {/* Card */}
        <div className="bg-dark-400/80 border border-white/[0.06] rounded-xl p-8 md:p-10 glow-gold">
          {success ? (
            /* Success State */
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gold-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gold-gradient mb-4">登録完了</h2>
              <div className="w-12 h-px bg-gold-gradient mx-auto mb-6" />
              <p className="text-white/50 text-sm leading-relaxed mb-2">
                確認メールを送信しました。
              </p>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                メール内のリンクをクリックして
                <br />
                アカウントを有効化してください。
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-gold-gradient text-dark-600 font-semibold text-sm px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:scale-[1.01]"
              >
                ログインページへ
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            /* Registration Form */
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gold-400/10 rounded-lg flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gold-gradient">新規登録</h1>
                <p className="text-white/40 text-sm mt-2">メンバーアカウントを作成</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs text-white/50 mb-2 tracking-wide uppercase">
                    表示名
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="山田 太郎"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-dark-600/80 border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all text-sm"
                  />
                </div>

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
                    placeholder="6文字以上"
                    required
                    disabled={loading}
                    minLength={6}
                    className="w-full px-4 py-3 bg-dark-600/80 border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all text-sm"
                  />
                  <p className="text-white/20 text-xs mt-1.5">6文字以上で入力してください</p>
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
                      登録中...
                    </span>
                  ) : (
                    'アカウントを作成'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-white/20 text-xs">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Login link */}
              <div className="text-center">
                <p className="text-white/40 text-sm">
                  既にアカウントをお持ちの方は
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-2 text-gold-300 hover:text-gold-200 text-sm font-medium transition-colors"
                >
                  ログインはこちら
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
