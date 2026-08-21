'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const WD = ['日', '月', '火', '水', '木', '金', '土']
const JST_DATE_TIME = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function fmtJst(value) {
  if (!value) return '—'
  return JST_DATE_TIME.format(new Date(value))
}

function deviceLabel(ua) {
  if (!ua) return '不明'
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Android/i.test(ua)) return 'Android'
  return 'PC'
}

const LOGIN_LABELS = {
  member: '会員ログイン',
  admin: '管理者ログイン',
  unlock: 'コード解除',
}

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

const PASSWORD_ERRORS = {
  missing: '新しいパスワードを入力してください',
  mismatch: '2回の入力が一致しません',
  whitespace: '前後に空白は使えません',
  length: '8〜64文字で入力してください',
  charset: '半角の英数字と記号のみ使えます（空白は使えません）',
  same_as_current: '現在と同じです',
}

function PasswordSection({ value, updatedAt }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [visible, setVisible] = useState(false)
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [current, setCurrent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const closeForm = () => {
    setEditing(false)
    setNext('')
    setConfirm('')
    setCurrent('')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setMessage('')
    setSuccess(false)
    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current, next, confirm }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setSuccess(true)
        setMessage('変更しました。この管理者パスワードでログイン中の端末は、すべて再ログインが必要になります。')
        closeForm()
        router.refresh()
      } else if (response.status === 503 || data.error === 'service_unavailable') {
        setMessage('データベースに接続できないため変更できませんでした。時間をおいてお試しください。')
      } else if (response.status === 401) {
        setMessage(
          data.error === 'invalid_current'
            ? '現在の管理者パスワードが違います'
            : 'セッションが切れました。ログインし直してください'
        )
      } else if (response.status === 429) {
        setMessage('試行回数が多すぎます。しばらく時間をおいてお試しください。')
      } else {
        setMessage(PASSWORD_ERRORS[data.error] || '変更できませんでした。もう一度お試しください。')
      }
    } catch {
      setMessage('通信エラーが発生しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  const actionClass =
    'shrink-0 rounded-lg border border-gold-400/40 px-3 py-1.5 text-[12px] font-sansjp tracking-[0.06em] text-gold-200 transition-colors hover:border-gold-400 hover:text-gold-100'
  const inputClass =
    'w-full rounded-xl border border-gold-400/30 bg-navy-900/60 px-4 py-3 text-[14px] text-white placeholder-navy-300 focus:border-gold-400 focus:outline-none disabled:opacity-50'

  return (
    <section className="mt-10">
      <p className="font-cormorant text-gold-400 text-[11px] tracking-[0.34em] [font-variant:small-caps]">
        Admin Password
      </p>
      <h2 className="mt-1 font-serifjp text-[15px] text-navy-100">
        管理者パスワード
      </h2>
      <p className="mt-1 text-[11px] font-sansjp text-navy-300">
        最終変更：{updatedAt ? fmtJst(updatedAt) : '—（初期値）'}
      </p>
      <div className="mt-3 rounded-2xl border border-gold-500/25 bg-navy-800/40 px-4 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 break-all font-cinzel text-[20px] tracking-[0.1em] text-gold-200">
            {visible ? value : '••••••••'}
          </span>
          <button type="button" onClick={() => setVisible((shown) => !shown)} className={actionClass}>
            {visible ? '隠す' : '表示'}
          </button>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <CopyButton value={value} />
          <button
            type="button"
            onClick={() => {
              setEditing(true)
              setMessage('')
              setSuccess(false)
            }}
            className={actionClass}
          >
            変更
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={submit} className="mt-3 space-y-3 rounded-2xl border border-gold-500/25 bg-navy-800/40 p-4">
          <input
            type="password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            placeholder="新しい管理者パスワード"
            autoComplete="new-password"
            disabled={submitting}
            className={inputClass}
          />
          <input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="確認のためもう一度"
            autoComplete="new-password"
            disabled={submitting}
            className={inputClass}
          />
          <input
            type="password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            placeholder="現在の管理者パスワード"
            autoComplete="current-password"
            disabled={submitting}
            className={inputClass}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold min-w-0 flex-1 rounded-xl px-3 py-2.5 font-sansjp text-[13px] font-semibold disabled:opacity-50"
            >
              {submitting ? '変更中…' : '変更する'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={submitting}
              className="min-w-0 flex-1 rounded-xl border border-gold-400/40 px-3 py-2.5 font-sansjp text-[13px] text-gold-200 disabled:opacity-50"
            >
              やめる
            </button>
          </div>
        </form>
      )}
      {message && (
        <p className={`mt-3 text-[12px] font-sansjp leading-relaxed ${success ? 'text-gold-200' : 'text-rose-300'}`}>
          {message}
        </p>
      )}
      <p className="mt-3 break-keep text-navy-300 text-[11px] font-sansjp leading-relaxed">
        管理画面へのログインに使うパスワードです。
      </p>
      {/* ※ が前段落の行末に取り残されないよう、注意書きは独立した段落にする。 */}
      <p className="mt-2 break-keep text-navy-300 text-[11px] font-sansjp leading-relaxed">
        ※伏字は覗き見防止のみで、この画面のソースには値が含まれます。共有画面での表示にご注意ください。
      </p>
    </section>
  )
}

/**
 * 管理ダッシュボード。入口の日替わりコード（今日＋今後6日）と管理者パスワードを表示し、
 * 管理者パスワードはその場で変更できる（PasswordSection）。
 * @param {{date:string,code:string}[]} days  先頭が今日（JST）
 * @param {string} adminPassword 管理者パスワードの現在値（既定は伏字表示）
 * @param {string|null} adminPasswordUpdatedAt settings 行の updated_at。null＝初期値のまま
 */
