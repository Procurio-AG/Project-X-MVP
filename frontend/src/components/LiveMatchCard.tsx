// frontend/src/components/LiveMatchCard.tsx

import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getTeamLogoUrl } from "@/lib/utils";
import type { LiveScoreMatch } from "@/lib/types";

const FALLBACK_STADIUM_IMAGE =
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&q=80";

interface LiveMatchCardProps {
  match: LiveScoreMatch & { _type: "live" };
}

export default function LiveMatchCard({ match }: LiveMatchCardProps) {
  const team1 = match.teams.batting_first;
  const team2 = match.teams.batting_second;

  const tossWinner = match.toss.won_by_team_id === team1.id ? team1 : team2;
  const tossText =
    match.toss.won_by_team_id && match.toss.elected
      ? `${tossWinner.name} won toss and elected to ${match.toss.elected}`
      : null;

  const battingTeamId =
    match.scores.current?.batting_team_id ||
    match.scores.current?.team_id;

  const LIVE_PHASES = ["FIRST", "SECOND", "INNINGS_BREAK"];

  const isInterrupted = match.match_status?.toUpperCase() === "INT.";
  const isDelayed= match.match_status?.toUpperCase() === "DELAYED";

  const isLive =
    isInterrupted ||
    isDelayed ||
    LIVE_PHASES.includes(match.innings_phase) ||
    match.match_status?.includes("INNINGS");

  const getTeamScore = (teamId: number) => {
    if (isLive && match.innings_phase === "FIRST") {
      return battingTeamId === teamId
        ? match.scores.current?.score
        : "Yet to bat";
    }

    if (isLive && match.innings_phase === "INNINGS_BREAK") {
      return match.scores.first_innings?.team_id === teamId
        ? match.scores.first_innings.score
        : "Yet to bat";
    }

    if (isLive && match.innings_phase === "SECOND") {
      return battingTeamId === teamId
        ? match.scores.current?.score
        : match.scores.first_innings?.score;
    }

    return "—";
  };

  // UI-only helper (unchanged logic)
  const getTeamOvers = (teamId: number) => {
    if (
      isLive &&
      battingTeamId === teamId &&
      match.scores.current?.overs
    ) {
      return ` (${match.scores.current.overs})`;
    }
    return "";
  };

  const team1Logo = getTeamLogoUrl(team1);
  const team2Logo = getTeamLogoUrl(team2);

  const stadiumImage =
    match.venue?.image_path &&
    match.venue.image_path.includes("/images/")
      ? match.venue.image_path
      : FALLBACK_STADIUM_IMAGE;

  return (
    <Link
      to={`/match/${match.match_id}`}
      className="
        group relative block overflow-hidden rounded-2xl
        border-2 border-red-500
        transition-all
        animate-[liveBorderPulse_2.5s_ease-in-out_infinite]
        hover:shadow-xl
      "
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src={stadiumImage}
          alt={match.venue?.name ?? 'Cricket stadium'}
          className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95 dark:from-black/70 dark:via-black/65 dark:to-black/80" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 p-6 pt-8 text-foreground dark:text-white">
        {/* LIVE BADGE */}
        <div className="flex justify-center mb-4">
          <span className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-wider">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
            </span>
              {isInterrupted ? "Interrupted" : isDelayed ? "Delayed" : "Live"}
          </span>
        </div>

        {/* TEAMS */}
        <div className="flex items-center justify-center gap-6">
          {/* TEAM 1 */}
          <div className="flex flex-col items-center gap-2 w-32 text-center">
            <img
              src={team1Logo ?? ""}
              alt={team1.name}
              className="h-14 w-14 object-contain drop-shadow-md"
            />
            <span className="font-bold text-base leading-tight">
              {team1.name}
            </span>
            <span className="text-lg font-black text-muted-foreground/80">
              {getTeamScore(team1.id)}
              {getTeamOvers(team1.id)}
            </span>
          </div>

          <span className="text-lg font-black text-muted-foreground/40">
            VS
          </span>

          {/* TEAM 2 */}
          <div className="flex flex-col items-center gap-2 w-32 text-center">
            <img
              src={team2Logo ?? ""}
              alt={team2.name}
              className="h-14 w-14 object-contain drop-shadow-md"
            />
            <span className="font-bold text-base leading-tight">
              {team2.name}
            </span>
            <span className="text-lg font-black text-muted-foreground/80">
              {getTeamScore(team2.id)}
              {getTeamOvers(team2.id)}
            </span>
          </div>
        </div>

        {/* META */}
        <div className="mt-5 text-center space-y-1">
          {match.venue?.name && (
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-muted-foreground">
              <MapPin className="h-3 w-3 stroke-[3]" />
              <span>
                {match.venue.name}
                {match.venue.city ? `, ${match.venue.city}` : ""}
              </span>
            </div>
          )}

          {tossText && (
            <div className="text-xs font-bold text-muted-foreground/70">
              {tossText}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
