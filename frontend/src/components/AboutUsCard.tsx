import { Target, Users, Zap, Shield } from "lucide-react";

function AboutUsCard() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Main Header */}
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          About STRYKER
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          We believe in <span className="text-primary font-semibold">clarity over noise</span>. 
          In a world drowning in cricket content, we deliver what matters — live scores, 
          intelligent analysis, and meaningful discussions.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-lg p-8 md:p-10 mb-12">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To create the ultimate cricket command center for serious fans who demand precision, 
              speed, and substance. No clutter, no distractions — just the cricket intelligence you need.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-3">Real-Time Updates</h3>
          <p className="text-muted-foreground">
            Lightning-fast live scores and ball-by-ball commentary. Stay ahead of every delivery, 
            every wicket, every moment that matters.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4">
            <Users className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-3">Expert Community</h3>
          <p className="text-muted-foreground">
            Join discussions with passionate fans and cricket analysts. Share insights, 
            debate strategies, and connect with people who truly understand the game.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-live/10 rounded-lg mb-4">
            <Shield className="h-6 w-6 text-live" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-3">Trusted Data</h3>
          <p className="text-muted-foreground">
            Accurate, verified information from reliable sources. We prioritize quality and 
            precision in every stat, every score, every piece of analysis.
          </p>
        </div>
      </div>

      {/* What Makes Us Different */}
      <div className="bg-card border border-border rounded-lg p-8 md:p-10">
        <h3 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
          What Makes Us Different
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">No Fluff, Just Cricket</h4>
              <p className="text-sm text-muted-foreground">
                We cut through the noise. Every feature, every piece of content serves a purpose — 
                keeping you informed and engaged with the game you love.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Built for Fans, By Fans</h4>
              <p className="text-sm text-muted-foreground">
                Created by cricket enthusiasts who understand what serious fans need. 
                We're not just building a platform — we're building a home for cricket lovers.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Intelligent Design</h4>
              <p className="text-sm text-muted-foreground">
                Clean, intuitive interface that gets out of your way. Access everything you need 
                with minimal clicks — because your time is valuable.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Always Evolving</h4>
              <p className="text-sm text-muted-foreground">
                Continuous improvements based on user feedback. We listen, we adapt, 
                and we deliver features that matter to our community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Ready to experience cricket coverage done right?
        </p>
        <a
          href="#waitlist"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Join Our Community
        </a>
      </div>
    </div>
  );
}

export default AboutUsCard;