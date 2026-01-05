// frontend/src/pages/LiveScores.tsx

import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { Radio, Search, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveScores, useSchedules } from "@/hooks/use-cricket-data";
import LiveMatchCard from "@/components/LiveMatchCard";
import MatchCard from "@/components/MatchCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import type { LiveScoreMatch, ScheduleMatch, CombinedMatch, FilterStatus } from "@/lib/types";

export default function LiveScores() {
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data from both endpoints
  const { 
    data: liveScoresData = [], 
    isLoading: liveLoading,
    error: liveError,
    refetch: refetchLive
  } = useLiveScores({ refetchInterval: 30000 });
  
  const { 
    data: schedulesData = [], 
    isLoading: scheduleLoading,
    error: scheduleError,
    refetch: refetchSchedules
  } = useSchedules();

  const isLoading = liveLoading || scheduleLoading;
  const error = liveError || scheduleError;

  // Combine and filter matches
  const combinedMatches = useMemo<CombinedMatch[]>(() => {
    const matches: CombinedMatch[] = [];

    // Add LIVE matches only (filter out NS and FINISHED from livescore endpoint)
    if (Array.isArray(liveScoresData)) {
      liveScoresData
        .filter((m: LiveScoreMatch) => m.match_status === 'LIVE')
        .forEach((m: LiveScoreMatch) => {
          matches.push({ ...m, _type: 'live' });
        });
    }

    // Add FINISHED matches only from schedules endpoint
    if (Array.isArray(schedulesData)) {
      schedulesData
        .filter((m: ScheduleMatch) => m.status === 'Finished')
        .forEach((m: ScheduleMatch) => {
          matches.push({ ...m, _type: 'finished' });
        });
    }

    // Sort: LIVE first, then FINISHED by start_time (most recent first)
    return matches.sort((a, b) => {
      if (a._type === 'live' && b._type === 'finished') return -1;
      if (a._type === 'finished' && b._type === 'live') return 1;
      
      if (a._type === 'finished' && b._type === 'finished') {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      }
      
      return 0;
    });
  }, [liveScoresData, schedulesData]);

  // Apply filters
  const filteredMatches = useMemo(() => {
    let result = combinedMatches;

    // Status filter
    if (filter === 'LIVE') {
      result = result.filter(m => m._type === 'live');
    } else if (filter === 'COMPLETED') {
      result = result.filter(m => m._type === 'finished');
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => {
        if (m._type === 'live') {
          return (
            m.teams.batting_first.name.toLowerCase().includes(query) ||
            m.teams.batting_second.name.toLowerCase().includes(query) ||
            m.venue.city.toLowerCase().includes(query)
          );
        } else {
          return (
            m.home_team.name.toLowerCase().includes(query) ||
            m.away_team.name.toLowerCase().includes(query) ||
            m.league.name.toLowerCase().includes(query) ||
            m.venue.city.toLowerCase().includes(query)
          );
        }
      });
    }

    return result;
  }, [combinedMatches, filter, searchQuery]);

  const liveCount = combinedMatches.filter(m => m._type === 'live').length;

  return (
    <>
      <Helmet>
        <title>Live Cricket Scores | STRYKER</title>
        <meta
          name="description"
          content="Real-time cricket scores and match updates. Follow every ball, every run, every wicket live."
        />
      </Helmet>

      {/* Header */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-12 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Live Scores</h1>
            {liveCount > 0 && (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-500 text-white text-sm font-medium animate-pulse">
                {liveCount} LIVE
              </span>
            )}
          </div>
          <p className="text-blue-100">
            Real-time updates from matches around the world
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(['ALL', 'LIVE', 'COMPLETED'] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  'px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  filter === status
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'

                )}
              >
                {status === 'ALL' && 'All Matches'}
                {status === 'LIVE' && (
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    Live
                  </span>
                )}
                {status === 'COMPLETED' && 'Completed'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by team, league, or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Auto-refreshing every 30 seconds
        </div>

        {/* Matches List */}
        {isLoading ? (
          <LoadingState message="Fetching latest scores..." />
        ) : error ? (
          <ErrorState
            message="Unable to fetch match data. Please try again."
            onRetry={() => {
              refetchLive();
              refetchSchedules();
            }}
          />
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search' : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map(match => 
              match._type === 'live' ? (
                <LiveMatchCard 
                  key={`live-${match.match_id}`} 
                  match={match} 
                />
              ) : (
                <MatchCard 
                  key={`finished-${match.match_id}`} 
                  match={match} 
                />
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}