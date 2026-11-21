import { useState } from "react";
import type { VideoRef } from "../../types/interactive";

function VideoCard({ video }: { video: VideoRef }) {
  const [embedded, setEmbedded] = useState(false);
  const videoId = video.youtube_id;

  return (
    <div className="video-card">
      {embedded ? (
        <div className="video-embed-box video-embed-live">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title="فيديو شرح"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="video-embed-box" onClick={() => setEmbedded(true)}>
          <img className="video-thumb" src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="صورة مصغرة لفيديو الشرح" loading="lazy" />
          <span className="video-play-badge">▶</span>
        </div>
      )}
      <div className="video-meta">
        <span className="video-source">
          {video.title_ar}
          {video.channel_ar ? ` — ${video.channel_ar}` : ""}
        </span>
        <a className="video-open-link" href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
          ↗ فتح في يوتيوب
        </a>
      </div>
      {video.note_ar ? <p className="video-note">{video.note_ar}</p> : null}
    </div>
  );
}

export interface VideoSectionProps {
  videos: readonly VideoRef[];
}

export function VideoSection({ videos }: VideoSectionProps) {
  if (!videos.length) return null;
  return (
    <div className="panel-section video-section">
      <div className="panel-section-title">🎬 فيديو شرح{videos.length > 1 ? ` (${videos.length})` : ""}</div>
      {videos.map((video, index) => (
        <VideoCard key={`${video.youtube_id}-${index}`} video={video} />
      ))}
    </div>
  );
}
