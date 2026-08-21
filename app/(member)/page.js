import { getSections, getAllSectionVideos, getInstructors, getFaqs } from '@/lib/content'
import Hero from '@/components/member/Hero'
import Hub from '@/components/member/Hub'
import SectionMenu from '@/components/member/SectionMenu'
import Footer from '@/components/member/Footer'
import OriginSection from '@/components/member/sections/OriginSection'
import InstructorsSection from '@/components/member/sections/InstructorsSection'
import VideoGridSection from '@/components/member/sections/VideoGridSection'
import PlanIntroSection from '@/components/member/sections/PlanIntroSection'
import ClosingSection from '@/components/member/sections/ClosingSection'
import InstagramSection from '@/components/member/sections/InstagramSection'
import BonusSection from '@/components/member/sections/BonusSection'
import ProductsSection from '@/components/member/sections/ProductsSection'
import TrainingSection from '@/components/member/sections/TrainingSection'
import StepsVideoSection from '@/components/member/sections/StepsVideoSection'
import ComplianceSection from '@/components/member/sections/ComplianceSection'
import FaqSection from '@/components/member/sections/FaqSection'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminCookieValue } from '@/lib/auth/admin'
import { publishedVideos } from '@/lib/video'

// 動画が DB から来るため毎リクエスト最新を反映（再デプロイ無しで公開反映）。
export const dynamic = 'force-dynamic'

export default async function MemberHome() {
  const [sections, videosBySection, lecturers, closers, faqs] = await Promise.all([
    getSections(),
    getAllSectionVideos(),
    getInstructors('lecturer'),
    getInstructors('closer'),
    getFaqs(),
  ])

  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]))
  const v = (key) => videosBySection[key] || []
  const lead = lecturers[0]

  // 統一ログインで管理者PWを入れた人だけ Admin Cookie を持つ → メニューに管理者ページを出す。
  const isAdmin = await verifyAdminCookieValue(cookies().get(ADMIN_COOKIE)?.value)

  return (
    <>
      <span id="top" />
      <SectionMenu sections={sections} isAdmin={isAdmin} />
      <Hero lead={lead} />
      <Hub sections={sections} />

      <OriginSection section={byKey.origin} />
      <InstructorsSection instructors={lecturers} />
      <VideoGridSection num="03" title="オープニング" lead="まずはここから。各メンバーの導入動画をご覧ください。" videos={v('ear_opening')} month="6月" />
      <PlanIntroSection videos={v('plan_intro')} />
      <ClosingSection closers={closers} videos={v('closing')} />
      <InstagramSection igUrl={null} />
      <BonusSection section={byKey.bonus} videos={v('bonus')} />
      <ProductsSection videos={v('products')} />
      <TrainingSection videos={v('training')} />
      <StepsVideoSection
        num="10"
        title="登録の流れ"
        steps={[
          { label: '紹介者から案内を受ける', desc: '登録に必要な情報を紹介者が一緒に確認します。' },
          { label: '必要事項を入力', desc: 'お名前・連絡先などを登録します。' },
          { label: '登録完了', desc: 'そのまま QUALIA をスタートできます。' },
        ]}
        cta="登録について紹介者に聞く"
      />
      <StepsVideoSection
        num="11"
        title="QUALIA ページの使い方"
        steps={[
          { label: 'メニューから見たい項目へ', desc: '右上のメニュー、またはハブから各セクションに飛べます。' },
          { label: '動画はタップで再生', desc: '気になる動画をタップするとその場で再生します。' },
          { label: '翌日はもう一度コードを入力', desc: '合言葉は毎日変わります。日付が変わったら、その日のコードで入り直してください。' },
        ]}
        video={publishedVideos(v('how_to_use'))[0] || null}
      />
      <VideoGridSection
        num="12"
        title="北村弁護士の副業のすすめ"
        lead="副業と法律の考え方について、弁護士の北村晴男先生が解説しています。"
        videos={v('kitamura')}
        desired={1}
      />
      <ComplianceSection videos={v('compliance')} />
      <FaqSection faqs={faqs} />

      <Footer />
    </>
  )
}
