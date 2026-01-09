// frontend/src/components/TweetCard.tsx

import { ExternalLink, Heart, Share2, Eye } from "lucide-react";
import type { EngagementPost } from "@/hooks/use-cricket-data";

interface TweetCardProps {
  post: EngagementPost;
}

export default function TweetCard({ post }: TweetCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
      {/* Author */}
      <div className="flex items-start gap-3 mb-3">
        {post.author.avatar && (
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground truncate">
              {post.author.name}
            </span>
            {post.author.handle && (
              <span className="text-muted-foreground text-sm truncate">
                @{post.author.handle}
              </span>
            )}
          </div>

          <span className="text-xs text-muted-foreground">
            {formatDate(post.published_at)}
          </span>
        </div>
      </div>

      {/* Text */}
      {post.text && (
        <p className="text-foreground text-sm mb-3 whitespace-pre-wrap break-words line-clamp-3 min-h-[3rem]">
          {post.text}
        </p>
      )}

      {/* Media */}
      {post.media?.length > 0 && post.media[0].type === "image" && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img
            src={post.media[0].url}
            alt="Tweet media"
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      {/* Metrics + Link */}
      <div className="flex items-center gap-4 text-muted-foreground text-sm pt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{formatNumber(post.metrics.likes)}</span>
        </div>

        <div className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          <span>{formatNumber(post.metrics.shares)}</span>
        </div>

        {post.metrics.views != null && (
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{formatNumber(post.metrics.views)}</span>
          </div>
        )}

        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-accent hover:text-accent/80 transition-colors"
        >
          <span className="text-xs">View on X</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
