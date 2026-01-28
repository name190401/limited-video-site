'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setPasswords(data.passwords);
        setAuthorized(true);
        sessionStorage.setItem('admin_auth', 'true');
      } else {
        setError('管理者パスワードが違います');
      }
    } catch (err) {
      setError('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getDateLabel = (index) => {
    if (index === 0) return '今日';
    if (index === 1) return '明日';
    return formatDate(passwords[index].date);
  };

  // 管理者ログイン画面
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">管理者ログイン</h1>
            <p className="text-gray-500 mt-2">管理者パスワードを入力</p>
          </div>

          <form onSubmit={handleAdminLogin}>
            <div className="mb-6">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="管理者パスワード"
                className="w-full px-4 py-3 text-center border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:outline-none transition-colors"
                disabled={loading}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !adminPassword}
              className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? '確認中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <a
              href="/"
              className="text-gray-400 hover:text-gray-600 text-sm w-full block text-center"
            >
              ← 視聴ページへ戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 管理者ダッシュボード
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">管理者画面</h1>
          <button
            onClick={() => {
              setAuthorized(false);
              sessionStorage.removeItem('admin_auth');
              router.push('/');
            }}
            className="text-gray-400 hover:text-white text-sm"
          >
            ← 戻る
          </button>
        </div>

        {/* 今日のパスワード（大きく表示） */}
        {passwords.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 mb-6 text-center">
            <p className="text-blue-100 mb-2">今日のパスワード</p>
            <p className="text-5xl font-mono font-bold text-white tracking-widest mb-2">
              {passwords[0].password}
            </p>
            <p className="text-blue-200 text-sm">{formatDate(passwords[0].date)}</p>
          </div>
        )}

        {/* コピーボタン */}
        <div className="mb-6">
          <button
            onClick={() => {
              navigator.clipboard.writeText(passwords[0].password);
              alert('パスワードをコピーしました');
            }}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors"
          >
            📋 パスワードをコピー
          </button>
        </div>

        {/* 今後のパスワード一覧 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-gray-800 font-semibold mb-4">今後7日間のパスワード</h2>
          <div className="space-y-3">
            {passwords.map((item, index) => (
              <div
                key={item.date}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <span className="text-gray-600">{getDateLabel(index)}</span>
                <span className="font-mono font-bold text-lg tracking-wider">
                  {item.password}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 使い方 */}
        <div className="bg-white/10 rounded-2xl p-6 mt-6">
          <h2 className="text-white font-semibold mb-3">使い方</h2>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• パスワードは毎日0:00（UTC）に自動で変わります</li>
            <li>• 閲覧者にはLINEやメールでパスワードを共有してください</li>
            <li>• YouTube動画IDは環境変数 NEXT_PUBLIC_YOUTUBE_ID で設定</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
