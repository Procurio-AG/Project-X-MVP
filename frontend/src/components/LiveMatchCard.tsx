// frontend/src/components/LiveMatchCard.tsx

import { Link } from "react-router-dom";
import { getTeamLogoUrl } from "@/lib/utils";
import type { LiveScoreMatch } from "@/lib/types";

interface LiveMatchCardProps {
  match: LiveScoreMatch & { _type: 'live' };
}

export default function LiveMatchCard({ match }: LiveMatchCardProps) {
  const team1 = match.teams.batting_first;
  const team2 = match.teams.batting_second;
  
  // Determine toss winner
  const tossWinner = match.toss.won_by_team_id === team1.id ? team1 : team2;
  const tossText = match.toss.won_by_team_id && match.toss.elected
    ? `${tossWinner.name} won toss and elected to ${match.toss.elected}`
    : null;

  // Determine which team is batting based on current score
  const currentBattingTeamId = match.scores.current?.team_id;
  const isBattingFirst = currentBattingTeamId === team1.id;
  
  // Score logic
  const team1Score = isBattingFirst 
    ? match.scores.current 
    : (match.innings_phase === 'FIRST_INNINGS' ? null : match.scores.first_innings);
    
  const team2Score = !isBattingFirst 
    ? match.scores.current 
    : (match.innings_phase === 'FIRST_INNINGS' ? null : match.scores.second_innings);

  const team1Logo = getTeamLogoUrl(team1);
  const team2Logo = getTeamLogoUrl(team2);

  return (
    <Link 
      to={`/match/${match.match_id}`}
      className="block bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl border-2 border-red-500 hover:border-red-600 transition-all p-6 shadow-lg hover:shadow-xl"
    >
      {/* Live Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </span>
          <span className="text-red-600 dark:text-red-500 text-sm font-bold uppercase tracking-wider">
            LIVE
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {match.venue.city}
        </span>
      </div>

      {/* Teams and Scores */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
        {/* Team 1 */}
        <div className="flex items-center gap-3">
          {team1Logo ? (
            <img 
              src={team1Logo} 
              alt={team1.name}
              className="w-10 h-10 object-contain flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
              {team1.short_name || team1.code || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {team1.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {team1Score ? `${team1Score.score} (${team1Score.overs})` : 'Yet to bat'}
            </p>
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-gray-400 font-bold text-lg px-2">VS</div>

        {/* Team 2 */}
        <div className="flex items-center gap-3 flex-row-reverse text-right">
          {team2Logo ? (
            <img 
              src={team2Logo} 
              alt={team2.name}
              className="w-10 h-10 object-contain flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
              {team2.short_name || team2.code || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {team2.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {team2Score ? `${team2Score.score} (${team2Score.overs})` : 'Yet to bat'}
            </p>
          </div>
        </div>
      </div>

      {/* Toss Info */}
      {tossText && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg py-2 px-3">
          {tossText}
        </div>
      )}
    </Link>
  );
}