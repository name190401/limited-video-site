'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // YouTube動画ID（環境変数または固定値）
  const youtubeId = process.env.NEXT_PUBLIC_YOUTUBE_ID || 'dQw4w9WgXcQ';

  useEffect(() => {
    // 認証チェック
    const token = sessionStorage.getItem('auth_token');
    
    if (!token) {
      router.push('/');
      return;
    }

    // トークンをサーバーで検証
    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAuthorized(true);
        } else {
          sessionStorage.removeItem('auth_token');
          router.push('/');
        }
      })
      .catch(() => {
        router.push('/');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('auth_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-white font-semibold">限定動画</h1>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm"
        >
          ログアウト
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="Video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-2">動画タイトル</h2>
          <p className="text-gray-400">
            ここに動画の説明文が入ります。限定公開の動画コンテンツです。
          </p>
        </div>
      </main>
    </div>
  );
}
