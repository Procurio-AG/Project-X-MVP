// frontend/src/components/YouTubeEmbedCard.tsx
import { Eye, ExternalLink } from "lucide-react";
import type { EngagementPost } from "@/hooks/use-cricket-data";

interface YouTubeEmbedCardProps {
  post: EngagementPost;
  minimal?: boolean; 
}

export default function YouTubeEmbedCard({ post, minimal = false }: YouTubeEmbedCardProps) {
  const embedUrl = post.media?.find(m => m.type === "embed")?.url;

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  // Minimal view for hero/broad tiles
  if (minimal) {
    return (
      <div className="w-full h-full relative aspect-video bg-black">
        {embedUrl && (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card border border-border rounded-lg overflow-hidden transition-all duration-300">
      {/* Video Embed */}
      {embedUrl && (
        <div className="relative w-full aspect-video flex-shrink-0">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={post.title || "YouTube video"}
          />
        </div>
      )}

      {/* Video Info - Tighter padding and smaller typography */}
      <div className="p-3 space-y-2">
        {post.title && (
          <h4 className="font-bold text-sm leading-snug text-foreground line-clamp-2">
            {post.title}
          </h4>
        )}

        {post.text && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {post.text}
          </p>
        )}

        {/* Footer info: Source + Metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {post.author.name}
            </span>
            {post.metrics.views != null && (
              <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                <Eye className="h-3 w-3" />
                <span>{formatNumber(post.metrics.views)} views</span>
              </div>
            )}
          </div>

          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-slate-50 rounded-full transition-colors text-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}