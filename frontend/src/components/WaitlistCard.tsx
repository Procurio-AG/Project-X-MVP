import { useState } from "react";
import { Mail, CheckCircle, AlertCircle, User } from "lucide-react";

function WaitlistCard() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter your name and a valid email address");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/waitlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email }),
        }
      );

      if (res.status === 201) {
        setStatus("success");
        setMessage("You're on the list! We'll be in touch soon.");
        setName("");
        setEmail("");
      } else if (res.status === 409) {
        setStatus("error");
        setMessage("This email is already on the waitlist.");
      } else {
        throw new Error("Unexpected error");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8 md:p-12 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Join the Waitlist
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Get early access to premium features, exclusive insights, and personalized cricket analytics. 
          Be part of the revolution in cricket coverage.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="flex flex-col gap-3 mb-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Enter your name"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
              disabled={status === "loading" || status === "success"}
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Enter your email address"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
              disabled={status === "loading" || status === "success"}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Joining..." : status === "success" ? "Joined!" : "Join Now"}
        </button>

        {/* Status Messages */}
        {status === "success" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground text-center">
          By joining, you agree to receive updates about STRYKER. Unsubscribe anytime.
        </p>
      </form>

      {/* Additional Benefits */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">Early Access</h3>
          <p className="text-sm text-muted-foreground">Be first to try new features</p>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">Exclusive Insights</h3>
          <p className="text-sm text-muted-foreground">Advanced analytics & predictions</p>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">Community Access</h3>
          <p className="text-sm text-muted-foreground">Connect with cricket experts</p>
        </div>
      </div>
    </div>
  );
}

export default WaitlistCard;