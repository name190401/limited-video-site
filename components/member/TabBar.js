'use client'

/**
 * 金下線アンダーラインタブ（§6 共通）。選択中＝金下線＋navy-900／非選択＝navy-400。
 * 07 プラン・09 製品（短い2タブ）と 05 クロージング（担当を横スクロール＋準備中バッジ）で共用。
 *
 * @param {Array}    tabs        [{ key, label, badge? }]（badge は任意の React ノード）
 * @param {string}   active      選択中の key
 * @param {Function} onChange    (key) => void
 * @param {boolean}  scrollable  タブが多いとき横スクロール（クロージング）
 * @param {boolean}  compact     タブ間隔を詰める（375px で4タブを初期表示に収めるため。§08 製品のみ）
 */
export default function TabBar({ tabs, active, onChange, scrollable = false, compact = false }) {
  return (
    <div
      className={`flex ${compact ? 'gap-3' : 'gap-4'} border-b border-navy-200 mb-5 ${
        scrollable ? 'scroll-strip overflow-x-auto' : ''
      }`.trim()}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`shrink-0 pb-2 text-[14px] font-semibold flex items-center gap-1.5 border-b-2 -mb-px transition-colors ${
            active === t.key ? 'border-gold-400 text-navy-900' : 'border-transparent text-navy-400'
          }`}
        >
          {t.label}
          {t.badge}
        </button>
      ))}
    </div>
  )
}
