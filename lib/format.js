/**
 * クライアント・サーバー両用の表示フォーマット小物（機密非依存・server-only ガード無し）。
 */

/** ゼロ埋め2桁。章番号・章ID（sec-NN）・トレーニング連番など共通。 */
export function pad2(n) {
  return String(n).padStart(2, '0')
}
