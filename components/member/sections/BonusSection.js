import SectionShell from '../SectionShell'
import ComingSoonCard from '../ComingSoonCard'
import StepChain from '../StepChain'

/**
 * 08 ボーナス（インカム・§6）。
 * 段階図解（金丸数字 ①②③ 縦ステップ）＋ 数値は実数値を入れず「準備中」プレースホルダ
 * （法規制トーン確認前は実数値・実コピーを入れない）。
 */
const STEPS = [
  { label: 'まず知る', desc: 'QUALIA の仕組みと、どんな関わり方ができるかを知るところから。' },
  { label: '体験する', desc: '製品やコミュニティを実際に体験し、自分の言葉で語れるようになる。' },
  { label: '広げる', desc: '良いと感じたものを、信頼できる人へ自分のペースで伝えていく。' },
]

export default function BonusSection({ section }) {
  return (
    <SectionShell num="08" title="ボーナス（インカム）">
      <StepChain steps={STEPS} size="lg" className="max-w-[640px] mx-auto" />

      {/* 報酬詳細は準備中（実数値・実コピーは投入段階で法規制確認の上） */}
      <div className="max-w-[640px] mx-auto mt-8">
        <ComingSoonCard
          title="報酬プラン・条件の詳細"
          month={section?.status === 'coming_soon' ? '7月' : undefined}
        />
      </div>
    </SectionShell>
  )
}
