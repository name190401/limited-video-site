import './globals.css'

export const metadata = {
  title: 'QUALIA',
  description: 'QUALIA メンバー限定ページ',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="bg-navy-700 text-white">{children}</body>
    </html>
  )
}
