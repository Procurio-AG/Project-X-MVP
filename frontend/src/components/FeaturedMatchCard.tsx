// frontend/src/components/FeaturedMatchCard.tsx

import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import { cn, formatMatchTime, getTeamLogoUrl } from "@/lib/utils";
import type { LiveScoreMatch } from "@/lib/types";

interface FeaturedMatchCardProps {
  match: LiveScoreMatch;
}

export default function FeaturedMatchCard({ match }: FeaturedMatchCardProps) {
  const team1 = match.teams.batting_first;
  const team2 = match.teams.batting_second;
  
  const isLive = match.match_status === 'LIVE';
  const isFinished = match.match_status === 'FINISHED';
  const isUpcoming = match.match_status === 'NS';

  // Determine which team is batting based on current score
  const currentBattingTeamId = match.scores.current?.team_id;
  const isBattingFirst = currentBattingTeamId === team1.id;
  
  // Score logic for LIVE matches
  const team1Score = isLive 
    ? (isBattingFirst 
        ? match.scores.current 
        : (match.innings_phase === 'FIRST_INNINGS' ? null : match.scores.first_innings))
    : (isFinished ? match.scores.first_innings : null);
    
  const team2Score = isLive
    ? (!isBattingFirst 
        ? match.scores.current 
        : (match.innings_phase === 'FIRST_INNINGS' ? null : match.scores.second_innings))
    : (isFinished ? match.scores.second_innings : null);

  const team1Logo = getTeamLogoUrl(team1);
  const team2Logo = getTeamLogoUrl(team2);

  // Determine link based on status
  const link = isFinished 
    ? `/match/${match.match_id}/result`
    : isUpcoming
    ? `/match/${match.match_id}/schedule`
    : `/match/${match.match_id}`;

  return (
    <Link 
      to={link}
      className={cn(
        "block rounded-xl border-2 transition-all p-6 shadow-lg hover:shadow-xl",
        isLive && "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-500 hover:border-red-600",
        isFinished && "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
        isUpcoming && "bg-card border-border hover:border-accent"
      )}
    >
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive && (
            <>
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              <span className="text-red-600 dark:text-red-500 text-sm font-bold uppercase tracking-wider">
                LIVE
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

      {/* Teams and Scores */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
        {/* Team 1 */}
        <div className="flex items-center gap-3">
          {team1Logo ? (
            <img 
              src={team1Logo} 
              alt={team1.name}
              className="w-12 h-12 object-contain flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
              {team1.short_name || team1.code || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-base md:text-lg break-words leading-tight">
              {team1.name}
            </p>
            {!isUpcoming && (
              <p className="text-base text-muted-foreground font-medium">
                {team1Score ? `${team1Score.score} (${team1Score.overs})` : 'Yet to bat'}
              </p>
            )}
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-muted-foreground/50 font-bold text-xl px-3">VS</div>

        {/* Team 2 */}
        <div className="flex items-center gap-3 md:flex-row-reverse md:text-right">
          {team2Logo ? (
            <img 
              src={team2Logo} 
              alt={team2.name}
              className="w-12 h-12 object-contain flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
              {team2.short_name || team2.code || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate text-lg">
              {team2.name}
            </p>
            {!isUpcoming && (
              <p className="text-base text-muted-foreground font-medium">
                {team2Score ? `${team2Score.score} (${team2Score.overs})` : 'Yet to bat'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Different for each status */}
      {isFinished && match.result && (
        <div className="text-center bg-muted/50 rounded-lg py-3 px-4">
          <p className="text-sm font-medium text-foreground">
            {match.result}
          </p>
        </div>
      )}

      {isUpcoming && (
        <div className="text-center bg-muted/50 rounded-lg py-2 px-4">
          <p className="text-sm font-medium text-foreground">
            {formatMatchTime(match.start_time)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {match.venue.name}
          </p>
        </div>
      )}

      {isLive && (
        <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-lg py-2 px-3">
          <p className="text-xs text-muted-foreground">
            {match.innings_phase === 'FIRST_INNINGS' ? '1st Innings' : '2nd Innings'}
          </p>
        </div>
      )}
    </Link>
  );
}