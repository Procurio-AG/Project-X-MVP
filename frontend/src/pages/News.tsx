import { Helmet } from "react-helmet-async";
import { useNews } from "@/hooks/use-cricket-data";
import NewsCard from "@/components/NewsCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { Newspaper } from "lucide-react";

export default function News() {
  const {
    data: news,
    isLoading,
    error,
    refetch,
  } = useNews({ limit: 50 });

  return (
    <>
      <Helmet>
        <title>Cricket Chronicles | News | STRYKER</title>
        <meta
          name="description"
          content="Latest cricket news, reports, and features from across the world."
        />
      </Helmet>

      {/* ---------------- HERO (Editorial Command Style) ---------------- */}
      <section className="relative h-[30vh] min-h-[280px] w-full overflow-hidden bg-[#F8FAFC]">
        {/* Aesthetic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-200/50 to-transparent -z-10" />
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10" />

        <div className="absolute inset-0 flex items-center z-10">
          <div className="container-content pt-6">
            <div className="max-w-4xl space-y-4">
              {/* Intelligence Stream Label */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Newspaper className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <span className="text-accent font-bold tracking-[0.4em] text-[10px] uppercase">
                  Global Updates
                </span>
              </div>

              {/* Big Bold Typography */}
              <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-900">
                Cricket <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-100">Chronicles</span>
              </h1>

              {/* Refined Description */}
              <p className="text-slate-500 max-w-2xl font-medium leading-relaxed text-lg">
                Breaking stories, match reports, and long-form features curated 
                from across leagues and continents, without the noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <div className="bg-[#F8FAFC] pb-20">
        <div className="container-content py-16">
          {isLoading ? (
            <LoadingState message="Loading news..." />
          ) : error ? (
            <ErrorState
              message="Unable to load news."
              onRetry={refetch}
            />
          ) : !Array.isArray(news) || news.length === 0 ? (
            <EmptyState
              title="No news available"
              message="Check back later for updates."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <NewsCard
                  key={item.id}
                  news={item}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}