import Reveal from './Reveal'

/**
 * 金丸数字の縦ステップ（§6）。連結罫は globals.css の .step-chain が描く。
 * lg = 08 報酬の3段階（丸36px）／ sm = 11・12 の手順（丸32px）。
 *
 * @param {Array}  steps      [{ label, desc? }]（番号は並び順 i+1）
 * @param {'lg'|'sm'} size
 * @param {string} className  外側 <ol> への余白・幅指定（max-w / mt 等）
 */
const SIZES = {
  lg: { chain: 'step-chain--lg', gap: 'gap-4', space: 'space-y-5', circle: 'w-9 h-9 text-lg', label: 'text-[16px]', descMt: 'mt-1' },
  sm: { chain: 'step-chain--sm', gap: 'gap-3', space: 'space-y-4', circle: 'w-8 h-8', label: 'text-[15px]', descMt: 'mt-0.5' },
}

export default function StepChain({ steps = [], size = 'sm', className = '' }) {
  const s = SIZES[size]
  return (
    <ol className={`step-chain ${s.chain} ${s.space} ${className}`.trim()}>
      {steps.map((step, i) => (
        <Reveal as="li" key={i} delay={i * 70} className={`flex ${s.gap}`}>
          <span className={`shrink-0 ${s.circle} rounded-full border border-gold-400 text-gold-600 font-serif flex items-center justify-center bg-[#EEF2FB]`}>
            {i + 1}
          </span>
          <div className="pt-0.5">
            <p className={`font-semibold text-navy-900 ${s.label}`}>{step.label}</p>
            {step.desc && <p className={`${s.descMt} text-navy-900/80 text-[14px] leading-[1.8]`}>{step.desc}</p>}
          </div>
        </Reveal>
      ))}
    </ol>
  )
}
