'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const WD = ['日', '月', '火', '水', '木', '金', '土']

/** 'YYYY-MM-DD' → { md:'6/25', wd:'木' }（曜日はTZ非依存に算出）。 */
function fmt(ds) {
  const [y, m, d] = ds.split('-').map(Number)
  const wd = WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return { md: `${m}/${d}`, wd }
}

/** クリックでクリップボードへコピー（フィードバック付き）。 */
function CopyButton({ value, className = '' }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
      setTimeout(() => setDone(false), 1200)
    } catch {
      /* クリップボード不可環境は無視 */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`shrink-0 rounded-lg border border-gold-400/40 px-3 py-1.5 text-[12px] font-sansjp tracking-[0.06em] text-gold-200 transition-colors hover:border-gold-400 hover:text-gold-100 ${className}`}
      aria-label="コピー"
    >
      {done ? '✓ コピー済' : 'コピー'}
    </button>
  )
}

/**
 * 管理ダッシュボード。日替わり Layer2 コード（今日＋今後6日）と会員合言葉を表示。
 * @param {{date:string,code:string}[]} days  先頭が今日（JST）
 * @param {string} sitePassword
 */
export default function AdminDashboard({ days, sitePassword }) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const today = days[0]
  const todayFmt = fmt(today.date)

  const logout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/admin', { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 px-5 py-8 md:px-8">
      <div className="mx-auto w-full max-w-md">
        {/* ヘッダー */}
        <header className="flex items-center justify-between">
          <div>
            <p className="gold-clip font-cinzel font-semibold text-[20px] tracking-[0.14em] leading-none">QUALIA</p>
            <p className="mt-1 font-cormorant italic text-gold-300 text-[11px] tracking-[0.3em] [font-variant:small-caps]">
              Admin
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="rounded-lg border border-gold-400/30 px-3 py-1.5 text-[12px] font-sansjp text-navy-100 transition-colors hover:border-gold-400/60 hover:text-white disabled:opacity-50"
          >
            {loggingOut ? '…' : 'ログアウト'}
          </button>
        </header>

        <span className="mt-6 block h-px w-full gold-hairline" />

        {/* 本日の日替わりパスコード */}
        <section className="mt-8">
          <p className="font-cormorant text-gold-400 text-[11px] tracking-[0.34em] [font-variant:small-caps]">
            Today&apos;s Code
          </p>
          <h2 className="mt-1 font-serifjp text-[15px] text-navy-100">
            本日の日替わりパスコード
            <span className="ml-2 text-gold-300">
              {todayFmt.md}（{todayFmt.wd}）
            </span>
          </h2>

          <div className="mt-4 rounded-2xl border border-gold-500/40 bg-navy-800/60 p-6 text-center"
            style={{ boxShadow: '0 16px 40px -24px rgba(212,175,55,0.4)' }}>
            <p className="gold-clip font-cinzel font-semibold text-[44px] leading-none tracking-[0.22em]">
              {today.code}
            </p>
            <div className="mt-5 flex justify-center">
              <CopyButton value={today.code} className="px-5 py-2 text-[13px]" />
            </div>
          </div>
          <p className="mt-3 break-keep text-navy-300 text-[11px] font-sansjp leading-relaxed">
            プラン（§07）を解除するための6桁コードです。JST 0:00 に自動で切り替わります。
          </p>
        </section>

        {/* 今後7日分 */}
        <section className="mt-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-gold-500/25" />
            <span className="font-cormorant text-gold-500 text-[11px] tracking-[0.3em] [font-variant:small-caps]">
              Next 7 Days
            </span>
            <span className="h-px flex-1 bg-gold-500/25" />
          </div>
          <ul className="overflow-hidden rounded-2xl border border-gold-500/25 bg-navy-800/40">
            {days.map((d, i) => {
              const f = fmt(d.date)
              const isToday = i === 0
              return (
                <li
                  key={d.date}
                  className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gold-500/15' : ''} ${
                    isToday ? 'bg-gold-400/5' : ''
                  }`}
                >
                  <span className="w-20 shrink-0 font-sansjp text-[13px] text-navy-100">
                    {f.md}
                    <span className="ml-1 text-navy-300">（{f.wd}）</span>
                  </span>
                  {isToday && (
                    <span className="shrink-0 rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-sansjp text-gold-200">
                      本日
                    </span>
                  )}
                  <span className="flex-1 text-right font-cinzel text-[18px] tracking-[0.18em] text-gold-200">
                    {d.code}
                  </span>
                  <CopyButton value={d.code} />
                </li>
              )
            })}
          </ul>
        </section>

        {/* 会員合言葉 */}
        <section className="mt-10">
          <p className="font-cormorant text-gold-400 text-[11px] tracking-[0.34em] [font-variant:small-caps]">
            Member Password
          </p>
          <h2 className="mt-1 font-serifjp text-[15px] text-navy-100">会員合言葉（サイト共通パスワード）</h2>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-gold-500/25 bg-navy-800/40 px-4 py-4">
            <span className="flex-1 break-all font-cinzel text-[20px] tracking-[0.1em] text-gold-200">
              {sitePassword}
            </span>
            <CopyButton value={sitePassword} />
          </div>
          <p className="mt-3 break-keep text-navy-300 text-[11px] font-sansjp leading-relaxed">
            メンバーがサイトに入るための共通パスワードです（入口の「合言葉」）。日替わりではありません。
          </p>
        </section>

        <p className="mt-10 text-center text-navy-400 text-[10px] font-sansjp tracking-[0.1em]">
          すべて JST（日本時間）基準
        </p>
      </div>
    </main>
  )
}
