// frontend/src/components/Navbar.tsx

import { useState, useEffect } from "react";
import { NavLink } from "./NavLink";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  variant?: "hero" | "solid";
  onWaitlistClick?: () => void;
}

export default function Navbar({
  variant = "solid",
  onWaitlistClick,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(variant !== "hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (variant !== "hero") {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  const handleWaitlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (onWaitlistClick) {
      onWaitlistClick();
    } else {
      document.getElementById("waitlist")?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      data-scrolled={isScrolled}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-content">
        <div className="flex items-center justify-between h-16">
          <NavLink
            to="/"
            className={cn(
              "font-display text-2xl font-bold transition-colors",
              isScrolled
                ? "!text-foreground"
                : "!text-white hover:!text-white"
            )}
          >
            STRYKER
          </NavLink>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/live">Live Scores</NavLink>
            <NavLink to="/schedule">Schedule</NavLink>

            <button
              onClick={handleWaitlistClick}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isScrolled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border border-white/20"
              )}
            >
              Join Waitlist
            </button>
          </div>

          <button
            className={cn(
              "md:hidden transition-colors",
              isScrolled ? "text-foreground" : "text-white"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            className={cn(
              "md:hidden py-4 border-t px-2 mt-2 rounded-xl mx-2",
              "backdrop-blur-xl shadow-2xl",
              variant === "hero" && !isScrolled
                ? "bg-black/70 border-white/10"
                : "bg-background/90 border-border/50"
            )}
          >
            <div className="flex flex-col gap-1">
              <NavLink
                to="/live"
                className={cn(
                  "px-4 py-3 rounded-lg transition-colors font-medium",
                  variant === "hero" && !isScrolled
                    ? "text-white hover:bg-white/10"
                    : "text-foreground hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Live Scores
              </NavLink>

              <NavLink
                to="/schedule"
                className={cn(
                  "px-4 py-3 rounded-lg transition-colors font-medium",
                  variant === "hero" && !isScrolled
                    ? "text-white hover:bg-white/10"
                    : "text-foreground hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Schedule
              </NavLink>

              <div className="pt-2 px-1">
                <button
                  onClick={handleWaitlistClick}
                  className="w-full px-4 py-3 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-lg"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
