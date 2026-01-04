import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  useMatchDetail,
  useCommentary,
  useDiscussions,
  useLiveMatches
} from "@/hooks/use-cricket-data";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import DiscussionCard from "@/components/DiscussionCard";
import { cn, formatMatchTime } from "@/lib/utils";
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Share2,
  Bookmark,
} from "lucide-react";
import type { CommentaryBall, DiscussionPost } from "@/lib/types";

type TabType = "commentary" | "scorecard" | "discussion";

export default function LiveMatchDetail() {
  const { matchId } = useParams<{ matchId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("commentary");

  const matchIdNum = matchId ? parseInt(matchId, 10) : undefined;

  const { data: match, isLoading, error, refetch } =
    useMatchDetail(matchIdNum);

  const { data: liveMatches } = useLiveMatches();


  const { data: commentary } = useCommentary(
    activeTab === "commentary" ? matchIdNum : undefined
  );

  const { data: discussions } = useDiscussions(
    activeTab === "discussion" ? matchIdNum : undefined
  );

  if (isLoading && !match) {
    return <LoadingState message="Connecting to live feed..." />;
  }

  if (error || !match) {
    return (
      <div className="container-content py-20">
        <ErrorState message="Match details unavailable." onRetry={refetch} />
      </div>
    );
  }

  /* ---------------- DATA DERIVATION ---------------- */

  const scorecard = match.scorecard ?? [];
  const richInning = scorecard[scorecard.length - 1];

  let battingTeamName = richInning?.team_name;
  let opponentTeamName = "Opponent";

  const battingTeamId = richInning?.team_id;

  // 🔑 Pull matching live match (from /live endpoint)
  const liveMatch = liveMatches?.find(
    (m: any) => (m.match_id ?? m.id) === matchIdNum
  );

  /**
   * CASE 1: Both teams have batted
   * → scorecard is source of truth
   */
  if (scorecard.length > 1 && battingTeamId) {
    const opponentInning = scorecard.find(
      inning => inning.team_id !== battingTeamId
    );

    if (opponentInning?.team_name) {
      opponentTeamName = opponentInning.team_name;
    }
  }

  /**
   * CASE 2: Only one innings (live / innings break)
   * → use /live batting_team & bowling_team (same as LiveMatchCard)
   */
  else if (
    liveMatch?.batting_team &&
    liveMatch?.bowling_team &&
    battingTeamId
  ) {
    const battingTeam =
      battingTeamId === liveMatch.batting_team.id
        ? liveMatch.batting_team
        : liveMatch.bowling_team;

    const bowlingTeam =
      battingTeam.id === liveMatch.batting_team.id
        ? liveMatch.bowling_team
        : liveMatch.batting_team;

    battingTeamName = battingTeam?.name ?? battingTeamName;
    opponentTeamName = bowlingTeam?.name ?? opponentTeamName;
  }

  const opponentInning = scorecard.find(
    inning => inning.team_id !== battingTeamId
  );

  const venue = match.venue;
  const toss = match.toss;

  const pageTitle = `${battingTeamName ?? "Match"} | STRYKER`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      {/* Header */}
      <section className="bg-primary text-primary-foreground py-8">
        <div className="container-content">
          <Link
            to="/live"
            className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Live Scores
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Batting Team */}
            <div>
              <h1 className="text-3xl font-bold">{battingTeamName}</h1>
              <p className="text-4xl font-bold">
                {richInning?.score}
                <span className="text-xl font-normal ml-2 opacity-80">
                  ({richInning?.overs} ov)
                </span>
              </p>
            </div>

            {/* Center */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-live flex items-center justify-center font-bold animate-pulse mb-2">
                LIVE
              </div>
              <span className="text-xs font-bold uppercase mb-2">
                {match.status}
              </span>
              <p className="text-sm font-semibold flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {venue?.name}
              </p>
              <p className="text-[10px] opacity-70 uppercase">
                {venue?.city}
              </p>
            </div>

            {/* Opponent */}
            <div className="text-right">
              <h2 className="text-3xl font-bold">{opponentTeamName}</h2>
              {opponentInning ? (
                <p className="text-4xl font-bold">
                  {opponentInning.score}
                  <span className="text-xl font-normal ml-2 opacity-80">
                    ({opponentInning.overs} ov)
                  </span>
                </p>
              ) : (
                <p className="text-lg opacity-50">Yet to Bat</p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="mt-8 flex flex-col items-center gap-4 border-t pt-6">
            <span className="flex items-center gap-2 text-sm opacity-80">
              <Clock className="h-4 w-4" />
              Updated: {formatMatchTime(match.updated_at)}
            </span>

            {toss && (
              <p className="text-sm italic opacity-90">
                Toss:{" "}
                {toss.won_by_team_id === battingTeamId
                  ? battingTeamName
                  : opponentTeamName}{" "}
                won and elected to {toss.elected}
              </p>
            )}

            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-md">
                <Bookmark className="h-4 w-4" /> Follow
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-md">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="container-content py-8">
        <div className="flex gap-8 mb-8 border-b">
          {(["commentary", "scorecard", "discussion"] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-sm font-semibold",
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "commentary" && (
          <CommentaryTab commentary={commentary || []} />
        )}
        {activeTab === "scorecard" && (
          <ScorecardTab scorecard={richInning} />
        )}
        {activeTab === "discussion" && (
          <DiscussionTab discussions={discussions || []} />
        )}
      </div>
    </>
  );
}

/* ---------------- Sub Components ---------------- */

function CommentaryTab({ commentary }: { commentary: CommentaryBall[] }) {
  if (!commentary.length)
    return <p className="text-center py-12 opacity-60">Commentary coming soon.</p>;

  return (
    <div className="space-y-4">
      {commentary.map(ball => (
        <div key={ball.id} className="p-4 bg-card border rounded-lg">
          <span className="font-bold">{ball.over}</span>
          <p>{ball.description}</p>
        </div>
      ))}
    </div>
  );
}

function ScorecardTab({ scorecard }: { scorecard: any }) {
  if (!scorecard?.batting) return <p className="text-center py-12 text-muted-foreground">Detailed scorecard pending...</p>;

  return (
    <div className="space-y-8">
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 px-6 py-3 border-b">
          <h3 className="font-bold">{scorecard.team_name} Batting</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-muted-foreground border-b bg-muted/20">
            <tr>
              <th className="px-6 py-3 font-medium">Batter</th>
              <th className="py-3 font-medium">R</th>
              <th className="py-3 font-medium">B</th>
              <th className="py-3 font-medium">4s</th>
              <th className="py-3 font-medium">6s</th>
              <th className="py-3 font-medium">SR</th>
            </tr>
          </thead>
          <tbody>
            {scorecard.batting.map((player: any) => (
              <tr key={player.player.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={player.player.image} className="w-8 h-8 rounded-full bg-muted shadow-inner" alt="" />
                  <div>
                    <p className="font-semibold">{player.player.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{player.status}</p>
                  </div>
                </td>
                <td className="font-bold">{player.runs}</td>
                <td className="text-muted-foreground">{player.balls}</td>
                <td>{player.fours}</td>
                <td>{player.sixes}</td>
                <td className="text-muted-foreground">{player.strike_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 px-6 py-3 border-b text-foreground">
          <h3 className="font-bold">Bowling Performance</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-muted-foreground border-b bg-muted/20">
            <tr>
              <th className="px-6 py-3 font-medium">Bowler</th>
              <th className="py-3 font-medium">O</th>
              <th className="py-3 font-medium">R</th>
              <th className="py-3 font-medium">W</th>
              <th className="py-3 font-medium">ECON</th>
            </tr>
          </thead>
          <tbody>
            {scorecard.bowling?.map((bowler: any) => (
              <tr key={bowler.player.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={bowler.player.image} className="w-8 h-8 rounded-full bg-muted shadow-inner" alt="" />
                  <span className="font-semibold">{bowler.player.name}</span>
                </td>
                <td>{bowler.overs}</td>
                <td>{bowler.runs_conceded}</td>
                <td className="font-bold text-accent">{bowler.wickets}</td>
                <td className="text-muted-foreground">{bowler.economy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DiscussionTab({ discussions }: { discussions: DiscussionPost[] }) {
  if (!discussions.length)
    return <p className="text-center py-12 opacity-60">No discussions yet.</p>;

  return (
    <div className="space-y-4">
      {discussions.map(post => (
        <DiscussionCard key={post.id} post={post} />
      ))}
    </div>
  );
}
