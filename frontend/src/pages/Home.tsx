import { Helmet } from "react-helmet-async";
import { useLiveMatches, useSchedules, useNews, useDiscussions } from "@/hooks/use-cricket-data";
import LiveMatchCard from "@/components/LiveMatchCard";
import MatchCard from "@/components/MatchCard";
import NewsCard from "@/components/NewsCard";
import DiscussionCard from "@/components/DiscussionCard";
import WaitlistCard from "@/components/WaitlistCard";
import AboutUsCard from "@/components/AboutUsCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { Link } from "react-router-dom";
import { Radio, Newspaper, MessageCircle, Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * Standardized helper to determine if a match is live based on its status.
 */
function isMatchLive(status: string): boolean {
  const s = status?.toLowerCase() ?? "";
  return s !== "ns" && s !== "upcoming" && s !== "finished";
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: liveMatches, isLoading: liveLoading, error: liveError } = useLiveMatches();
  const { data: schedules, isLoading: schedulesLoading, error: schedulesError } = useSchedules();
  const { data: news, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useNews();
  const { data: discussions, isLoading: discussionsLoading, error: discussionsError, refetch: refetchDiscussions } = useDiscussions();

  // Get matches for ticker (today and tomorrow in IST)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today in local time

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3); // Extended to capture matches within next 2 days considering timezone differences

  const tickerMatches = [
    ...(liveMatches || []),
    ...(schedules || [])
  ].filter(match => {
    if (!match.start_time) return false;
    const matchDate = new Date(match.start_time);
    // Show matches from yesterday to day after tomorrow to account for timezone differences
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return matchDate >= yesterday && matchDate <= dayAfterTomorrow;
  }).slice(0, 8);

  // Get live matches for featured section
  const featuredLiveMatches = liveMatches?.filter(m => isMatchLive(m.status)) || [];

  // Get upcoming matches for featured section if not enough live matches
  const upcomingForFeatured = schedules?.filter(m => {
    const s = m.status?.toLowerCase();
    return s === "ns" || s === "upcoming";
  }).slice(0, 3 - featuredLiveMatches.length) || [];

  const featuredMatches = [...featuredLiveMatches, ...upcomingForFeatured].slice(0, 3);

  return (
    <>
      <Helmet>
        <title>STRYKER - Your Cricket Command Center</title>
        <meta name="description" content="Live cricket scores, expert analysis, and intelligent discussions for serious cricket fans." />
      </Helmet>

      {/* Match Ticker - Full Width */}
      <div className="bg-card border-b border-border overflow-hidden">
        <div className="flex gap-4 py-3 px-4 animate-scroll">
          {tickerMatches.map((match, idx) => {
            const matchId = match.match_id ?? match.id;
            const status = match.status?.toLowerCase() ?? "";
            const isLive = isMatchLive(match.status);
            const isFinished = status === "finished";
            
            // Check if it's a live match object (has batting_team/bowling_team)
            const hasLiveData = "batting_team" in match || match.score;
            
            return (
              <Link
                key={`ticker-${matchId}-${idx}`}
                to={
                  isLive 
                    ? `/match/${matchId}` 
                    : isFinished
                    ? `/match/${matchId}/result` 
                    : `/match/${matchId}/schedule`
                }
                className="flex-shrink-0 px-4 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors min-w-[340px]"
              >
                {/* Header with format and status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">
                    {match.format ?? match.match_type ?? "Cricket"}
                  </span>
                  {isLive && (
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
                      </span>
                      <span className="text-[10px] font-bold text-live uppercase">{match.status}</span>
                    </div>
                  )}
                  {isFinished && (
                    <span className="text-[10px] font-medium text-accent uppercase">Finished</span>
                  )}
                  {!isLive && !isFinished && (
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{match.status}</span>
                  )}
                </div>

                {/* League name */}
                <p className="text-[10px] text-muted-foreground mb-2 truncate">
                  {match.league?.name ?? "Tournament"}
                </p>
                
                {/* Teams with scores - Live Match */}
                {hasLiveData && match.score ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate mr-2">
                        {match.batting_team?.name || "Batting Team"}
                      </span>
                      <span className="text-sm font-bold text-foreground whitespace-nowrap">
                        {match.score.runs}/{match.score.wickets}
                      </span>
                    </div>
                    <div className="flex items-center justify-between opacity-70">
                      <span className="text-xs text-muted-foreground truncate mr-2">
                        {match.bowling_team?.name || "Bowling Team"}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        ({match.score.overs} ov)
                      </span>
                    </div>
                  </div>
                ) : match.innings && match.innings.length > 0 ? (
                  // Scheduled/Finished Match with innings data
                  <div className="space-y-1.5">
                    {match.innings.slice(0, 2).map((inning: any, i: number) => {
                      const team = inning.team?.id === match.home_team?.id 
                        ? match.home_team 
                        : match.away_team;
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground truncate mr-2">
                            {team?.name || `Team ${i + 1}`}
                          </span>
                          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                            {inning.runs}/{inning.wickets}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Upcoming match without scores
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground truncate">
                      {match.home_team?.name || "Team 1"}
                    </div>
                    <div className="text-xs text-muted-foreground">vs</div>
                    <div className="text-sm font-medium text-foreground truncate">
                      {match.away_team?.name || "Team 2"}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>



      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-32 overflow-hidden">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
        
        <div className="container-content relative z-10">
          <div className="max-w-4xl">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              STRYKER
            </h1>
            <p className="text-primary-foreground/90 text-xl md:text-2xl leading-relaxed">
              Your Cricket Command Center. Live scores, expert analysis, and intelligent discussions — clarity over noise.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <div className="container-content py-12">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Left Column - 70% */}
          <div className="lg:col-span-7 space-y-12">
            {/* Featured Matches Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Radio className="h-6 w-6 text-live" />
                <h2 className="font-display text-2xl font-bold text-foreground">Featured Matches</h2>
              </div>
              
              {liveLoading || schedulesLoading ? (
                <LoadingState message="Loading matches..." />
              ) : liveError || schedulesError ? (
                <ErrorState onRetry={() => window.location.reload()} />
              ) : featuredMatches.length === 0 ? (
                <EmptyState title="No matches available" message="Check back later for live matches." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredMatches.map((match) => {
                    const isLive = isMatchLive(match.status);
                    const matchId = match.match_id ?? match.id;
                    
                    return isLive ? (
                      <LiveMatchCard key={`featured-live-${matchId}`} match={match} />
                    ) : (
                      <MatchCard key={`featured-${matchId}`} match={match} variant="compact" />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Fan Discussions Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="h-6 w-6 text-accent" />
                <h2 className="font-display text-2xl font-bold text-foreground">Fan Discussions</h2>
              </div>
              
              {discussionsLoading ? (
                <LoadingState message="Loading discussions..." />
              ) : discussionsError ? (
                <ErrorState onRetry={() => refetchDiscussions()} />
              ) : !discussions || discussions.length === 0 ? (
                <EmptyState title="No discussions yet" message="Be the first to start a conversation." />
              ) : (
                <div className="space-y-4">
                  {discussions.slice(0, 5).map(post => (
                    <DiscussionCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - 30% (News Sidebar) */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-20">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Newspaper className="h-6 w-6 text-accent" />
                  <h2 className="font-display text-xl font-bold text-foreground">Top Stories</h2>
                </div>
                
                {newsLoading ? (
                  <LoadingState message="Loading news..." />
                ) : newsError ? (
                  <ErrorState onRetry={() => refetchNews()} />
                ) : !news || news.length === 0 ? (
                  <EmptyState title="No news available" message="Check back later for updates." />
                ) : (
                  <div className="space-y-4">
                    {news.slice(0, 6).map(item => (
                      <NewsCard key={item.id} news={item} variant="compact" />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </aside>
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
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}