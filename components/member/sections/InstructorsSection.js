import SectionShell from '../SectionShell'

/**
 * 02 講師紹介。
 * 主役 石井諒（写真未提供）= 上質なヒーロー帯（モノグラム＋castle講師＋プロフィール常時表示）。
 * 提供メンバー = 大判ポートレートのストーリーカード（写真に氏名オーバーレイ＋下に物語を常時表示）。
 * モバイル1列 / sm 以上 2列。写真は aspect-[4/5]・object-top で顔が見切れない。
 * 明るい section 地に、紺カード×金枠を浮かせる紺×金ラグジュアリー構成。
 *
 * @param {Array} instructors  type='lecturer' の講師（sort_order 順）
 */
export default function InstructorsSection({ instructors = [] }) {
  const lead = instructors[0]
  const rest = instructors.slice(1)

  return (
    <SectionShell num="02" title="講師紹介">
      {/* 主役（castle 講師） */}
      {lead && (
        <div
          className="mb-9 overflow-hidden rounded-2xl border border-gold-500/30 bg-navy-800"
          style={{ boxShadow: '0 20px 44px -24px rgba(12,21,48,0.55)' }}
        >
          <div className="flex items-center gap-4 p-5">
            {lead.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lead.photo_url}
                alt={lead.name}
                loading="lazy"
                decoding="async"
                className="h-24 w-24 shrink-0 rounded-xl object-cover object-top ring-1 ring-gold-500/40"
              />
            ) : (
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-gold-500/50 bg-navy-900 font-cinzel text-4xl text-gold-300">
                {lead.name?.[0]}
              </span>
            )}
            <div className="min-w-0">
              <span className="font-cormorant text-gold-400 text-[11px] tracking-[0.34em] [font-variant:small-caps]">
                CASTLE INSTRUCTOR
              </span>
              <h3 className="mt-0.5 font-serifjp text-[23px] leading-tight text-white">{lead.name}</h3>
              <span className="text-gold-300 text-[12px] tracking-[0.1em]">
                castle 講師
                {lead.region ? `・${lead.region}` : ''}
                {lead.age ? `・${lead.age}歳` : ''}
              </span>
            </div>
          </div>
          {lead.profile && (
            <p className="whitespace-pre-line border-t border-gold-500/20 px-5 py-4 text-[14px] leading-[1.95] text-navy-100">
              {lead.profile}
            </p>
          )}
        </div>
      )}

      {/* 提供メンバー = ストーリーカード（写真大・プロフィール常時表示） */}
      {rest.length > 0 ? (
        <>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gold-500/30" />
            <span className="font-cormorant text-gold-600 text-[12px] tracking-[0.3em] [font-variant:small-caps]">
              QUALIA Members
            </span>
            <span className="h-px flex-1 bg-gold-500/30" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map((i) => (
              <article
                key={i.id}
                className="group overflow-hidden rounded-2xl border border-gold-500/30 bg-navy-800 transition-transform duration-300 hover:-translate-y-0.5"
                style={{ boxShadow: '0 16px 38px -24px rgba(12,21,48,0.6)' }}
              >
                {/* ポートレート（顔が見切れないよう縦長＋object-top） */}
                <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
                  {i.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={i.photo_url}
                      alt={i.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-cinzel text-6xl text-gold-300/60">
                      {i.name?.[0]}
                    </span>
                  )}
                  {/* 紺のウォッシュ：ソース写真ごとの背景差を吸収しブランド統一（顔は薄く保つ） */}
                  <div className="pointer-events-none absolute inset-0 bg-navy-800/18 mix-blend-multiply" />
                  {/* 下部グラデーション＋氏名オーバーレイ */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900 via-navy-900/80 to-transparent px-4 pb-3 pt-16">
                    <span className="mb-2 block h-px w-9 bg-gold-400" />
                    <h3 className="font-serifjp text-[21px] leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                      {i.name}
                    </h3>
                  </div>
                </div>
                {/* 物語（常時表示・改行保持） */}
                {i.profile && (
                  <p className="whitespace-pre-line px-4 py-4 text-[13.5px] leading-[1.9] text-navy-100">
                    {i.profile}
                  </p>
                )}
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="text-navy-400 text-[13px] text-center">講師を順次ご紹介します。</p>
      )}
    </SectionShell>
  )
}
