import './globals.css'

export const metadata = {
  title: 'プレミアムビジネスプレゼンテーション',
  description: 'メンバー限定のビジネスプレゼンテーションプラットフォーム',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="bg-dark-600 text-white">{children}</body>
    </html>
  )
}
