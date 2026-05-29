import ChapterHeader from '../ChapterHeader'
import BackToHub from '../BackToHub'
import ComingSoonCard from '../ComingSoonCard'

/**
 * 08 ボーナス（インカム・§6）。
 * 段階図解（金丸数字 ①②③ 縦ステップ）＋ 数値は実数値を入れず「準備中」プレースホルダ
 * （法規制トーン確認前は実数値・実コピーを入れない）。
 */
const STEPS = [
  { n: '1', label: 'まず知る', desc: 'QUALIA の仕組みと、どんな関わり方ができるかを知るところから。' },
  { n: '2', label: '体験する', desc: '製品やコミュニティを実際に体験し、自分の言葉で語れるようになる。' },
  { n: '3', label: '広げる', desc: '良いと感じたものを、信頼できる人へ自分のペースで伝えていく。' },
]

export default function BonusSection({ section }) {
  return (
    <section className="bg-navy-50 px-5 py-14 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <ChapterHeader num="08" title="ボーナス（インカム）" />

        <ol className="max-w-[640px] mx-auto space-y-5">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full border border-gold-400 text-gold-600 font-serif text-lg flex items-center justify-center">
                {s.n}
              </span>
              <div className="pt-0.5">
                <p className="font-semibold text-navy-900 text-[16px]">{s.label}</p>
                <p className="mt-1 text-navy-900/80 text-[14px] leading-[1.8]">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* 報酬詳細は準備中（実数値・実コピーは投入段階で法規制確認の上） */}
        <div className="max-w-[640px] mx-auto mt-8">
          <ComingSoonCard
            title="報酬プラン・条件の詳細"
            month={section?.status === 'coming_soon' ? '7月' : undefined}
          />
        </div>
        <BackToHub />
      </div>
    </section>
  )
}
