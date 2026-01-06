import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { formatMatchTime, getTeamLogoUrl } from "@/lib/utils";
import type { ScheduleMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

const FALLBACK_STADIUM_IMAGE =
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&q=80";

interface MatchCardProps {
  match: ScheduleMatch & { _type: "finished" };
}

export default function MatchCard({ match }: MatchCardProps) {
  const homeLogo = getTeamLogoUrl(match.home_team);
  const awayLogo = getTeamLogoUrl(match.away_team);

  const homeWon = match.result_note?.includes(match.home_team.name);
  const awayWon = match.result_note?.includes(match.away_team.name);

  const stadiumImage =
    match.venue?.image_path &&
    match.venue.image_path.includes("/images/")
      ? match.venue.image_path
      : FALLBACK_STADIUM_IMAGE;

  return (
    <Link
      to={`/match/${match.match_id}/result`}
      className="group relative block overflow-hidden rounded-2xl border border-border hover:shadow-xl transition-all"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src={stadiumImage}
          alt={match.venue?.name ?? "Cricket stadium"}
          className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95 dark:from-black/70 dark:via-black/65 dark:to-black/80" />
      </div>

      {/* CONTENT */}
      {/* Increased top padding (pt-8) to compensate for the removed badge */}
      <div className="relative z-10 p-6 pt-8 text-foreground dark:text-white">
        
        {/* TEAMS */}
        <div className="flex items-center justify-center gap-6">
          {/* HOME */}
          <div className="flex flex-col items-center gap-2 w-32 text-center">
            <img
              src={homeLogo ?? ""}
              alt={match.home_team.name}
              className="h-14 w-14 object-contain drop-shadow-md"
            />
            <span className="font-bold text-base leading-tight">
              {match.home_team.name}
            </span>
            <span
              className={cn(
                "text-lg font-black",
                homeWon
                  ? "text-green-700 dark:text-green-400"
                  : "text-muted-foreground/80"
              )}
            >
              {match.home_score || "—"}
            </span>
          </div>

          <span className="text-lg font-black text-muted-foreground/40">VS</span>

          {/* AWAY */}
          <div className="flex flex-col items-center gap-2 w-32 text-center">
            <img
              src={awayLogo ?? ""}
              alt={match.away_team.name}
              className="h-14 w-14 object-contain drop-shadow-md"
            />
            <span className="font-bold text-base leading-tight">
              {match.away_team.name}
            </span>
            <span
              className={cn(
                "text-lg font-black",
                awayWon
                  ? "text-green-700 dark:text-green-400"
                  : "text-muted-foreground/80"
              )}
            >
              {match.away_score || "—"}
            </span>
          </div>
        </div>

        {/* META */}
        <div className="mt-5 text-center space-y-1">
          <div className="text-sm font-bold text-foreground/80 uppercase tracking-tight">
            {match.league.name}
          </div>
          {match.venue?.city && (
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-muted-foreground">
              <MapPin className="h-3 w-3 stroke-[3]" />
              {match.venue.city}
            </div>
          )}
          <div className="text-xs font-bold text-muted-foreground/70">
            {formatMatchTime(match.start_time)}
          </div>
        </div>

        {/* RESULT */}
        {match.result_note && (
          <div className="mt-4 text-center text-sm font-black text-primary uppercase tracking-tight">
            {match.result_note}
          </div>
        )}
      </div>
    </Link>
  );
}