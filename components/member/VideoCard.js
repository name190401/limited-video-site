import VideoPlayer from '../ui/VideoPlayer'

/**
 * 動画サムネ＋タイトルキャプションの基本カード（§9）。グリッドのセル単位で使う。
 * 呼び出し側で key を付ける。muted=true は製品ショートのミュート自動ループ。
 *
 * @param {Object}  video  { youtube_id, title }
 * @param {boolean} muted
 */
export default function VideoCard({ video, muted = false }) {
  return (
    <div>
      <VideoPlayer videoId={video.youtube_id} title={video.title} muted={muted} />
      <p className="mt-2 text-navy-900 text-[14px] font-medium">{video.title}</p>
    </div>
  )
}
