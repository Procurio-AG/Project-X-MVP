// frontend/src/components/AboutUsCard.tsx

import { ArrowRight, Zap, Users, Shield } from "lucide-react";

export default function AboutUsCard() {
  return (
    <div className="relative w-full max-w-7xl mx-auto overflow-hidden">
      {/* Reduced grid gap from 12 to 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-8 items-center">
        
        {/* Left Side: Massive Vertical Typography */}
        <div className="hidden lg:block select-none">
          <h2 className="text-[100px] font-black leading-none tracking-tighter text-foreground/10 uppercase [writing-mode:vertical-lr] rotate-180">
            Our Mission
          </h2>
        </div>

        {/* Right Side: Editorial Content */}
        {/* Reduced vertical spacing from space-y-16 to space-y-10 */}
        <div className="space-y-10">
          <div className="max-w-3xl">
            {/* Reduced margin-bottom from mb-8 to mb-4 */}
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
              Cricket has no shortage of content. <br />
              <span className="text-accent">It lacks clarity.</span>
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
              STRYKER is built to focus on what actually matters—the game, the numbers, 
              and the conversations around it. No clickbait, just high-fidelity insights.
            </p>
          </div>

          {/* Pillars Grid */}
          {/* Reduced gap from 12 to 8 and pt from 12 to 8 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border/50 pt-8">
            <div className="group">
              <div className="mb-3 p-2.5 w-fit rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-base font-bold mb-1 uppercase tracking-wider">Fast Updates</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Live scores delivered via proprietary low-latency engines.
              </p>
            </div>

            <div className="group">
              <div className="mb-3 p-2.5 w-fit rounded-xl bg-accent/5 group-hover:bg-accent/10 transition-colors">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <h4 className="text-base font-bold mb-1 uppercase tracking-wider">Community</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A space for tactical discourse, free from traditional social media noise.
              </p>
            </div>

            <div className="group">
              <div className="mb-3 p-2.5 w-fit rounded-xl bg-live/5 group-hover:bg-live/10 transition-colors">
                <Shield className="h-5 w-5 text-live" />
              </div>
              <h4 className="text-base font-bold mb-1 uppercase tracking-wider">Verified Data</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Clean presentation of data you can trust from verified analytics.
              </p>
            </div>
          </div>

          {/* Learn More / CTA */}
          {/* Reduced pt from 8 to 4 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
            <a
              href="#waitlist"
              className="group flex items-center gap-2 px-7 py-3.5 bg-foreground text-background rounded-full font-bold hover:bg-accent hover:text-white transition-all duration-300 text-sm"
            >
              Join the Command Center
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              If you follow the game seriously, you’re already home.
            </p>
          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}