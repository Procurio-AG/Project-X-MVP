import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Trophy, MapPin, Activity } from 'lucide-react';
import { useMatchDetail } from '@/hooks/use-cricket-data';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import HighlightsContainer from "@/components/highlights/HighlightsContainer";


/* ================== HELPERS ================== */

function deriveWinner(match: any) {
  if (!match?.scorecard || match.scorecard.length < 2) return null;
  const [inn1, inn2] = match.scorecard;
  const r1 = parseInt(inn1.score?.split('/')[0] || '0', 10);
  const r2 = parseInt(inn2.score?.split('/')[0] || '0', 10);
  return r2 > r1 ? inn2.team_id : (r1 > r2 ? inn1.team_id : null);
}

function deriveResultText(match: any) {
  if (!match?.scorecard || match.scorecard.length < 2) return 'Result pending';
  const [inn1, inn2] = match.scorecard;
  const r1 = parseInt(inn1.score?.split('/')[0] || '0', 10);
  const r2 = parseInt(inn2.score?.split('/')[0] || '0', 10);
  const w2 = parseInt(inn2.score?.split('/')[1] || '0', 10);
  const winner = r2 > r1 ? inn2 : inn1;
  const name = winner.team_name || 'Team';
  if (r2 > r1) return `${name} won by ${10 - w2} wickets`;
  if (r1 > r2) return `${name} won by ${r1 - r2} runs`;
  return 'Match Tied';
}

/* ================== SUB-COMPONENTS ================== */

function ScoreboardTeam({ inning, isWinner }: { inning: any; isWinner: boolean }) {
  const [runs, wickets] = inning.score?.split('/') || ['0', '0'];
  return (
    <div className={`flex flex-col items-center transition-all duration-700 ${isWinner ? 'scale-105' : 'grayscale opacity-70'}`}>
      {/* Team Name: Bold & Compact */}
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-3">
        {inning.team_name}
      </span>
      
      {/* Score Box: Reduced text size from 7xl/9xl to 5xl/7xl */}
      <div className={`flex items-baseline gap-1 px-8 py-6 rounded-[1.5rem] bg-white shadow-2xl border-2 ${isWinner ? 'border-yellow-400' : 'border-slate-100'}`}>
        <span className="text-5xl md:text-7xl font-black text-black leading-none">
          {runs}
        </span>
        <span className="text-xl md:text-2xl font-black text-slate-500">
          /{wickets}
        </span>
      </div>
      
      {/* Overs: Bold but small */}
      <span className="text-[10px] font-black text-slate-900 mt-4 uppercase tracking-widest">
        {inning.overs} OVERS
      </span>
      
      {/* Winner Badge: Matches your reference image exactly */}
      {isWinner && (
        <div className="mt-2 bg-[#FACC15] text-black px-4 py-1 rounded-lg font-black text-[9px] flex items-center gap-1 uppercase tracking-wider shadow-md">
          <Trophy className="h-3 w-3" /> Winner
        </div>
      )}
    </div>
  );
}

