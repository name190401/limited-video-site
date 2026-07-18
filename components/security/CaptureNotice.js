/** 会員画面に常時表示する撮影・転載禁止の控えめな注意書き。 */
export default function CaptureNotice() {
  return (
    <div className="fixed bottom-2 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
      <p className="rounded-full bg-navy-900/75 px-3 py-1.5 text-center text-[10px] leading-none text-white/60 backdrop-blur-sm">
        スクリーンショット・画面録画・無断転載は固く禁止されています
      </p>
    </div>
  )
}
