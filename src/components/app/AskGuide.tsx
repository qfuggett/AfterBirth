import { useNavigate } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

export function AskGuide({ initial = "", className, autoFocus }: { initial?: string; className?: string; autoFocus?: boolean }) {
  const [q, setQ] = useState(initial);
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (v.length < 2) return;
    navigate({ to: "/ask", search: { q: v } });
  };
  return (
    <form role="search" onSubmit={submit} className={cn("relative", className)}>
      <label htmlFor="ask-guide" className="mb-2 block font-display text-lg font-semibold">
        Ask the guide
      </label>
      <div className="flex items-center gap-2 rounded-full border-2 border-input bg-paper py-1.5 pl-4 pr-1.5 shadow-soft focus-within:border-primary">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          id="ask-guide"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Why do they keep checking my bleeding?"
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={autoFocus}
          maxLength={500}
          className="min-h-11 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground/80"
        />
        <button
          type="submit"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          disabled={q.trim().length < 2}
          aria-label="Ask"
        >
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <p className="mt-2 px-1 text-[0.88rem] text-muted-foreground">
        Finds the right guide page. It doesn't write medical answers.
      </p>
    </form>
  );
}
