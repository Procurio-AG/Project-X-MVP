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
      setMessage("Please enter your name and a valid email.");
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
        setMessage("You're in! We’ll reach out when things are ready.");
        setName("");
        setEmail("");
      } else if (res.status === 409) {
        setStatus("error");
        setMessage("Looks like this email is already on the list.");
      } else {
        throw new Error("Unexpected error");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again in a bit.");
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8 md:p-12 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Want early access?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We’re building something for cricket fans who want more than just scores.
          Join the waitlist to be among the first to try STRYKER.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="flex flex-col gap-3 mb-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Your name"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              disabled={status === "loading" || status === "success"}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Your email address"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
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
          {status === "loading"
            ? "Adding you…"
            : status === "success"
            ? "You're on the list"
            : "Join the waitlist"}
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
          No spam. Just product updates. Unsubscribe anytime.
        </p>
      </form>

      {/* Benefits (clean, text-only) */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <h3 className="font-semibold text-foreground mb-1">
            Early access
          </h3>
          <p className="text-sm text-muted-foreground">
            Try features before public launch.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-1">
            Smarter insights
          </h3>
          <p className="text-sm text-muted-foreground">
            Context and analysis that go beyond raw stats.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-1">
            Built for fans
          </h3>
          <p className="text-sm text-muted-foreground">
            Designed around how serious fans follow the game.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WaitlistCard;
