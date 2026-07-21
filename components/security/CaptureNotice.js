/** 会員画面に常時表示する撮影・転載禁止の控えめな注意書き。 */
export default function CaptureNotice() {
  return (
    <div className="fixed bottom-2 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
      <div className="max-w-full rounded-2xl bg-navy-900/75 px-3 py-1.5 text-center backdrop-blur-sm">
        <p className="break-keep text-[10px] leading-tight text-white/60">
          スクリーンショット・画面録画・無断転載は固く禁止されています
        </p>
        <p className="mt-1 break-keep text-[10px] leading-tight text-white/65">
          アクセスログ（IPアドレス等）を記録しています
        </p>
      </div>
    </div>
  )
}
