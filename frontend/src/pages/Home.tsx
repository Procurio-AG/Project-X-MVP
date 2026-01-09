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



      {/* ========== 3. ENGAGEMENT FEED SECTION ========== */}
      <section className="py-16 bg-background">
        <div className="container-content">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-bold text-foreground">
              Cricket Buzz
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[4fr_3fr] gap-8">
            {/* Left 50% - Pinterest-style Tweet Mosaic */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                Latest from X (Twitter)
              </h3>

              {engagementLoading ? (
                <LoadingState message="Loading tweets..." />
              ) : engagementError ? (
                <ErrorState message="Unable to load tweets" />
              ) : twitterPosts.length === 0 ? (
                <EmptyState
                  title="No tweets available"
                  message="Check back later for cricket buzz."
                />
              ) : (
                <div className="columns-1 sm:columns-2 gap-4">
                  {twitterPosts.slice(0, 4).map((post) => (
                    <div
                      key={post.id}
                      className="mb-4 break-inside-avoid rounded-2xl overflow-hidden
                  transform transition-all duration-300
                  hover:-translate-y-1 hover:shadow-xl"
                    >
                      <TweetCard post={post} />
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* Right 50% - YouTube Video */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                Featured Video
              </h3>

              {!featuredYouTubeVideo ? (
                <EmptyState
                  title="No video available"
                  message="Check back later for highlights."
                />
              ) : (
                <YouTubeEmbedCard post={featuredYouTubeVideo} />
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