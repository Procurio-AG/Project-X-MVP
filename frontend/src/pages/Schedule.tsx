import { Helmet } from "react-helmet-async";
import { useSchedules } from "@/hooks/use-cricket-data";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { Calendar } from "lucide-react";
import { formatScheduleDate } from "@/lib/utils";
import { useMemo } from "react";
import type { ScheduleMatch } from "@/lib/types";
import ScheduleCard from "@/components/ScheduleCard";

export default function Schedule() {
  const { data: matches, isLoading, error, refetch } = useSchedules();

  const groupedMatches = useMemo(() => {
    if (!matches) return {};

    const todayStr = new Date().toDateString();

    const visibleMatches = matches.filter((match) => {
      const isToday =
        new Date(match.start_time).toDateString() === todayStr;

      if (match.status === "NS") return true;

      if (
        match.status !== "NS" &&
        match.status.toLowerCase() !== "finished" &&
        isToday
      ) {
        return false;
      }

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

      {/* HERO */}
      {/* ---------------- HERO (Editorial Command Style) ---------------- */}
      <section className="relative h-[30vh] min-h-[280px] w-full overflow-hidden bg-[#F8FAFC]">
        {/* Aesthetic Background Elements matching Firehose */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-200/50 to-transparent -z-10" />
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10" />

        <div className="absolute inset-0 flex items-center z-10">
          <div className="container-content pt-6">
            <div className="max-w-4xl space-y-4">
              {/* Intelligence Stream Label */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <span className="text-accent font-bold tracking-[0.4em] text-[10px] uppercase">
                  Global Fixtures
                </span>
              </div>

              {/* Big Bold Typography */}
              <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-900">
                Match <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-100">Schedule</span>
              </h1>

              {/* Refined Description */}
              <p className="text-slate-500 max-w-2xl font-medium leading-relaxed text-lg">
                Upcoming fixtures from leagues around the world. Synced to your local timezone for total clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="bg-[#F8FAFC] pb-20">
        <div className="container-content py-16">
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
            <div className="space-y-14">
              {Object.entries(groupedMatches).map(([date, dayMatches]) => (
                <div key={date}>
                  <h2 className="font-display text-xl font-bold mb-6 border-b pb-2">
                    {date}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dayMatches.map((match) => (
                      <ScheduleCard
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
      </div>
    </>
  );
}
