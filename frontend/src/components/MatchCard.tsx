import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { formatMatchTime, getTeamLogoUrl } from "@/lib/utils";
import type { ScheduleMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: ScheduleMatch & { _type: "finished" };
}

export default function MatchCard({ match }: MatchCardProps) {
  const homeLogo = getTeamLogoUrl(match.home_team);
  const awayLogo = getTeamLogoUrl(match.away_team);

  const homeWon = match.result_note?.includes(match.home_team.name);
  const awayWon = match.result_note?.includes(match.away_team.name);

  return (
    <Link
      to={`/match/${match.match_id}/result`}
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          <Clock className="h-3 w-3" />
          Completed
        </span>
        <span className="text-xs text-gray-500">
          {formatMatchTime(match.start_time)}
        </span>
      </div>

      {/* Venue */}
      <p className="text-xs text-gray-500 mb-3">
        {match.league.name} • {match.venue.city}
      </p>

      {/* Teams */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Home */}
        <div className="flex items-center gap-3">
          <img
            src={homeLogo ?? ""}
            alt={match.home_team.name}
            className="w-12 h-12 object-contain"
          />
          <div>
            <div
              className={cn(
                "text-lg font-bold",
                homeWon ? "text-green-700" : "text-gray-600"
              )}
            >
              {match.home_score || "—"}
            </div>
            <div className="text-xs text-gray-500">
              {match.home_team.name}
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="text-gray-300 text-sm font-semibold">VS</div>

        {/* Away */}
        <div className="flex items-center gap-3 justify-end text-right">
          <div>
            <div
              className={cn(
                "text-lg font-bold",
                awayWon ? "text-green-700" : "text-gray-600"
              )}
            >
              {match.away_score || "—"}
            </div>
            <div className="text-xs text-gray-500">
              {match.away_team.name}
            </div>
          </div>
          <img
            src={awayLogo ?? ""}
            alt={match.away_team.name}
            className="w-12 h-12 object-contain"
          />
        </div>
      </div>

      {/* Result */}
      <div className="mt-4 text-center bg-gray-50 rounded-lg py-2 text-sm font-medium text-gray-900">
        {match.result_note}
      </div>
    </Link>
  );
}
