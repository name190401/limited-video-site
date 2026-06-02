/**
 * 金アウトライン丸ピル CTA（§6 共通）。href ありで <a>、無しで装飾 <span>。
 * FAQ「紹介者に質問する」・登録の流れ CTA・Instagram 導線で共用。
 */
export default function PillButton({ href, children, ...rest }) {
  const cls =
    'inline-flex items-center gap-2 rounded-full border border-gold-400 text-gold-600 font-semibold text-[14px] px-6 py-3'
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  )
}