export default function AdminDashboard({
  days,
  adminPassword,
  adminPasswordUpdatedAt,
  loginEvents,
  playStats,
  logsEnabled,
}) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const today = days[0]
  const todayFmt = fmt(today.date)

  const logout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/admin', { method: 'DELETE' }) // 会員/管理 両Cookieを破棄
      router.replace('/enter')
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
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-lg border border-gold-400/30 px-3 py-1.5 text-[12px] font-sansjp text-navy-100 transition-colors hover:border-gold-400/60 hover:text-white"
            >
              ← サイトに戻る
            </a>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="rounded-lg border border-gold-400/30 px-3 py-1.5 text-[12px] font-sansjp text-navy-100 transition-colors hover:border-gold-400/60 hover:text-white disabled:opacity-50"
            >
              {loggingOut ? '…' : 'ログアウト'}
            </button>
          </div>
        </header>

        <span className="mt-6 block h-px w-full gold-hairline" />

        {/* 本日の日替わりパスコード */}
        <section className="mt-8">
          <p className="font-cormorant text-gold-400 text-[11px] tracking-[0.34em] [font-variant:small-caps]">
            Today&apos;s Code
          </p>
          <h2 className="mt-1 font-serifjp text-[15px] text-navy-100">
            本日の合言葉（サイトに入るコード）
            <span className="ml-2 inline-block whitespace-nowrap text-gold-300">
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
            会員・見込み客がサイトに入るための6桁コードです。JST 0:00 に自動で切り替わり、前日のコードは使えなくなります。
          </p>
          <p className="mt-2 break-keep text-navy-300 text-[11px] font-sansjp leading-relaxed">
            日付が変わるとログイン中の方も入り直しになります。<span className="text-gold-200">前夜のうちに翌日分を配っておく</span>と、深夜の問い合わせを防げます。
          </p>
        </section>

        {/* 今後7日分 */}
        <section className="mt-10">
          <p className="mb-3 break-keep rounded-xl border border-gold-500/25 bg-navy-800/40 px-4 py-3 text-navy-300 text-[11px] font-sansjp leading-relaxed">
            <span className="text-gold-200">この一覧は7日分の玄関の鍵です。</span>まとめて画面共有・スクショ共有しないでください。渡した相手はその日付になればサイト全体に入れます。
          </p>
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

        <PasswordSection value={adminPassword} updatedAt={adminPasswordUpdatedAt} />

        {/* 動画再生回数 */}
        <section className="mt-10">
          <p className="font-cormorant text-gold-400 text-[11px] tracking-[0.34em] [font-variant:small-caps]">
            Video Plays
          </p>
          <h2 className="mt-1 font-serifjp text-[15px] text-navy-100">動画再生回数</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-gold-500/25 bg-navy-800/40">
            {!logsEnabled ? (
              <p className="px-4 py-5 text-[12px] leading-relaxed text-navy-300">
                ログ記録は未設定です（Supabase 接続後に有効化されます）
              </p>
            ) : playStats.length === 0 ? (
              <p className="px-4 py-5 text-[12px] text-navy-300">まだ記録がありません</p>
            ) : (
              <ul>
                {playStats.map((stat, i) => (
                  <li
                    key={stat.youtubeId}
                    className={`grid grid-cols-[minmax(0,1fr)_3rem] gap-x-3 px-4 py-3 ${i > 0 ? 'border-t border-gold-500/15' : ''}`}
                  >
                    <p className="truncate text-[12px] text-navy-100" title={stat.title || stat.youtubeId}>
                      {stat.title || stat.youtubeId}
                    </p>
                    <p className="text-right font-cinzel text-[14px] text-gold-200">{stat.count}回</p>
                    <p className="col-span-2 mt-1 truncate text-[10px] text-navy-400">
                      最終再生 {fmtJst(stat.lastPlayedAt)} JST
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ログイン履歴 */}
        <section className="mt-10">
          <p className="font-cormorant text-gold-400 text-[11px] tracking-[0.34em] [font-variant:small-caps]">
            Login History
          </p>
          <h2 className="mt-1 font-serifjp text-[15px] text-navy-100">ログイン履歴</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-gold-500/25 bg-navy-800/40">
            {!logsEnabled ? (
              <p className="px-4 py-5 text-[12px] leading-relaxed text-navy-300">
                ログ記録は未設定です（Supabase 接続後に有効化されます）
              </p>
            ) : loginEvents.length === 0 ? (
              <p className="px-4 py-5 text-[12px] text-navy-300">まだ記録がありません</p>
            ) : (
              <ul>
                {loginEvents.map((event, i) => (
                  <li
                    key={event.id}
                    className={`grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-3 ${i > 0 ? 'border-t border-gold-500/15' : ''}`}
                  >
                    <p className="text-[11px] tabular-nums text-navy-300">{fmtJst(event.ts)}</p>
                    <p className="truncate text-[12px] text-gold-200">{LOGIN_LABELS[event.kind] || event.kind}</p>
                    <p className="truncate text-[10px] text-navy-400" title={event.ip || ''}>{event.ip || '—'}</p>
                    <p className="truncate text-[10px] text-navy-400" title={event.ua || ''}>{deviceLabel(event.ua)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <p className="mt-10 text-center text-navy-400 text-[10px] font-sansjp tracking-[0.1em]">
          すべて JST（日本時間）基準
        </p>
      </div>
    </main>
  )
}
