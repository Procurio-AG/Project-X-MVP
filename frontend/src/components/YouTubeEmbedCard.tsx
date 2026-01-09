import { Eye, ExternalLink } from "lucide-react";
import type { EngagementPost } from "@/hooks/use-cricket-data";

interface YouTubeEmbedCardProps {
  post: EngagementPost;
  minimal?: boolean; // Add this prop for the hero view
}

export default function YouTubeEmbedCard({ post, minimal = false }: YouTubeEmbedCardProps) {
  const embedUrl = post.media?.find(m => m.type === "embed")?.url;

  if (minimal) {
    return (
      <div className="w-full h-full relative">
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

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden sticky top-24">
      {/* Video Embed */}
      {embedUrl && (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={post.title || "YouTube video"}
          />
        </div>
      )}

      {/* Video Info */}
      <div className="p-4">
        {post.title && (
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
            {post.title}
          </h3>
        )}

        {post.text && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {post.text}
          </p>
        )}

        {/* Channel Info */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <span className="font-medium text-foreground">
            {post.author.name}
          </span>
        </div>

        {/* Metrics + Link */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {post.metrics.views != null && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(post.metrics.views)} views</span>
            </div>
          )}

          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors text-sm"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
