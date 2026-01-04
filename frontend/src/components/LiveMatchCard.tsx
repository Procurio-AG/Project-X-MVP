import { Link } from "react-router-dom";

export default function LiveMatchCard({ match }: { match: any }) {
  const matchId = match.match_id ?? match.id;

  const score = match.score;

  // 🔑 Determine current batting & bowling teams dynamically
  const battingTeam =
    score?.team_id === match.batting_team?.id
      ? match.batting_team
      : match.bowling_team;

  const bowlingTeam =
    battingTeam?.id === match.batting_team?.id
      ? match.bowling_team
      : match.batting_team;

  return (
    <Link to={`/match/${matchId}`} className="block group">
      <div className="border border-live rounded-lg p-5 bg-live/5 group-hover:bg-live/10 transition-all">
        <div className="flex justify-between mb-3">
          <span className="text-live text-xs font-bold uppercase tracking-wider animate-pulse">
            {match.status || "LIVE"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            ID: {matchId}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {/* Batting team */}
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {battingTeam?.name ?? "Batting"}
            </span>
            {score && (
              <span className="font-bold text-lg">
                {score.runs}/{score.wickets}
              </span>
            )}
          </div>

          {/* Bowling team */}
          <div className="flex justify-between items-center opacity-70">
            <span>{bowlingTeam?.name ?? "Bowling"}</span>
            {score && (
              <span className="text-sm">
                ({score.overs} ov)
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
