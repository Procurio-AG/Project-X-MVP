import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import type { DiscussionPost } from "@/lib/types";
import { fetchMockDiscussions } from "@/lib/mock-data";
import { cn, formatRelativeTime, formatNumber } from "@/lib/utils";
import { 
  ShieldAlert, 
  Globe, 
  Zap, 
  MessageSquare, 
  MessageCircle, 
  ThumbsUp, 
  Share2 
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import DiscussionCard from "@/components/DiscussionCard"; // ✅ USE EXISTING COMPONENT

interface DiscussionsPageProps {
  matchId?: string;
}

export default function DiscussionsPage({ matchId = "66709" }: DiscussionsPageProps) {
  const [matchMessages, setMatchMessages] = useState<DiscussionPost[]>([]);
  const [globalMessages, setGlobalMessages] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllIntel = async () => {
      setLoading(true);
      const [matchData, globalData] = await Promise.all([
        matchId ? fetchMockDiscussions(matchId) : Promise.resolve([]),
        fetchMockDiscussions(),
      ]);
      setMatchMessages(matchData);
      setGlobalMessages(globalData);
      setLoading(false);
    };
    loadAllIntel();
  }, [matchId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Helmet>
        <title>Intelligence Hub | STRYKER</title>
      </Helmet>

      {/* HERO */}
      <section className="relative h-[30vh] min-h-[280px] w-full overflow-hidden bg-[#F8FAFC]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-200/50 to-transparent -z-10" />
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10" />

        <div className="absolute inset-0 flex items-center z-10">
          <div className="container-content pt-6">
            <div className="max-w-4xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <span className="text-accent font-bold tracking-[0.4em] text-[10px] uppercase">
                  Community Discourse
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-900">
                The <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-100">Intel Feed</span>
              </h1>

              <p className="text-slate-500 max-w-2xl font-medium leading-relaxed text-lg">
                Strategic analysis and community discourse. Switch between live tactical war rooms and global debates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="bg-[#F8FAFC] pb-20">
        <div className="container-content py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-8 items-start">
            
            {/* MATCH DAY WAR ROOM */}
            <section className="space-y-4 lg:sticky lg:top-28 self-start">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <ShieldAlert className="h-5 w-5 text-accent animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase leading-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
                      Match War Room
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Tactical Live Stream
                    </p>
                  </div>
                  {/* 👇 COMING SOON TAG */}
                  <span className="
                    px-2 py-0.5
                    rounded-full
                    text-[9px]
                    font-black
                    uppercase
                    tracking-widest
                    bg-amber-100
                    text-amber-800
                    border border-amber-300
                    whitespace-nowrap
                  ">
                    Coming Soon
                  </span>
                </div>
              </div>

              <ChatContainer 
                messages={matchMessages} 
                loading={loading} 
                variant="tactical" 
                emptyMessage={matchId ? "Decrypting tactical transmissions..." : "Select a match from the schedule to enter the War Room."}
                placeholder="WAR ROOM LOCKED FOR PHASE 1..." 
              />
            </section>

            {/* GLOBAL DISCUSSIONS – FLOWING GRID */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200 rounded-xl">
                    <Globe className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase leading-tight">
                      Global Discourse
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Community Analysis
                    </p>
                  </div>
                  <span className="
                    px-2 py-0.5
                    rounded-full
                    text-[9px]
                    font-black
                    uppercase
                    tracking-widest
                    bg-amber-100
                    text-amber-800
                    border border-amber-300
                    whitespace-nowrap
                  ">
                    Coming Soon
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingState message="Gathering community intel..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {globalMessages.map(post => (
                    <DiscussionCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- CHAT CONTAINER (UNCHANGED) ----------------

function ChatContainer({ messages, loading, variant, placeholder, emptyMessage }: any) {
  const isTactical = variant === "tactical";

  return (
    <div className={cn(
      "flex flex-col h-[600px] border rounded-[2rem] overflow-hidden transition-all shadow-xl relative",
      isTactical 
        ? "bg-slate-950 border-slate-800 shadow-accent/5" 
        : "bg-white border-slate-200 shadow-slate-200/50"
    )}>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingState message="Syncing Transmissions..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-10">
            <MessageSquare className={cn("h-12 w-12 mb-4", isTactical ? "text-slate-700" : "text-slate-200")} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
              {emptyMessage}
            </p>
          </div>
        ) : (
          messages.map((m: DiscussionPost) => (
            <div key={m.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 rounded-full bg-accent" />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                    {m.author.name}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="p-4 rounded-2xl border bg-slate-900 border-slate-800 text-slate-200">
                <p className="text-sm font-medium italic">"{m.content}"</p>
                <Zap className="absolute top-2 right-2 h-3 w-3 text-accent opacity-20" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className={cn(
        "p-6 border-t",
        isTactical ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-100"
      )}>
        <input
          disabled
          placeholder={placeholder}
          className="w-full rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-not-allowed italic bg-slate-950 text-slate-600"
        />
      </div>
    </div>
  );
}
