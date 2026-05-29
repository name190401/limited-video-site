import ChapterHeader from '../ChapterHeader'
import BackToHub from '../BackToHub'
import ComingSoonCard from '../ComingSoonCard'

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
    <section className="bg-navy-50 px-5 py-14 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <ChapterHeader num="06" title="Instagram" />

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
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gold-400 text-gold-600 font-semibold text-[14px] px-6 py-3"
              >
                Instagram を見る
              </a>
            </div>
          </>
        ) : (
          <ComingSoonCard title="Instagram 連携" month="6月" />
        )}

        <BackToHub />
      </div>
    </section>
  )
}
