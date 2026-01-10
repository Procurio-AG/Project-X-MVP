// frontend/src/components/Layout.tsx

import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import WaitlistModal from "./WaitlistModal";
import MobileBottomNav from "./MobileBottomNav";

export default function Layout() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar
        variant={isHome ? "hero" : "solid"}
        onWaitlistClick={() => setWaitlistOpen(true)}
      />

      {/* Main Content */}
      <main
        className={`
          ${isHome ? "" : "pt-16"}
          pb-16 md:pb-0
        `}
      >
        <Outlet />
      </main>
      
      {/* Footer — DESKTOP ONLY */}
      <footer className="hidden md:block border-t border-border bg-card mt-16">
        <div className="container-content py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="font-display text-base font-bold text-primary-foreground">
                    S
                  </span>
                </div>
                <span className="font-display text-lg font-bold text-foreground">
                  STRYKER
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                The ultimate destination for serious cricket fans. Live scores,
                expert analysis, and intelligent discussions — all in one place.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/live" className="hover:text-foreground">
                    Live Scores
                  </Link>
                </li>
                <li>
                  <Link to="/schedule" className="hover:text-foreground">
                    Match Schedule
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">
                Stay Updated
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Join our waitlist for early access.
              </p>
              <button
                onClick={() => setWaitlistOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Join Waitlist
              </button>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} STRYKER. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
