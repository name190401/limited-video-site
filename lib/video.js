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
