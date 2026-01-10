import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useInfiniteEngagementFeed } from "@/hooks/use-cricket-data";
import TweetCard from "@/components/TweetCard";
import YouTubeEmbedCard from "@/components/YouTubeEmbedCard";
import LoadingState from "@/components/LoadingState";
import { Sparkles, LayoutGrid, Video, MessageSquare, ArrowDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "youtube" | "twitter";

export default function Firehose() {
  const [filter, setFilter] = useState<FilterType>("all");

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch, // Use this for the manual refresh
    isFetching
  } = useInfiniteEngagementFeed({
    source: filter === "all" ? undefined : filter,
    limit: 24,
    staleTime: Infinity, // Prevents automatic background staleness
    refetchInterval: 0,  // Disables the 30s polling
  });

  const mixedPosts = useMemo(() => {
    const posts = data?.pages.flatMap((page) => page?.data ?? []) ?? [];
    if (filter !== "all") return posts;
    
    const shuffled = [...posts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [data, filter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 relative overflow-hidden">
      <Helmet>
        <title>CRICKET FIREHOSE | STRYKER</title>
      </Helmet>

      <div className="container-content pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-slate-200 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <span className="text-accent font-bold tracking-[0.4em] text-[10px] uppercase">
                Intelligence Stream
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
              Cricket <span className="text-slate-300">Firehose</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Manual Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-accent transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              {isFetching ? "Refreshing..." : "Refresh Feed"}
            </button>

            {/* Filter Bar */}
            <div className="flex bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
              {[
                { id: "all", label: "All", icon: LayoutGrid },
                { id: "youtube", label: "Videos", icon: Video },
                { id: "twitter", label: "Tweets", icon: MessageSquare },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as FilterType)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                    filter === f.id
                      ? "bg-slate-900 text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <f.icon className="h-3.5 w-3.5" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mosaic Grid */}
        {isLoading ? (
          <LoadingState message="Syncing firehose..." />
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {mixedPosts.map((post, index) => (
              <div
                key={`${post.id}-${index}`}
                className="break-inside-avoid rounded-3xl overflow-hidden border border-slate-200 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                {post.source === "youtube" ? (
                  <YouTubeEmbedCard post={post} />
                ) : (
                  <div className="p-6">
                    <TweetCard post={post} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasNextPage && (
          <div className="mt-20 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="group relative px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {isFetchingNextPage ? "Syncing..." : "Expand Intelligence"}
                <ArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}