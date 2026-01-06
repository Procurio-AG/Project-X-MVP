// frontend/src/pages/ScheduleDetail.tsx

import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { useSchedules } from "@/hooks/use-cricket-data";
import { formatMatchTime, formatScheduleDate, getTeamLogoUrl } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

const FALLBACK_STADIUM_IMAGE =
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&q=80";

export default function ScheduleDetail() {
  const { matchId } = useParams<{ matchId: string }>();
  const { data: matches, isLoading, error, refetch } = useSchedules();

  if (isLoading) return <LoadingState message="Loading match details..." />;

  if (error || !matches) {
    return <ErrorState message="Unable to load match schedule." onRetry={refetch} />;
  }

  const match = matches.find(
    (m) => String(m.match_id ?? m.id) === matchId
  );

  if (!match) {
    return (
      <div className="container-content py-12 text-center">
        <p className="text-muted-foreground">Match not found.</p>
      </div>
    );
  }

  const venueImage =
    match.venue?.image_path && match.venue.image_path.startsWith("http")
      ? match.venue.image_path
      : FALLBACK_STADIUM_IMAGE;

  const homeLogo = getTeamLogoUrl(match.home_team);
  const awayLogo = getTeamLogoUrl(match.away_team);

  return (
    <>
      <Helmet>
        <title>
          {match.home_team.name} vs {match.away_team.name} | STRYKER
        </title>
      </Helmet>

      {/* HERO SECTION */}
      <section className="relative min-h-[500px] md:h-[60vh] w-full overflow-hidden flex items-center">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={venueImage}
            alt={match.venue?.name ?? "Cricket Stadium"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_STADIUM_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full pt-20 pb-12">
          <div className="container-content">
            {/* Back */}
            <Link
              to="/schedule"
             className="inline-flex items-center gap-2 text-xs font-bold text-black/50 hover:text-black mb-16 -mt-4"
            >
              <ArrowLeft className="h-4 w-4 stroke-[3]" />
              BACK TO SCHEDULE
            </Link>

            {/* Teams */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 mb-10">
              {/* Home */}
              <div className="flex flex-col items-center text-center">
                <img
                  src={homeLogo ?? ""}
                  alt={match.home_team.name}
                  className="h-14 md:h-20 object-contain mb-3"
                />
                <h2 className="text-lg md:text-2xl font-black text-black uppercase tracking-tight">
                  {match.home_team.name}
                </h2>
              </div>

              {/* VS */}
              <div className="flex items-center justify-center">
                <span className="text-3xl md:text-5xl font-black text-black italic">
                  VS
                </span>
              </div>

              {/* Away */}
              <div className="flex flex-col items-center text-center">
                <img
                  src={awayLogo ?? ""}
                  alt={match.away_team.name}
                  className="h-14 md:h-20 object-contain mb-3"
                />
                <h2 className="text-lg md:text-2xl font-black text-black uppercase tracking-tight">
                  {match.away_team.name}
                </h2>
              </div>
            </div>

            {/* Match Info */}
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-xl">
                  <Calendar className="h-4 w-4 text-black/40" />
                  <span className="font-semibold text-black text-sm">
                    {formatScheduleDate(match.start_time)}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-xl">
                  <Clock className="h-4 w-4 text-black/40" />
                  <span className="font-semibold text-black text-sm">
                    {formatMatchTime(match.start_time)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                {match.venue && (
                  <div className="flex items-center gap-2 text-black/60 font-semibold text-sm md:text-base">
                    <MapPin className="h-4 w-4 text-black/30" />
                    <span>
                      {match.venue.name}
                      {match.venue.city && `, ${match.venue.city}`}
                    </span>
                  </div>
                )}

                <div className="px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-black tracking-widest uppercase">
                  {match.league?.name} • {match.match_type}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="bg-background">
        <div className="container-content py-14 px-6">
          <div className="max-w-xl mx-auto text-center border-t border-black/5 pt-10">
            <p className="text-black/40 text-xs md:text-sm font-medium uppercase tracking-widest">
              Live scorecards and ball-by-ball updates will activate on{" "}
              <span className="text-black font-black">
                {formatScheduleDate(match.start_time)}
              </span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
