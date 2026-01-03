import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Users,
  Activity,
} from "lucide-react";
import { useMatchDetail } from "@/hooks/use-cricket-data";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

/* ---------------- helpers ---------------- */

function deriveResult(match: any) {
  if (!match?.scorecard || match.scorecard.length < 2) {
    return "Result pending or unavailable";
  }

  const [inn1, inn2] = match.scorecard;

  const getRuns = (scoreStr: string) => parseInt(scoreStr?.split("/")[0] || "0", 10);
  const getWickets = (scoreStr: string) => parseInt(scoreStr?.split("/")[1] || "0", 10);

  const r1 = getRuns(inn1.score);
  const r2 = getRuns(inn2.score);
  const w2 = getWickets(inn2.score);

  const winner = r2 > r1 ? inn2 : inn1;
  const winnerName = winner.team_name || "Team";

  if (r2 > r1) {
    const wicketsRemaining = 10 - w2;
    return `${winnerName} won by ${wicketsRemaining} ${wicketsRemaining === 1 ? 'wicket' : 'wickets'}`;
  }

  if (r1 > r2) {
    const runMargin = r1 - r2;
    return `${winnerName} won by ${runMargin} ${runMargin === 1 ? 'run' : 'runs'}`;
  }

  return "Match Tied";
}

function topBatters(batting: any[], count = 2) {
  return [...(batting || [])]
    .sort((a, b) => (b.runs || 0) - (a.runs || 0))
    .slice(0, count);
}

function topBowlers(bowling: any[], count = 2) {
  return [...(bowling || [])]
    .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))
    .slice(0, count);
}

/* ---------------- components ---------------- */

function LineupSection({
  title,
  players,
}: {
  title: string;
  players: any[];
}) {
  return (
    <section className="bg-card border rounded-lg p-5 space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {players?.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-2 rounded bg-muted"
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium leading-tight">
                {p.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.position}
                {p.is_captain && " • C"}
                {p.is_keeper && " • WK"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- page ---------------- */

export default function ResultMatchDetail() {
  const { matchId } = useParams<{ matchId: string }>();
  const matchIdNum = matchId ? Number(matchId) : undefined;

  const { data: match, isLoading: isMatchLoading, error, refetch } =
    useMatchDetail(matchIdNum);

  const matchMeta = useMemo(() => {
    if (!match?.scorecard || match.scorecard.length < 2) return null;
    
    const team1 = match.scorecard[0];
    const team2 = match.scorecard[1];

    return {
      title: `${team1.team_name || 'Team 1'} vs ${team2.team_name || 'Team 2'}`,
      teamLookup: {
        [team1.team_id]: team1.team_name || 'Team 1',
        [team2.team_id]: team2.team_name || 'Team 2'
      },
      team1Name: team1.team_name || 'Team 1',
      team2Name: team2.team_name || 'Team 2'
    };
  }, [match]);

  if (isMatchLoading) return <LoadingState message="Loading match result..." />;

  if (error || !match || !matchMeta)
    return (
      <ErrorState
        message="Unable to load match result."
        onRetry={refetch}
      />
    );

  const [inn1, inn2] = match.scorecard;
  const resultText = deriveResult(match);

  const bat1 = topBatters(inn1.batting);
  const bat2 = topBatters(inn2.batting);
  const bowl1 = topBowlers(inn1.bowling);
  const bowl2 = topBowlers(inn2.bowling);

  return (
    <>
      <Helmet>
        <title>{matchMeta.title} | STRYKER</title>
      </Helmet>

      <div className="container-content py-8 space-y-6">
        <Link
          to="/live"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to matches
        </Link>

        {/* Title & Result */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{matchMeta.title}</h1>
          <section className="bg-card border rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold">Match Result</h2>
            </div>
            <p className="text-lg font-medium">{resultText}</p>
          </section>
        </div>

        {/* Innings */}
        <section className="grid md:grid-cols-2 gap-4">
          {match.scorecard.map((inning: any, idx: number) => (
            <div key={idx} className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">
                {inning.team_name || `Inning ${inning.inning_number}`}
              </p>
              <p className="text-lg font-semibold">
                {inning.score}
                <span className="text-sm text-muted-foreground ml-2">
                  ({inning.overs} ov)
                </span>
              </p>
            </div>
          ))}
        </section>

        {/* Performers */}
        <section className="bg-card border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold">Key Performances</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-medium mb-2">Batting</p>
              {[...bat1, ...bat2].map((b, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <img
                    src={b.player.image}
                    alt={b.player.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-muted-foreground">
                    {b.player.name} — {b.runs} ({b.balls})
                  </span>
                </div>
              ))}
            </div>

            <div>
              <p className="font-medium mb-2">Bowling</p>
              {[...bowl1, ...bowl2].map((b, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <img
                    src={b.player.image}
                    alt={b.player.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-muted-foreground">
                    {b.player.name} — {b.wickets}/{b.runs_conceded}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lineups */}
        <div className="grid md:grid-cols-2 gap-6">
          <LineupSection
            title={`${matchMeta.team1Name} Playing XI`}
            players={match.lineups?.home}
          />
          <LineupSection
            title={`${matchMeta.team2Name} Playing XI`}
            players={match.lineups?.away}
          />
        </div>

        {/* Meta */}
        <section className="bg-card border rounded-lg p-5 text-sm space-y-2 text-muted-foreground">
          {match.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {match.venue.name}, {match.venue.city}
            </div>
          )}
          {match.toss && (
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Toss won by {matchMeta.teamLookup[match.toss.won_by_team_id] || 'Unknown'}, elected to{" "}
              {match.toss.elected}
            </div>
          )}
        </section>
      </div>
    </>
  );
}