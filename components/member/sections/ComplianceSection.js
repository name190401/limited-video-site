import SectionShell from '../SectionShell'
import VideoCard from '../VideoCard'
import { publishedVideos } from '@/lib/video'

/**
 * 13 法令遵守（読み物・§6）。章扉→本文（max-w-640）＋解説動画＋会員限定資料。
 */
export default function ComplianceSection({ videos = [] }) {
  const video = publishedVideos(videos)[0] || null
  return (
    <SectionShell num="13" title="法令遵守">
      <div className="max-w-[640px] mx-auto">
        <div className="border-l-2 border-gold-400 pl-4">
          <p className="text-navy-900 text-[15px] md:text-[16px] leading-[1.8] mb-4">
            QUALIA のビジネスは、特定商取引法をはじめとする法令にもとづいて行われます。
          </p>
          <p className="text-navy-900 text-[15px] md:text-[16px] leading-[1.8]">
            活動をはじめる前に、下の資料に必ず目を通してください。守るべきルールと、やってはいけない伝え方をまとめています。
          </p>
        </div>
        {video && (
          <div className="mt-6">
            <VideoCard video={video} />
          </div>
        )}
        <div className="mt-6 text-center">
          <a
            href="/docs/compliance.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex rounded-full font-sansjp font-semibold text-[14px] tracking-[0.06em] px-8 py-3 break-keep [overflow-wrap:anywhere] [line-break:strict]"
          >
            コンプライアンス資料（PDF）を開く
          </a>
        </div>
        <p className="text-navy-400 text-[12px] mt-3 text-center break-keep [overflow-wrap:anywhere] [line-break:strict]">
          ※ 会員限定の資料です。ログインした状態でのみ開けます。
        </p>
      </div>
    </SectionShell>
  )
}
