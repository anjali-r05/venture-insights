import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary glow">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        Venture<span className="text-gradient">Bots</span>
      </span>
    </Link>
  );
}
