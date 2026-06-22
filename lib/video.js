/**
 * 動画の表示判定（クライアント安全・server-only ガード無し）。
 * youtube_id を伏せた locked 行も通るが、ここでは status と id の有無だけ見る。
 */

/** 公開済み かつ youtube_id 設定済み（＝実際に再生できる）動画か。 */
export function isPublished(v) {
  return v?.status === 'published' && !!v.youtube_id
}

/** 再生可能な動画だけを抽出。 */
export function publishedVideos(videos = []) {
  return videos.filter(isPublished)
}

/**
 * layer2（プラン保護）動画は youtube_id を伏せ locked:true を立て、
 * それ以外は locked:false で返す（DB 取得・ローカル両方の共通整形）。
 * 重要: layer2 の実 youtube_id をここから出さない。
 */
export function maskVideoForLayer1(v) {
  return v.protection === 'layer2'
    ? { ...v, youtube_id: null, locked: true }
    : { ...v, locked: false }
}
