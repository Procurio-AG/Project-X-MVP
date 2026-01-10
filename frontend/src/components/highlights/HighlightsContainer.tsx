import { useState } from "react";
import { Play } from "lucide-react";
import HighlightsFloatingPlayer from "./HighlightsFloatingPlayer";

export default function HighlightsContainer({
  highlightsUrl,
}: {
  highlightsUrl?: string | null;
}) {
  // Mobile-only visibility state
  const [mobileVisible, setMobileVisible] = useState(false);

  if (!highlightsUrl) return null;

  return (
    <>
      {/* ---------------- DESKTOP ---------------- */}
      {/* Always visible PiP on desktop */}
      <div className="hidden md:block">
        <HighlightsFloatingPlayer url={highlightsUrl} />
      </div>

      {/* ---------------- MOBILE ---------------- */}
      {/* Floating button (only when player is hidden) */}
      {!mobileVisible && (
        <button
          onClick={() => setMobileVisible(true)}
          className="
            fixed bottom-24 right-6 z-50
            md:hidden
            flex items-center gap-2
            bg-slate-900 text-white
            px-5 py-3 rounded-full
            shadow-2xl border border-white/10
          "
          aria-label="Show highlights"
        >
          <Play className="h-4 w-4 fill-current" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Highlights
          </span>
        </button>
      )}

      {/* Mobile player (only when visible) */}
      {mobileVisible && (
        <div className="md:hidden">
          <HighlightsFloatingPlayer
            url={highlightsUrl}
            onHide={() => setMobileVisible(false)}
          />
        </div>
      )}
    </>
  );
}
