import SectionShell from '../SectionShell'
import ComingSoonCard from '../ComingSoonCard'
import PillButton from '../PillButton'

/**
 * 06 Instagram 導線（§6）。
 * スクショ風カード（実埋め込みは外部依存のため不採用）＝直近投稿サムネ格子（タップで IG へ）
 * ＋ 金アウトライン「Instagram を見る」ボタン。未連携なら ComingSoonCard。
 *
 * @param {string} igUrl  Instagram プロフィール URL（未設定なら準備中）
 * @param {Array}  posts  [{ thumbnail, url }]（任意）
 */
export default function InstagramSection({ igUrl, posts = [] }) {
  return (
    <SectionShell num="06" title="Instagram">
      {igUrl ? (
        <>
          {posts.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {posts.slice(0, 3).map((p, i) => (
                <a key={i} href={p.url || igUrl} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-navy-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                </a>
              ))}
            </div>
          )}
          <div className="text-center">
            <PillButton href={igUrl} target="_blank" rel="noopener noreferrer">
              Instagram を見る
            </PillButton>
          </div>
        </>
      ) : (
        <ComingSoonCard title="Instagram 連携" month="6月" />
      )}
    </SectionShell>
  )
}
