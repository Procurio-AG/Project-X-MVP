// frontend/src/pages/Home.tsx

import { Helmet } from "react-helmet-async";
import {
  useLiveScores,
  useNews,
  useDiscussions,
  useInfiniteEngagementFeed,
} from "@/hooks/use-cricket-data";

import FeaturedMatchCard from "@/components/FeaturedMatchCard";
import NewsCard from "@/components/NewsCard";
import TweetCard from "@/components/TweetCard";
import YouTubeEmbedCard from "@/components/YouTubeEmbedCard";
import DiscussionsTicker from "@/components/DiscussionsTicker";
import WaitlistCard from "@/components/WaitlistCard";
import AboutUsCard from "@/components/AboutUsCard";
import TickerCard from "@/components/TickerCard";

import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { Radio, Newspaper, Sparkles, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useMemo } from "react";
import type { LiveScoreMatch } from "@/lib/types";
import { cn, getTeamLogoUrl, formatMatchTime } from "@/lib/utils";

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    data: liveScoresData = [], 
    isLoading: scoresLoading, 
    error: scoresError,
    refetch: refetchScores 
  } = useLiveScores({ refetchInterval: 30000 });
  
  const { data: news, isLoading: newsLoading, error: newsError } = useNews();
  const { data: discussions } = useDiscussions();
  
  // Engagement feed - Twitter posts only
  const {
    data: twitterPages,
    isLoading: engagementLoading,
    error: engagementError,
  } = useInfiniteEngagementFeed({
    source: "twitter",
    limit: 20,
  });

  const twitterPosts = useMemo(
  () => twitterPages?.pages.flatMap(page => page.data) ?? [],
  [twitterPages]
  );

  console.log("Twitter Pages:", twitterPages);
  console.log("Twitter Posts:", twitterPosts);
  console.log("Engagement Loading:", engagementLoading);
  console.log("Engagement Error:", engagementError);

  // YouTube
  const {
    data: youtubePages,
  } = useInfiniteEngagementFeed({
    source: "youtube",
    limit: 5,
  });

  const featuredYouTubeVideo = useMemo(
    () => youtubePages?.pages[0]?.data[0],
    [youtubePages]
  );

  const tickerMatches = useMemo(() => {
    return Array.isArray(liveScoresData) ? liveScoresData : [];
  }, [liveScoresData]);

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


  const discussionsList = useMemo(() => {
    if (!discussions || discussions.length === 0) return [];

    return discussions.slice(0, 10).map((d: any) => ({
      id: d.id,
      title: d.title || "Untitled Discussion",
      preview: d.content || "No preview available",

      // ✅ FIX: ensure author is a string
      author:
        typeof d.author === "string"
          ? d.author
          : d.author?.name ?? "Anonymous",

      replies: d.replies || 0,
      timestamp: d.timestamp || new Date().toISOString(),
    }));
  }, [discussions]);

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

      {/* ========== 1. HERO SECTION (UNCHANGED) ========== */}
      <section className="relative h-[100vh] min-h-[700px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=2000&q=80"
            alt="Cricket stadium"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/50 to-background/95" />

        {tickerMatches.length > 0 && (
          <div className="absolute top-20 left-0 right-0 z-30 py-6">
            <div className="container-content">
              <div className="relative">
                {tickerMatches.length > 3 && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full p-2 shadow-lg hover:bg-white transition-all hidden lg:block"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                <div
                  ref={scrollContainerRef}
                  className={cn(
                    "flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth",
                    tickerMatches.length <= 3 ? "justify-center" : "px-12"
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

                {tickerMatches.length > 3 && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full p-2 shadow-lg hover:bg-white transition-all hidden lg:block"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container-content">
            <div className="max-w-4xl mt-32">
              <h1 className="font-display text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
                STRYKER
              </h1>
              <p className="text-white/90 text-xl md:text-2xl leading-relaxed max-w-3xl">
                Your Cricket Command Center. Live scores, expert analysis, and intelligent
                discussions - clarity over noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 2. FEATURED MATCH + NEWS SECTION ========== */}
      <div className="relative bg-background">
        <div className="container-content py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
            {/* Left 50% - Featured Match Carousel */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Radio className="h-6 w-6 text-live" />
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Featured Match
                </h2>
              </div>

              {scoresLoading ? (
                <LoadingState message="Loading featured match..." />
              ) : scoresError ? (
                <ErrorState
                  message="Unable to load match"
                  onRetry={() => refetchScores()}
                />
              ) : featuredMatches.length === 0 ? (
                <EmptyState
                  title="No matches available"
                  message="Check back later for live matches."
                />
              ) : (
                <div className="space-y-4">
                  {featuredMatches.map((match) => (
                    <FeaturedMatchCard 
                      key={match.match_id} 
                      match={match} 
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Right 50% - News Panel */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Newspaper className="h-6 w-6 text-accent" />
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Top Stories
                </h2>
              </div>

              {newsLoading ? (
                <LoadingState message="Loading news..." />
              ) : newsError ? (
                <ErrorState onRetry={() => {}} />
              ) : !news || news.length === 0 ? (
                <EmptyState
                  title="No news available"
                  message="Check back later for updates."
                />
              ) : (
                <div className="space-y-4 h-[600px] overflow-y-auto pr-2">
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
        </div>
      </div>



{/* ========== 3. ENGAGEMENT FEED SECTION (STATIC 3-CARD GRID) ========== */}
<section className="py-16 bg-muted/30">
  <div className="container-content">
    {/* Section Header */}
    <div className="flex items-center gap-2 mb-8 uppercase tracking-tighter">
      <Sparkles className="h-5 w-5 text-accent" />
      <h2 className="font-display text-4xl font-black text-foreground">
        Cricket Buzz
      </h2>
    </div>

    <div className="flex flex-col gap-10">
      {/* Top Section: Hero Video */}
      <div className="relative">
        <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-[0.2em]">
          Featured Video
        </h3>
        <div className="rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-black aspect-video lg:aspect-[21/9] w-full relative">
          {!featuredYouTubeVideo ? (
            <EmptyState title="No video available" message="Check back later." />
          ) : (
            <YouTubeEmbedCard post={featuredYouTubeVideo} minimal={true} />
          )}
        </div>
      </div>

      {/* Bottom Section: Static 3-Card Grid */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground mb-6 uppercase tracking-[0.2em]">
          Latest from X (formerly Twitter)
        </h3>

        {engagementLoading ? (
          <LoadingState message="Loading tweets..." />
        ) : twitterPosts.length === 0 ? (
          <EmptyState title="No tweets available" />
        ) : (
          /* Switched from overflow-x-auto to a standard grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {twitterPosts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                className="flex h-full"
              >
                <div className="w-full bg-card rounded-2xl border border-border flex flex-col shadow-sm hover:border-accent/40 transition-all">
                  <TweetCard post={post} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
</section>


      {/* ========== 4. DISCUSSIONS TICKER ========== */}
      {/* <section className="py-16 bg-background">
        <div className="container-content">
          <div className="flex items-center gap-2 mb-8">
            <MessageCircle className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-bold text-foreground">
              Fan Discussions
            </h2>
          </div>

          {discussionsList.length === 0 ? (
            <EmptyState
              title="No discussions yet"
              message="Be the first to start a conversation."
            />
          ) : (
            <DiscussionsTicker discussions={discussionsList} />
          )}
        </div>
      </section> */}


{/* ========== 5. WAITLIST SECTION ========== */}
      <section
        id="waitlist"
        className="relative py-24 overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://resources.cricket-australia.pulselive.com/photo-resources/2023/05/04/b2526239-a7f3-402b-aaf9-41efbb3a912b/CjAWy75H.ashx?width=1900&height=1070"
            alt="Cricket stadium crowd"
            className="w-full h-full object-cover"
          />

          {/* Global dark overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Left (dark) → Right (visible) fade */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-r
              from-black/75
              via-black/15
              to-transparent
            "
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container-content">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-center">
            
            {/* Left: Waitlist Form (lighter card) */}
            <div
              className="
                bg-background/20
                backdrop-blur-xl
                border border-white/10
                rounded-2xl
                shadow-[0_30px_80px_rgba(0,0,0,0.6)]
              "
            >
              <WaitlistCard />
            </div>

            {/* Right spacer (keeps composition balanced) */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>


      {/* ========== 6. ABOUT US SECTION (UNCHANGED) ========== */}
      <section className="py-16">
        <div className="container-content">
          <AboutUsCard />
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}