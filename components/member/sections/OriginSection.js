import SectionShell from '../SectionShell'

/** 01 由来（読み物・§6）。章扉→本文（max-w-640）＋金引用罫。 */
export default function OriginSection({ section }) {
  const body =
    section?.body ||
    'QUALIA（クオリア）は、「五感で感じる質的な経験」を意味する言葉です。\n数字や条件だけでは語り尽くせない、一人ひとりが手にする実感・変化・つながり——その「質」をいちばん大切にしたい。その想いから、この名前を選びました。'
  return (
    <SectionShell num="01" title="QUALIA の名前の由来">
      <div className="max-w-[640px] mx-auto">
        <div className="border-l-2 border-gold-400 pl-4">
          {body.split('\n').map((p, i) => (
            <p key={i} className="text-navy-900 text-[15px] md:text-[16px] leading-[1.8] mb-4 last:mb-0">
              {p}
            </p>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
