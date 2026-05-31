/**
 * 準備中部品（§7）。
 * グレーアウト・工事中アイコンは使わない（予告として成立させる＝勧誘材料）。
 * 地: navy-50 ＋ 金1px、左上に金「準備中」ラベル、タイトル（何が来るか）、公開月、任意で担当アバター。
 * opacity 0.7（完全には消さない）。
 *
 * @param {string} title    - 何が来るか（必須）
 * @param {string} month    - 「◯月公開予定」表示用（例 "6月"）
 * @param {object} owner     - { name, photo_url } 担当（任意・08等）
 * @param {boolean} compact  - 横スクロールストリップ用の固定幅カード
 */
export default function ComingSoonCard({ title, month, owner, compact = false }) {
  return (
    <div
      style={{ boxShadow: '0 1px 2px rgba(12,21,48,0.05), 0 10px 24px -14px rgba(12,21,48,0.18)' }}
      className={`relative rounded-xl border border-gold-400/50 bg-navy-50 p-4 opacity-80 ${
        compact ? 'shrink-0 w-44' : 'w-full'
      }`}
    >
      <span className="inline-block border border-gold-500 text-gold-700 text-[10px] font-medium tracking-[0.14em] rounded-full px-2.5 py-0.5">準備中</span>
      <p className="mt-2.5 font-serifjp font-semibold text-navy-900 text-[15px] leading-snug">{title}</p>
      {month && <p className="mt-1 text-navy-400 text-[12px] tracking-[0.04em]">{month}公開予定</p>}
      {owner?.name && (
        <div className="mt-3 flex items-center gap-2">
          {owner.photo_url ? (
            <span className="rounded-full p-px gold-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={owner.photo_url} alt="" className="block w-6 h-6 rounded-full object-cover" />
            </span>
          ) : (
            <span className="w-6 h-6 rounded-full border border-dashed border-gold-400" />
          )}
          <span className="text-navy-400 text-[12px]">{owner.name}</span>
        </div>
      )}
    </div>
  )
}
