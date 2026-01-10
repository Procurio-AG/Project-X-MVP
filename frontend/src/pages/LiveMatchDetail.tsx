import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  useMatchDetail,
  useCommentary,
  useDiscussions,
  useLiveScores,
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

const FALLBACK_STADIUM_IMAGE =
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&q=80";

type TabType = "commentary" | "scorecard" | "discussion";

export default function LiveMatchDetail() {
  const { matchId } = useParams<{ matchId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("commentary");

  const matchIdNum = matchId ? parseInt(matchId, 10) : undefined;

  const { data: match, isLoading, error, refetch } =
    useMatchDetail(matchIdNum);

  const { data: liveScores } = useLiveScores();

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

  /* ---------------- DATA DERIVATION (UNCHANGED) ---------------- */

  const scorecard = match.scorecard ?? [];
  const richInning = scorecard[scorecard.length - 1];

  const battingTeamId = richInning?.team_id;
  const battingTeamName = richInning?.team_name ?? "—";

  const opponentInning = scorecard.find(
    inning => inning.team_id !== battingTeamId
  );

  const liveScoreMatch = liveScores?.find(
    (m: any) => String(m.match_id) === String(matchIdNum)
  );

  let opponentTeamName = "—";

  if (liveScoreMatch?.teams && battingTeamId) {
    const { batting_first, batting_second } = liveScoreMatch.teams;
    opponentTeamName =
      batting_first.id === battingTeamId
        ? batting_second.name
        : batting_first.name;
  } else if (opponentInning?.team_name) {
    opponentTeamName = opponentInning.team_name;
  }

  const toss = match.toss ?? null;
  const venue = match.venue;

  const stadiumImage =
    venue?.image_path?.includes("/images/")
      ? venue.image_path
      : FALLBACK_STADIUM_IMAGE;

  const pageTitle = `${battingTeamName} | STRYKER`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      {/* ================= BACKGROUND HERO ================= */}
      <div className="relative min-h-screen bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 h-[900px] z-0">
          <img
            src={stadiumImage}
            className="w-full h-full object-cover opacity-80"
            alt=""
          />
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-100" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-16 pb-24">

          {/* Back */}
          <Link
            to="/live"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Live Scores
          </Link>

          {/* ================= HERO SCOREBOARD (FIXED OVERLAP) ================= */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16 mb-12 pb-12 border-b border-slate-200/40">

            <HeroTeam
              name={battingTeamName}
              score={richInning?.score}
              overs={richInning?.overs}
            />

            {/* CENTRAL COLUMN - NO LONGER ABSOLUTE */}
            <div className="flex flex-col items-center justify-center py-4 min-w-[180px]">
              {/* Pulsating Live Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">LIVE</span>
              </div>

              {/* Large VS */}
              <div className="text-6xl font-black text-slate-900/10 uppercase tracking-tighter leading-none">
                VS
              </div>

              {/* Status/Innings */}
              <div className="mt-2 px-3 py-1 rounded-md bg-slate-200/50 text-[10px] font-black uppercase tracking-widest text-slate-600">
                {match.status}
              </div>

              {/* Result/Target - Large Red Text */}
              {liveScoreMatch?.result && (
                <div className="mt-8 text-center">
                  <p className="text-xl font-black text-red-600 uppercase tracking-tight leading-tight max-w-[200px]">
                    {liveScoreMatch.result}
                  </p>
                </div>
              )}

              {/* Venue Info */}
              <div className="mt-8 flex flex-col items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4" />
                <p className="text-[12px] font-extrabold uppercase tracking-widest text-center">
                  {venue?.name}
                  <span className="block text-[11px] opacity-70 font-semibold tracking-wide">{venue?.city}</span>
                </p>
              </div>
            </div>

            <HeroTeam
              name={opponentTeamName}
              score={opponentInning?.score}
              overs={opponentInning?.overs}
              muted={!opponentInning}
            />
          </div>

          {/* ================= META ================= */}
          <div className="flex flex-col items-center gap-3 mt-6 mb-12">
            <span className="flex items-center gap-2 text-xs font-bold uppercase">
              <Clock className="h-4 w-4" />
              Updated {formatMatchTime(match.updated_at)}
            </span>

            <p className="text-sm italic font-medium">
              Toss:{" "}
              {toss?.won_by_team_id ? (
                <>
                  {toss.won_by_team_id === battingTeamId
                    ? battingTeamName
                    : opponentTeamName}{" "}
                  won and elected to {toss.elected}
                </>
              ) : (
                "--"
              )}
            </p>

            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-black">
                <Bookmark className="h-4 w-4" /> Follow
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-black">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>

          {/* ================= TABS ================= */}
          <div className="mb-10 border-b flex gap-8">
            {(["commentary", "scorecard", "discussion"] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-xs font-black uppercase tracking-widest",
                  activeTab === tab
                    ? "text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-400"
                )}
              >
                {tab}
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
      </div>
    </>
  );
}

/* ================= SUB COMPONENTS ================= */

function HeroTeam({
  name,
  score,
  overs,
  muted,
}: {
  name: string;
  score?: string;
  overs?: string;
  muted?: boolean;
}) {
  const [runs, wickets] = score?.split("/") ?? ["—", "—"];

  return (
    <div className={cn("flex flex-col items-center flex-1 min-w-[200px]", muted && "opacity-60")}>
      <span className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-slate-800 text-center">
        {name}
      </span>
      {/* Increased padding and larger font scale */}
      <div className="flex items-baseline gap-2 px-12 py-10 rounded-[40px] bg-white border border-slate-200 shadow-2xl shadow-slate-300/30">
        <span className="text-8xl font-black tracking-tighter text-slate-900 leading-none">{runs}</span>
        <span className="text-3xl font-bold text-slate-400">/{wickets}</span>
      </div>
      {overs && (
        <div className="mt-5 px-5 py-2 bg-slate-900/10 rounded-full border border-slate-900/15">
          <span className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-slate-700">
            {overs} overs
          </span>
        </div>
      )}
    </div>
  );
}

/* ================= SCORECARD (REMAINS UNCHANGED PER REQUEST) ================= */

function ScorecardTab({ scorecard }: { scorecard: any }) {
  if (!scorecard?.batting)
    return <p className="text-center py-12 opacity-60">Detailed scorecard pending…</p>;

  return (
    <div className="space-y-10">
      <div className="bg-white border-2 rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 py-4 border-b font-black uppercase text-xs">
          {scorecard.team_name} Batting
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-xs uppercase font-black">
            <tr>
              <th className="px-6 py-3 text-left">Batter</th>
              <th className="px-4 py-3 text-center">R</th>
              <th className="px-4 py-3 text-center">B</th>
              <th className="px-4 py-3 text-center">4s</th>
              <th className="px-4 py-3 text-center">6s</th>
              <th className="px-4 py-3 text-center">SR</th>
            </tr>
          </thead>
          <tbody>
            {scorecard.batting.map((p: any) => (
              <tr key={p.player.id} className="border-t">
                <td className="px-6 py-3 flex items-center gap-3">
                  <img src={p.player.image} className="w-8 h-8 rounded-full" alt="" />
                  <div>
                    <p className="font-bold text-left">{p.player.name}</p>
                    <p className="text-xs text-slate-500 text-left">{p.status}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold">{p.runs}</td>
                <td className="px-4 py-3 text-center">{p.balls}</td>
                <td className="px-4 py-3 text-center">{p.fours}</td>
                <td className="px-4 py-3 text-center">{p.sixes}</td>
                <td className="px-4 py-3 text-center">{p.strike_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border-2 rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 py-4 border-b font-black uppercase text-xs">
          Bowling Performance
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-xs uppercase font-black">
            <tr>
              <th className="px-6 py-3 text-left">Bowler</th>
              <th className="px-4 py-3 text-center">O</th>
              <th className="px-4 py-3 text-center">R</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">ECON</th>
            </tr>
          </thead>
          <tbody>
            {scorecard.bowling?.map((b: any) => (
              <tr key={b.player.id} className="border-t">
                <td className="px-6 py-3 flex items-center gap-3">
                  <img src={b.player.image} className="w-8 h-8 rounded-full" alt="" />
                  <span className="font-bold text-left">{b.player.name}</span>
                </td>
                <td className="px-4 py-3 text-center">{b.overs}</td>
                <td className="px-4 py-3 text-center">{b.runs_conceded}</td>
                <td className="px-4 py-3 text-center font-black">{b.wickets}</td>
                <td className="px-4 py-3 text-center">{b.economy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CommentaryTab({ commentary }: { commentary: CommentaryBall[] }) {
  if (!commentary.length)
    return <p className="text-center py-12 opacity-60">Commentary coming soon.</p>;

  return (
    <div className="space-y-3">
      {commentary.map(ball => (
        <div key={ball.id} className="flex gap-4">
          <span className="text-xs font-black text-slate-500">{ball.over}</span>
          <p className="text-sm font-semibold">{ball.description}</p>
        </div>
      ))}
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