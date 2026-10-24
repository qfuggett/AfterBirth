import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, FolderHeart, MessageCircleQuestion, MapPin, Phone, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Guide", icon: BookOpen, match: (p: string) => p === "/" || p.startsWith("/sections") || p.startsWith("/topics") || p.startsWith("/ask") || p.startsWith("/sources") },
  { to: "/care", label: "My care", icon: FolderHeart, match: (p: string) => p.startsWith("/care") },
  { to: "/questions", label: "Questions", icon: MessageCircleQuestion, match: (p: string) => p.startsWith("/questions") },
  { to: "/find-care", label: "Find care", icon: MapPin, match: (p: string) => p.startsWith("/find-care") },
] as const;

export function TopBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const onHelp = path.startsWith("/help");
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-2.5">
        <Link to="/" className="mr-auto flex items-center gap-2 rounded-lg py-1 pr-2" aria-label="After Birth, guide home">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft font-display text-lg font-semibold text-accent-foreground">
            a
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">After Birth</span>
        </Link>
        <Link
          to="/settings"
          className="tap grid place-items-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Settings and privacy"
        >
          <Settings className="h-5 w-5" aria-hidden />
        </Link>
        <Link
          to="/help"
          aria-current={onHelp ? "page" : undefined}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-urgent px-4 text-[0.95rem] font-bold text-urgent-foreground shadow-soft hover:bg-urgent/90"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Get help now
        </Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-paper/95 backdrop-blur safe-bottom"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map((t) => {
          const active = t.match(path);
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[0.82rem] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-14 place-items-center rounded-full transition-colors",
                    active ? "bg-primary-soft" : "bg-transparent",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
