// frontend/src/components/FeaturedMatchCard.tsx

import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import { cn, formatMatchTime, getTeamLogoUrl } from "@/lib/utils";
import type { LiveScoreMatch } from "@/lib/types";

interface FeaturedMatchCardProps {
  match: LiveScoreMatch;
}

export default function FeaturedMatchCard({ match }: FeaturedMatchCardProps) {
  // 🚫 Ignore abandoned matches completely
  if (match.match_status === "ABAN.") return null;

  const team1 = match.teams.batting_first;
  const team2 = match.teams.batting_second;

  /* ================= MATCH STATE ================= */

  const LIVE_PHASES = ["FIRST", "SECOND", "INNINGS_BREAK"];

  const isInterrupted = match.match_status?.toUpperCase() === "INT.";
  const isDelayed= match.match_status?.toUpperCase() === "DELAYED";

  const isLive =
    isInterrupted ||
    isDelayed ||
    LIVE_PHASES.includes(match.innings_phase) ||
    match.match_status?.includes("INNINGS");

  const isFinished =
    match.innings_phase === "COMPLETED" ||
    match.match_status === "FINISHED";

  const isUpcoming =
    match.match_status === "NS" && !isLive;

  const isInningsBreak = match.innings_phase === "INNINGS_BREAK";

  const battingTeamId =
    match.scores.current?.batting_team_id ||
    match.scores.current?.team_id;

  // ---------- TEAM 1 ----------
  const team1Score =
    isLive && match.innings_phase === "FIRST"
      ? battingTeamId === team1.id
        ? match.scores.current
        : null
      : isLive && match.innings_phase === "SECOND"
      ? battingTeamId === team1.id
        ? match.scores.current
        : match.scores.first_innings
      : isLive && match.innings_phase === "INNINGS_BREAK"
      ? team1.id === match.scores.first_innings?.team_id
        ? match.scores.first_innings
        : null
      : isFinished
      ? match.scores.first_innings
      : null;

  // ---------- TEAM 2 ----------
  const team2Score =
    isLive && match.innings_phase === "FIRST"
      ? battingTeamId === team2.id
        ? match.scores.current
        : null
      : isLive && match.innings_phase === "SECOND"
      ? battingTeamId === team2.id
        ? match.scores.current
        : match.scores.first_innings
      : isLive && match.innings_phase === "INNINGS_BREAK"
      ? team2.id === match.scores.first_innings?.team_id
        ? match.scores.first_innings
        : null
      : isFinished
      ? match.scores.second_innings
      : null;

  /* ================= META ================= */

  const team1Logo = getTeamLogoUrl(team1);
  const team2Logo = getTeamLogoUrl(team2);

  const link = isFinished
    ? `/match/${match.match_id}/result`
    : isUpcoming
    ? `/match/${match.match_id}/schedule`
    : `/match/${match.match_id}`;

  /* ================= UI ================= */

  return (
    <Link
      to={link}
      className={cn(
        "block rounded-xl border-2 transition-all p-6 shadow-lg hover:shadow-xl",
        isLive &&
          "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-500 hover:border-red-600",
        isFinished &&
          "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
        isUpcoming &&
          "bg-card border-border hover:border-accent"
      )}
    >
      {/* ===== Status Header ===== */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive && (
            <>
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              <span className="text-red-600 dark:text-red-500 text-sm font-bold uppercase tracking-wider">
                {isInterrupted ? "Interrupted" : isDelayed ? "Delayed" : "Live"}
              </span>
            </>
          )}

          {isFinished && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              <Clock className="h-3 w-3" />
              Completed
            </span>
          )}

          {isUpcoming && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              <Clock className="h-3 w-3" />
              Upcoming
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {match.venue.city}
        </div>
      </div>

      {/* ===== Teams & Scores ===== */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
        {/* Team 1 */}
        <div className="flex items-center gap-3">
          {team1Logo ? (
            <img
              src={team1Logo}
              alt={team1.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
              {team1.short_name || "?"}
            </div>
          )}
          <div>
            <p className="font-semibold text-lg">{team1.name}</p>
            {!isUpcoming && (
              <p className="text-muted-foreground">
                {isInterrupted
                  ? "--"
                  : team1Score
                  ? `${team1Score.score} (${team1Score.overs})`
                  : "Yet to bat"}
              </p>
            )}
          </div>
        </div>

        <div className="text-muted-foreground/50 font-bold text-xl">VS</div>

        {/* Team 2 */}
        <div className="flex items-center gap-3 md:flex-row-reverse md:text-right">
          {team2Logo ? (
            <img
              src={team2Logo}
              alt={team2.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
              {team2.short_name || "?"}
            </div>
          )}
          <div>
            <p className="font-semibold text-lg">{team2.name}</p>
            {!isUpcoming && (
            <p className="text-muted-foreground">
              {isInterrupted
                ? "--"
                : team2Score
                ? `${team2Score.score} (${team2Score.overs})`
                : "Yet to bat"}
            </p>

            )}
          </div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      {isFinished && match.result && (
        <div className="text-center bg-muted/50 rounded-lg py-3">
          <p className="text-sm font-medium">{match.result}</p>
        </div>
      )}

      {isUpcoming && (
        <div className="text-center bg-muted/50 rounded-lg py-2">
          <p className="text-sm font-medium">
            {formatMatchTime(match.start_time)}
          </p>
          <p className="text-xs text-muted-foreground">{match.venue.name}</p>
        </div>
      )}

      {isLive && (
        <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-lg py-2">
          <p className="text-xs text-muted-foreground font-medium">
            {match.match_status === "1ST INNINGS" && "1st Innings"}
            {match.match_status === "2ND INNINGS" && "2nd Innings"}
            {match.match_status === "INNINGS BREAK" && "Innings Break"}
            {match.match_status?.toUpperCase() === "INT." && "Interrupted"}
            {match.match_status?.toUpperCase() === "DELAYED" && "Delayed"}
          </p>
        </div>
      )}


    </Link>
  );
}
