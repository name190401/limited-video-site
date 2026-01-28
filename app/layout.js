import './globals.css'

export const metadata = {
  title: '限定動画視聴',
  description: 'パスワード保護された動画視聴サイト',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