function LineupCompact({ title, players }: { title: string; players: any[] }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border-2 border-white shadow-xl rounded-[2rem] p-8">
      <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900 mb-8 flex items-center gap-3">
        <div className="h-1 w-12 bg-slate-900 rounded-full" /> {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {players?.map((p) => (
          <div key={p.id} className="group flex items-center gap-3 p-3 rounded-2xl bg-white border-2 border-slate-50 hover:border-slate-900 hover:shadow-lg transition-all">
            <div className="relative flex-shrink-0">
              <img 
                src={p.image?.includes('placeholder') ? `https://ui-avatars.com/api/?name=${p.name}&background=0f172a&color=fff` : p.image} 
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md" 
                alt="" 
              />
              {(p.is_captain || p.is_keeper) && (
                <div className="absolute -bottom-1 -right-1 bg-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded text-white border border-white">
                  {p.is_captain ? 'C' : 'WK'}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-black text-slate-900 truncate leading-tight">{p.name}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 truncate mt-0.5">{p.position}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatRow({ player, type }: { player: any; type: 'bat' | 'bowl' }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-slate-50 hover:border-slate-900 transition-all shadow-md">
      <img src={player.player?.image} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100" alt="" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-900 truncate">{player.player?.name}</p>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">
          {type === 'bat' ? `${player.runs} Runs • ${player.balls} Balls` : `${player.wickets} Wkts • ${player.economy} Eco`}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-slate-900">{type === 'bat' ? player.runs : player.wickets}</p>
      </div>
    </div>
  );
}

function SummaryInnings({ inning }: { inning: any }) {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-[2rem] shadow-xl p-6 md:p-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h3
          className="
            text-xs md:text-sm
            font-black
            uppercase
            tracking-[0.25em]
            text-white
            px-8 md:px-10
            py-3
            rounded-full
            bg-gradient-to-r
            from-[#0B1220]
            via-[#0F1A2E]
            to-[#0B1220]
            shadow-[0_8px_30px_rgba(0,0,0,0.35)]
            text-center
            self-start md:self-auto
          "
        >
          {inning.team_name} Innings
        </h3>

        <span className="text-xs font-black uppercase tracking-widest text-slate-500 text-left md:text-right">
          {inning.score} ({inning.overs})
        </span>
      </div>

      {/* MAIN SPLIT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* ================= BATTING ================= */}
        <div className="md:col-span-7 space-y-4">
          {inning.batting?.map((b: any, i: number) => (
            <div
              key={i}
              className="flex justify-between gap-4 pb-3 border-b border-slate-100 last:border-none"
            >
              <div className="min-w-0">
                <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                  {b.player?.name}
                </p>
                <p className="text-[11px] md:text-[12px] text-slate-600 truncate">
                  {b.status === 'out'
                    ? b.dismissal_text || 'out'
                    : 'not out'}
                </p>
              </div>

              <div className="text-sm md:text-base font-bold text-slate-900 whitespace-nowrap">
                {b.runs}({b.balls})
              </div>
            </div>
          ))}

          {/* Extras & Total */}
          <div className="pt-4 mt-4 border-t border-slate-200 text-sm font-semibold flex justify-between">
            <span>Extras</span>
            <span>{inning.extras || 0}</span>
          </div>

          <div className="mt-1 text-sm font-black flex justify-between">
            <span>Total</span>
            <span>
              {inning.score} ({inning.overs})
            </span>
          </div>
        </div>

        {/* ================= DIVIDER (desktop only) ================= */}
        <div className="hidden md:block md:col-span-1">
          <div className="h-full w-px bg-slate-200 mx-auto" />
        </div>

        {/* ================= BOWLING ================= */}
        <div className="md:col-span-4">
          <div className="grid grid-cols-12 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-3">
            <div className="col-span-6">Bowler</div>
            <div className="col-span-2 text-right">O</div>
            <div className="col-span-2 text-right">R</div>
            <div className="col-span-2 text-right">W</div>
          </div>

          <div className="space-y-2">
            {inning.bowling?.map((bw: any, i: number) => (
              <div key={i} className="grid grid-cols-12 text-sm">
                <div className="col-span-6 font-semibold text-slate-900 truncate">
                  {bw.player?.name}
                </div>
                <div className="col-span-2 text-right">{bw.overs}</div>
                <div className="col-span-2 text-right">{bw.runs_conceded}</div>
                <div className="col-span-2 text-right font-semibold">
                  {bw.wickets}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}




/* ================== MAIN PAGE ================== */

export default function ResultMatchDetail() {
  const { matchId } = useParams();
  const { data: match, isLoading, error } = useMatchDetail(Number(matchId));

  const computed = useMemo(() => {
    if (!match?.scorecard?.[1]) return null;
    const [inn1, inn2] = match.scorecard;
    const allBat = [...(inn1.batting || []), ...(inn2.batting || [])].sort((a,b) => b.runs - a.runs).slice(0,3);
    const allBowl = [...(inn1.bowling || []), ...(inn2.bowling || [])].sort((a,b) => b.wickets - a.wickets).slice(0,3);
    return { winnerId: deriveWinner(match), result: deriveResultText(match), allBat, allBowl };
  }, [match]);

  if (isLoading) return <LoadingState />;
  if (error || !computed) return <ErrorState />;

  const [inn1, inn2] = match.scorecard;
  const venueImage =
  match.venue?.image_path &&
  match.venue.image_path.includes("/images/")
    ? match.venue.image_path
    : "https://images.pexels.com/photos/31739439/pexels-photo-31739439.jpeg";


  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-slate-900 selection:text-white overflow-x-hidden">
      <Helmet><title>{inn1.team_name} vs {inn2.team_name} | STRYKER</title></Helmet>

      {/* BACKGROUND LAYER - Uses absolute to allow footer at bottom */}
      <div className="absolute inset-0 z-0 h-[1200px] pointer-events-none">
        <img src={venueImage} className="w-full h-full object-cover opacity-80" alt="" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-100" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 mb-20">
        {/* <Link to="/live" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.4em] text-slate-900 hover:translate-x-[-4px] transition-transform mb-12">
          <ArrowLeft className="h-5 w-5" /> Back to matches
        </Link> */}

        {/* HERO SCOREBOARD SECTION */}
        <div className="flex flex-col items-center mb-24 pb-12 border-b-2 border-slate-200/50">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 w-full">
            <ScoreboardTeam inning={inn1} isWinner={computed.winnerId === inn1.team_id} />
            <div className="text-slate-900 font-black italic text-5xl opacity-20 uppercase tracking-widest">VS</div>
            <ScoreboardTeam inning={inn2} isWinner={computed.winnerId === inn2.team_id} />
          </div>

          <div className="mt-14 px-6 py-3 bg-slate-900 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
            <p className="text-base md:text-lg font-bold italic uppercase tracking-wide text-white">
              {computed.result}
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-12">
            <LineupCompact title={`${inn1.team_name} Playing XI`} players={match.lineups?.home} />
            <LineupCompact title={`${inn2.team_name} Playing XI`} players={match.lineups?.away} />
            
            {/* VENUE INFORMATION */}
            <div className="flex flex-wrap gap-8 p-10 rounded-[2rem] bg-white border-2 border-slate-200 text-slate-900 text-xs font-black uppercase tracking-[0.2em] shadow-lg">
              <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-slate-900" /> {match.venue?.name} • {match.venue?.city}</div>
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-slate-900" />
                Toss: {match.scorecard.find((i:any) => i.team_id === match.toss?.won_by_team_id)?.team_name}
                &nbsp;elected to {match.toss?.elected}
            </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-8 space-y-8">
              
              <div className="bg-white border-2 border-slate-100 shadow-2xl rounded-[2.5rem] p-10">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-600 mb-8 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-orange-600 animate-pulse" /> Top Batters
                </h4>
                <div className="space-y-4">
                  {computed.allBat.map((p, i) => <StatRow key={i} player={p} type="bat" />)}
                </div>
              </div>

              <div className="bg-white border-2 border-slate-100 shadow-2xl rounded-[2.5rem] p-10">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-700 mb-8 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-700 animate-pulse" /> Top Bowlers
                </h4>
                <div className="space-y-4">
                  {computed.allBowl.map((p, i) => <StatRow key={i} player={p} type="bowl" />)}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* FULL-WIDTH INNINGS SUMMARY */}
        <div className="mt-24 space-y-12">
          <h2 className="text-center text-lg md:text-xl font-extrabold uppercase tracking-[0.25em] text-slate-900">
            Innings Summary
          </h2>

          <SummaryInnings inning={inn1} />
          <SummaryInnings inning={inn2} />
        </div>

      </div>
      {/* Footer will naturally follow here because the main wrapper is not fixed/absolute */}
      <HighlightsContainer highlightsUrl={match.highlights_url} />
    </div>
  );
}