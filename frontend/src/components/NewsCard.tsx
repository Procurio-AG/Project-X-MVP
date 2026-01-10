import { formatRelativeTime } from "@/lib/utils";
import type { NewsArticle } from "@/lib/types";
import { ExternalLink, Clock, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  news: NewsArticle;
  variant?: "compact" | "default";
}

export default function NewsCard({ news }: NewsCardProps) {
  // TEMP: backend does not expose canonical article URLs yet
  const newsUrl = news.source_url ?? undefined;

  return (
    <a
      href={newsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block bg-card rounded-lg border border-border overflow-hidden",
        "hover:border-accent/50 hover:shadow-lg transition-all duration-200",
        "group"
      )}
    >
      {/* IMAGE */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        {news.image_url ? (
          <img
            src={news.image_url}
            alt={news.headline}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement?.classList.add(
                "flex",
                "items-center",
                "justify-center"
              );
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        {/* STORY TYPE BADGE */}
        {news.story_type && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold capitalize bg-black/60 text-white backdrop-blur-sm">
            {news.story_type}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
          {news.headline}
        </h3>

        {news.intro && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {news.intro}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(news.published_at)}
          </span>

          <ExternalLink className="h-3 w-3 transition-colors group-hover:text-accent" />
        </div>
      </div>
    </a>
  );
}
