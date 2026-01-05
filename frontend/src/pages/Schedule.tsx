import { Helmet } from "react-helmet-async";
import { useSchedules } from "@/hooks/use-cricket-data";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react";
import { formatMatchTime, formatScheduleDate } from "@/lib/utils";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ScheduleMatch } from "@/lib/types";

export default function Schedule() {
  const { data: matches, isLoading, error, refetch } = useSchedules();

  const groupedMatches = useMemo(() => {
    if (!matches) return {};

    const now = new Date();
    const todayStr = now.toDateString();

    const visibleMatches = matches.filter((match) => {
      const matchDate = new Date(match.start_time);
      const isToday = matchDate.toDateString() === todayStr;

      // Always allow upcoming
      if (match.status === "NS") return true;

      // Allow LIVE only if today
      if (
        match.status !== "NS" &&
        match.status.toLowerCase() !== "finished" &&
        isToday
      ) {
        return false;
      }

      // Do NOT show finished matches in schedule
      return false;
    });

    const sorted = [...visibleMatches].sort(
      (a, b) =>
        new Date(a.start_time).getTime() -
        new Date(b.start_time).getTime()
    );

    const groups: Record<string, ScheduleMatch[]> = {};
    sorted.forEach((match) => {
      const dateKey = formatScheduleDate(match.start_time);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(match);
    });

    return groups;
  }, [matches]);

  return (
    <>
      <Helmet>
        <title>Match Schedule | STRYKER</title>
      </Helmet>

      <section className="bg-primary text-primary-foreground py-10">
        <div className="container-content">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-6 w-6" />
            <h1 className="font-display text-3xl font-bold">Match Schedule</h1>
          </div>
          <p className="text-primary-foreground/80">
            All times shown in your local timezone.
          </p>
        </div>
      </section>

      <div className="container-content py-8">
        {isLoading ? (
          <LoadingState message="Loading schedule..." />
        ) : error ? (
          <ErrorState message="Unable to load schedule." onRetry={refetch} />
        ) : Object.keys(groupedMatches).length === 0 ? (
          <EmptyState
            title="No matches found"
            message="Schedules will appear here once available."
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMatches).map(([date, dayMatches]) => (
              <div key={date}>
                <h2 className="font-display text-lg font-bold mb-4 border-b">
                  {date}
                </h2>

                <div className="space-y-3">
                  {dayMatches.map((match) => (
                    <ScheduleRow
                      key={match.match_id ?? match.id}
                      match={match}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ScheduleRow({ match }: { match: ScheduleMatch }) {
  const normalizedStatus =
    match.status === "NS"
      ? "UPCOMING"
      : match.status.toLowerCase() === "finished"
      ? "FINISHED"
      : match.status;

  const isLive = normalizedStatus === "LIVE";

  return (
    <Link
      to={`/match/${match.match_id}/schedule`}
      className="flex items-center gap-4 p-4 bg-card border rounded-lg card-hover"
    >
      {/* Time */}
      <div className="w-24 text-center">
        {isLive ? (
          <span className="px-3 py-1 rounded bg-live text-live-foreground text-sm font-medium">
            LIVE
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatMatchTime(match.start_time)}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex-1">
        <div className="font-medium text-foreground">
          {match.home_team.name} vs {match.away_team.name}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {match.league.name}
        </div>
        {match.venue && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {match.venue.name}
            {match.venue.city && `, ${match.venue.city}`}
          </div>
        )}
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
