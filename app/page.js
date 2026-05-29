import Link from 'next/link';

export default function TopPage() {
  return (
    <div className="min-h-screen bg-dark-600 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold-400/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gold-400/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-gradient rounded-sm" />
          <span className="text-lg font-semibold tracking-wide text-gold-200">
            PREMIUM PRESENTATIONS
          </span>
        </div>
        <Link
          href="/login"
          className="text-sm text-gold-300 hover:text-gold-200 transition-colors border border-gold-400/30 hover:border-gold-400/60 px-5 py-2 rounded"
        >
          ログイン
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 md:pt-32 md:pb-40">
        {/* Thin gold line accent */}
        <div className="w-16 h-px bg-gold-gradient mb-8" />

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
          <span className="text-gold-gradient">限定公開</span>
          <br />
          <span className="text-white/90">ビジネスプレゼンテーション</span>
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
          厳選されたプレミアムコンテンツを、
          <br className="hidden md:block" />
          セキュアな環境でいつでもご視聴いただけます。
        </p>

        <Link
          href="/login"
          className="group relative inline-flex items-center gap-3 bg-gold-gradient text-dark-600 font-semibold text-base px-10 py-4 rounded transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:scale-[1.02]"
        >
          メンバーログイン
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Decorative gold line below CTA */}
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent mt-16" />
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 px-6 md:px-16 pb-32">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Card 1 */}
          <div className="group bg-dark-400/60 border border-white/[0.06] rounded-lg p-8 hover:border-gold-400/20 transition-all duration-500 glow-gold-hover">
            <div className="w-12 h-12 rounded-lg bg-gold-400/10 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white/90 mb-3">セキュアな限定公開</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              招待制のアクセス管理により、承認されたメンバーのみがコンテンツを視聴できます。情報の機密性を確保します。
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-dark-400/60 border border-white/[0.06] rounded-lg p-8 hover:border-gold-400/20 transition-all duration-500 glow-gold-hover">
            <div className="w-12 h-12 rounded-lg bg-gold-400/10 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white/90 mb-3">プレミアムコンテンツ</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              業界トップクラスの知見を凝縮したプレゼンテーション。ビジネス成長に直結する実践的なノウハウをお届けします。
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-dark-400/60 border border-white/[0.06] rounded-lg p-8 hover:border-gold-400/20 transition-all duration-500 glow-gold-hover">
            <div className="w-12 h-12 rounded-lg bg-gold-400/10 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white/90 mb-3">いつでもどこでも</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              PC・タブレット・スマートフォンに最適化。移動中やオフィスなど、お好きな場所でご視聴いただけます。
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gold-gradient rounded-sm opacity-60" />
            <span className="text-xs text-white/30 tracking-wide">PREMIUM PRESENTATIONS</span>
          </div>
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Premium Presentations. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
