// frontend/src/pages/Home.tsx

import { Helmet } from "react-helmet-async";
import { useLiveScores, useNews, useDiscussions } from "@/hooks/use-cricket-data";
import FeaturedMatchCard from "@/components/FeaturedMatchCard";
import NewsCard from "@/components/NewsCard";
import DiscussionCard from "@/components/DiscussionCard";
import WaitlistCard from "@/components/WaitlistCard";
import AboutUsCard from "@/components/AboutUsCard";
import TickerCard from "@/components/TickerCard";

import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { Link } from "react-router-dom";
import { Radio, Newspaper, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import type { LiveScoreMatch } from "@/lib/types";
import { cn , getTeamLogoUrl , formatMatchTime } from "@/lib/utils";

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Single source of truth - /api/v1/matches/livescore
  const { 
    data: liveScoresData = [], 
    isLoading: scoresLoading, 
    error: scoresError,
    refetch: refetchScores 
  } = useLiveScores({ refetchInterval: 30000 });
  
  const { data: news, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useNews();
  const { data: discussions, isLoading: discussionsLoading, error: discussionsError, refetch: refetchDiscussions } = useDiscussions();

  // All matches from livescore endpoint (already filtered to -24h to +48h by backend)
const tickerMatches = useMemo(() => {
  return Array.isArray(liveScoresData) ? liveScoresData : [];
}, [liveScoresData]);

// Featured matches: LIVE first, then NS to fill up to 3
const featuredMatches = useMemo(() => {
  if (!Array.isArray(liveScoresData)) return [];
  
  const liveMatches = liveScoresData.filter((m: LiveScoreMatch) => m.match_status === 'LIVE');
  const upcomingMatches = liveScoresData.filter((m: LiveScoreMatch) => m.match_status === 'NS');
  
  const featured = [...liveMatches];
  const remaining = 3 - featured.length;
  
  if (remaining > 0) {
    featured.push(...upcomingMatches.slice(0, remaining));
  }
  
  return featured.slice(0, 3);
}, [liveScoresData]);

// Manual scroll functions
const scrollLeft = () => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  }
};

const scrollRight = () => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
  }
};

return (
  <>
    <Helmet>
      <title>STRYKER - Your Cricket Command Center</title>
      <meta
        name="description"
        content="Live cricket scores, expert analysis, and intelligent discussions for serious cricket fans."
      />
    </Helmet>

    {/* Match Ticker */}
    <div className="relative py-6">
      {tickerMatches.length > 4 && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          "flex gap-4 px-8 overflow-x-auto scrollbar-hide scroll-smooth",
          tickerMatches.length <= 4 && "justify-center"
        )}
      >
        {tickerMatches.map((match, idx) => (
          <TickerCard
            key={`${match.match_id}-${idx}`}
            match={match}
            getTeamLogoUrl={getTeamLogoUrl}
            formatMatchTime={formatMatchTime}
          />
        ))}
      </div>

      {tickerMatches.length > 4 && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>

      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[640px] w-full overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=2000')",
          }}
        />

        {/* Blur layer */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container-content">
            <div className="max-w-4xl">
              <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                STRYKER
              </h1>
              <p className="text-white/90 text-xl md:text-2xl leading-relaxed">
                Your Cricket Command Center. Live scores, expert analysis, and intelligent
                discussions — clarity over noise.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Main Content - Two Column Layout */}
      <div className="relative -mt-24">
        <div className="container-content py-12">
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl shadow-sm border border-border/60 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
              {/* Left Column - 70% */}
              <div className="lg:col-span-7 space-y-12">
                {/* Featured Matches Section */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Radio className="h-6 w-6 text-live" />
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Featured Matches
                    </h2>
                  </div>

                  {scoresLoading ? (
                    <LoadingState message="Loading matches..." />
                  ) : scoresError ? (
                    <ErrorState
                      message="Unable to load matches"
                      onRetry={() => refetchScores()}
                    />
                  ) : featuredMatches.length === 0 ? (
                    <EmptyState
                      title="No matches available"
                      message="Check back later for live matches."
                    />
                  ) : (
                    <div className="space-y-4">
                      {featuredMatches.map((match: LiveScoreMatch) => (
                        <FeaturedMatchCard
                          key={`featured-${match.match_id}`}
                          match={match}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Fan Discussions Section */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <MessageCircle className="h-6 w-6 text-accent" />
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Fan Discussions
                    </h2>
                  </div>

                  {discussionsLoading ? (
                    <LoadingState message="Loading discussions..." />
                  ) : discussionsError ? (
                    <ErrorState onRetry={() => refetchDiscussions()} />
                  ) : !discussions || discussions.length === 0 ? (
                    <EmptyState
                      title="No discussions yet"
                      message="Be the first to start a conversation."
                    />
                  ) : (
                    <div className="space-y-4">
                      {discussions.slice(0, 5).map((post) => (
                        <DiscussionCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Right Column - 30% (News Sidebar) */}
              <aside className="lg:col-span-3">
                <div className="lg:sticky lg:top-24">
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <Newspaper className="h-6 w-6 text-accent" />
                      <h2 className="font-display text-xl font-bold text-foreground">
                        Top Stories
                      </h2>
                    </div>

                    {newsLoading ? (
                      <LoadingState message="Loading news..." />
                    ) : newsError ? (
                      <ErrorState onRetry={() => refetchNews()} />
                    ) : !news || news.length === 0 ? (
                      <EmptyState
                        title="No news available"
                        message="Check back later for updates."
                      />
                    ) : (
                      <div className="space-y-4">
                        {news.slice(0, 6).map((item) => (
                          <NewsCard
                            key={item.id}
                            news={item}
                            variant="compact"
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>


      {/* Waitlist Section */}
      <section id="waitlist" className="bg-muted py-16">
        <div className="container-content">
          <WaitlistCard />
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16">
        <div className="container-content">
          <AboutUsCard />
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}