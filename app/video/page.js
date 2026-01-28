'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoPage() {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

  // Google DriveファイルID
  const driveFileId = process.env.NEXT_PUBLIC_DRIVE_FILE_ID || '1PvI96bI0zQn33B1cCF1e-Jiv2AkWqLI7';

  useEffect(() => {
        const token = sessionStorage.getItem('auth_token');

                if (!token) {
                        router.push('/');
                        return;
                }

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
              src={`https://drive.google.com/file/d/${driveFileId}/preview`}
            width="100%"
            height="100%"
            allow="autoplay"
            allowFullScreen
            style={{ border: 'none' }}
          />
            </div>

        <div className="mt-6 bg-gray-800 rounded-xl p-6">
                      <h2 className="text-white text-xl font-semibold mb-2">限定動画</h2>
          <p className="text-gray-400">
                        この動画は限定公開です。パスワードを共有された方のみ視聴できます。
            </p>
            </div>
            </main>
            </div>
  );
}
