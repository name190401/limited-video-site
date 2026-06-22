/**
 * 金ヘアライン罫＋中央菱形オーナメントの区切り（§4 章扉・07 プランで共用）。
 * @param {string} className - ラッパー div に足す追加クラス（余白調整等）
 */
export default function DividerWithDiamond({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2${className ? ` ${className}` : ''}`}>
      <span className="h-px w-10 gold-hairline" />
      <span className="w-1 h-1 rotate-45 bg-gold-400" />
      <span className="h-px w-10 gold-hairline" />
    </div>
  )
}
