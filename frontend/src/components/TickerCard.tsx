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
  const isLive = match.match_status === "LIVE";
  const isFinished = match.match_status === "FINISHED";
  const isUpcoming = match.match_status === "NS";

  const team1 = match.teams.batting_first;
  const team2 = match.teams.batting_second;

  const team1Won = match.result?.includes(team1.name);
  const team2Won = match.result?.includes(team2.name);

  const link = isFinished
    ? `/match/${match.match_id}/result`
    : isUpcoming
    ? `/match/${match.match_id}/schedule`
    : `/match/${match.match_id}`;

  return (
    <Link
      to={link}
      className={cn(
        "flex-shrink-0 w-[320px] rounded-xl transition-all duration-200",
        "bg-black/30 backdrop-blur-md",
        "border border-white/10",
        "shadow-lg shadow-black/40",
        "hover:bg-black/65 hover:shadow-xl"
      )}
    >
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-white/20 flex justify-between items-center">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            isLive && "text-red-500",
            isFinished && "text-gray-200",
            isUpcoming && "text-orange-400"
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
        {/* Team 1 */}
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

          {!isUpcoming && (
            <span
              className={cn(
                "text-sm font-semibold",
                team1Won ? "text-white" : "text-gray-300"
              )}
            >
              {match.scores.first_innings?.score ?? "—"}
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

          {!isUpcoming && (
            <span
              className={cn(
                "text-sm font-semibold",
                team2Won ? "text-white" : "text-gray-300"
              )}
            >
              {match.scores.second_innings?.score ??
                (isLive ? "Yet to bat" : "—")}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-white/20 text-center text-[11px] text-gray-300">
        {isFinished && match.result}
        {isUpcoming && formatMatchTime(match.start_time)}
        {isLive &&
          (match.innings_phase === "FIRST_INNINGS"
            ? "1st Innings"
            : "2nd Innings")}
      </div>
    </Link>
  );
}
