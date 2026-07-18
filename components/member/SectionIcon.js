/**
 * セクション別の簡素なラインアイコン（ハブ／ハンバーガー用）。
 * 金 1px ストロークで統一。section key で出し分け。
 */
const PATHS = {
  origin: 'M3 11l9-7 9 7M5 9v9h14V9', // 由来=家/起点
  instructors: 'M7 9a3 3 0 106 0 3 3 0 00-6 0M4 19c0-3 3-5 6-5s6 2 6 5', // 講師=人
  ear_opening: 'M6 11a6 6 0 1112 0c0 4-3 5-3 8a3 3 0 01-6 0', // 耳開け=耳
  plan_intro: 'M5 4h14v16l-7-3-7 3V4z', // プラン説明=しおり
  closing: 'M4 5h16v10H7l-3 3V5z', // クロージング=会話
  instagram: 'M4 4h16v16H4zM8 12a4 4 0 108 0 4 4 0 00-8 0M17 7h.01', // IG
  bonus: 'M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 21l-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3z', // ボーナス=星
  products: 'M5 7l7-4 7 4v10l-7 4-7-4V7zM5 7l7 4 7-4M12 11v10', // 製品=箱
  training: 'M4 6h16M4 12h16M4 18h10', // トレーニング=リスト
  registration: 'M5 12l4 4 10-10', // 登録=チェック
  how_to_use: 'M12 17h.01M9 9a3 3 0 114 2.5c-1 .7-1 1-1 2', // 使い方=?
  faq: 'M8 10h8M8 14h5M4 5h16v12H9l-5 4V5z', // FAQ=吹き出し
}

export default function SectionIcon({ sectionKey, className = 'w-6 h-6' }) {
  const d = PATHS[sectionKey] || 'M4 4h16v16H4z'
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
