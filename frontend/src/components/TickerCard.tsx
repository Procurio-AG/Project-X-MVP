import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { LiveScoreMatch } from "@/lib/types";

interface Props {
  match: LiveScoreMatch;
  getTeamLogoUrl: (team: any) => string | null;
  formatMatchTime: (time: string) => string;
}

export default function TickerCard({
  match,
  getTeamLogoUrl,
  formatMatchTime,
}: Props) {
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

  const isUpcoming = match.match_status === "NS";
  const isAbandoned = match.match_status === "ABAN.";

  /* ================= TEAMS ================= */

  const rawTeam1 = match.teams.batting_first;
  const rawTeam2 = match.teams.batting_second;

  const battingTeamId =
    match.scores.current?.batting_team_id ||
    match.scores.current?.team_id;

  // 🔴 IMPORTANT: reorder teams so batting team is on top
  const team1 =
    isLive && battingTeamId === rawTeam2.id ? rawTeam2 : rawTeam1;

  const team2 =
    team1.id === rawTeam1.id ? rawTeam2 : rawTeam1;

  /* ================= RESULT ================= */

  const team1Won = match.result?.includes(team1.name);
  const team2Won = match.result?.includes(team2.name);

  /* ================= LINK ================= */

  const link = isFinished
    ? `/match/${match.match_id}/result`
    : isUpcoming
    ? `/match/${match.match_id}/schedule`
    : `/match/${match.match_id}`;

  const Wrapper: any = isAbandoned ? "div" : Link;

  /* ================= SCORE LOGIC ================= */

  const getTeamScore = (teamId: number) => {
    if (isUpcoming || isAbandoned || isInterrupted) return "—";

    // 1st innings → only batting team has score
    if (isLive && match.innings_phase === "FIRST") {
      return battingTeamId === teamId
        ? match.scores.current?.score
        : "Yet to bat";
    }

    // Innings break
    if (isLive && match.innings_phase === "INNINGS_BREAK") {
      return match.scores.first_innings?.team_id === teamId
        ? match.scores.first_innings.score
        : "Yet to bat";
    }

    // 2nd innings
    if (isLive && match.innings_phase === "SECOND") {
      return battingTeamId === teamId
        ? match.scores.current?.score
        : match.scores.first_innings?.score;
    }

    // Finished
    if (isFinished) {
      if (match.scores.first_innings?.team_id === teamId)
        return match.scores.first_innings.score;
      if (match.scores.second_innings?.team_id === teamId)
        return match.scores.second_innings.score;
    }

    return "—";
  };

  /* ================= UI ================= */

  return (
    <Wrapper
      {...(!isAbandoned && { to: link })}
      className={cn(
        "flex-shrink-0 w-[320px] rounded-xl transition-all duration-200",
        "bg-black/30 backdrop-blur-md",
        "border border-white/10",
        "shadow-lg shadow-black/40",
        !isAbandoned && "hover:bg-black/65 hover:shadow-xl",
        isAbandoned && "opacity-70 cursor-not-allowed"
      )}
    >
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-white/20 flex justify-between items-center">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            isLive && "text-red-500",
            isFinished && "text-gray-200",
            isUpcoming && "text-orange-400",
            isAbandoned && "text-yellow-400",
            isDelayed && "text-red-500",
            isInterrupted && "text-red-500"
          )}
        >
          {match.match_status}
        </span>
        <span className="text-[10px] text-gray-300 uppercase">
          {match.venue.city}
        </span>
      </div>

      {/* Teams */}
      <div className="px-4 py-4 space-y-3">
        {/* Team 1 (batting team when live) */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={getTeamLogoUrl(team1) ?? ""}
              alt={team1.name}
              className="w-7 h-7 object-contain"
            />
            <span
              className={cn(
                "text-sm truncate",
                team1Won
                  ? "font-semibold text-white"
                  : "font-medium text-gray-300"
              )}
            >
              {team1.name}
            </span>
          </div>

          {!isUpcoming && !isAbandoned && (
            <span
              className={cn(
                "text-sm font-semibold",
                team1Won ? "text-white" : "text-gray-300"
              )}
            >
              {getTeamScore(team1.id)}
            </span>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={getTeamLogoUrl(team2) ?? ""}
              alt={team2.name}
              className="w-7 h-7 object-contain"
            />
            <span
              className={cn(
                "text-sm truncate",
                team2Won
                  ? "font-semibold text-white"
                  : "font-medium text-gray-300"
              )}
            >
              {team2.name}
            </span>
          </div>

          {!isUpcoming && !isAbandoned && (
            <span
              className={cn(
                "text-sm font-semibold",
                team2Won ? "text-white" : "text-gray-300"
              )}
            >
              {getTeamScore(team2.id)}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-white/20 text-center text-[11px] text-gray-300">
        {isAbandoned && "Match Abandoned"}
        {isFinished && !isAbandoned && match.result}
        {isUpcoming && formatMatchTime(match.start_time)}
        {isLive && (
          <>
            {match.match_status === "1ST INNINGS" && "1st Innings"}
            {match.match_status === "2ND INNINGS" && "2nd Innings"}
            {match.match_status === "INNINGS BREAK" && "Innings Break"}
            {match.match_status?.toUpperCase() === "INT." && "Interrupted"}
            {match.match_status?.toUpperCase() === "DELAYED" && "Delayed"}
          </>
        )}

      </div>

    </Wrapper>
  );
}
