import './globals.css'

export const metadata = {
  title: 'QUALIA',
  description: 'QUALIA メンバー限定ページ',
  robots: { index: false, follow: false },
}

// スマホ縦最優先のモバイルファースト。viewport を明示（Next.js 14 推奨）。
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="bg-navy-700 text-white">{children}</body>
    </html>
  )
}
