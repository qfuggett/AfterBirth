import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, BookOpen, CalendarPlus, ChevronDown, FileSearch, HelpCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginTag } from "@/components/app/bits";
import type { Explanation } from "@/lib/assist-validation";
import { newId, notifyChange, store } from "@/lib/db";
import { getTopic } from "@/content/topics";

const RELATED: Record<string, string[]> = {
  medicines: ["home-medications", "pain-plan"],
  "wound-care": ["cesarean-recovery", "vaginal-recovery"],
  appointments: ["followup", "paperwork"],
  activity: ["pelvic-floor-sex", "rest-support"],
  "food-and-drink": ["food-drink-movement"],
  "baby-care": ["newborn-basics", "safe-sleep"],
  feeding: ["feeding-support"],
  "when-to-get-help": [],
};

export function ExplanationView({
  explanation,
  source,
  resourceId,
  onShowPage,
  blockedReminderQuotes = [],
}: {
  explanation: Explanation;
  source: { kind: "ai"; model: string } | { kind: "demo" };
  resourceId: string;
  onShowPage: (page: number) => void;
  blockedReminderQuotes?: string[];
}) {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  const askClarify = async (quote: string, reason?: string) => {
    const id = newId();
    await store.putQuestion({
      id,
      text: `My instructions say “${quote.slice(0, 200)}”. Could you clarify what this means for me?`,
      concern: reason ? `Clarify: ${reason.slice(0, 60)}` : "Clarify my instructions",
      discussed: false,
      wordedBy: "template",
      createdAt: Date.now(),
    });
    notifyChange();
    toast.success("Clarification question saved", {
      action: { label: "Show", onClick: () => navigate({ to: "/questions/$questionId", params: { questionId: id } }) },
    });
  };

  const related = [...new Set(explanation.sections.flatMap((s) => RELATED[s.type] ?? []))]
    .map((id) => getTopic(id))
    .filter((t): t is NonNullable<typeof t> => !!t);
  const hasHelp = explanation.sections.some((s) => s.type === "when-to-get-help");

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <OriginTag origin={source.kind === "demo" ? "demo" : "ai"} detail={source.kind === "ai" ? source.model : "written by the app team, not AI"} />
        <p className="text-[1.1rem]">{explanation.summary}</p>
        <p className="text-[0.9rem] text-muted-foreground">
          Each line below links to the passage it came from. Your original document always wins.
        </p>
      </div>

      {/* Problems first, never collapsed */}
      {explanation.unclear.length || explanation.conflicts.length || explanation.missingPages ? (
        <section className="space-y-3 rounded-3xl border-2 border-caution bg-caution-soft p-4" aria-labelledby="check-h">
          <h3 id="check-h" className="flex items-center gap-2 text-xl font-semibold">
            <AlertTriangle className="h-5 w-5 text-caution" aria-hidden /> Needs checking with your care team
          </h3>
          {explanation.unclear.map((u, i) => (
            <div key={`u${i}`} className="rounded-2xl bg-paper p-3">
              <p className="text-[0.82rem] font-bold uppercase tracking-wide text-caution">Unclear · not guessed</p>
              <p className="mt-1 font-semibold">“{u.sourceQuote}”</p>
              <p className="text-[0.95rem]">{u.reason}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => askClarify(u.sourceQuote, u.reason)}>
                <HelpCircle aria-hidden /> Prepare a question about this
              </Button>
            </div>
          ))}
          {explanation.conflicts.map((c, i) => (
            <div key={`c${i}`} className="rounded-2xl bg-paper p-3">
              <p className="flex items-center gap-1.5 text-[0.82rem] font-bold uppercase tracking-wide text-caution">
                <Scale className="h-4 w-4" aria-hidden /> These instructions disagree
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 font-semibold">
                {c.quotes.map((q) => (
                  <li key={q}>“{q}”</li>
                ))}
              </ul>
              <p className="text-[0.95rem]">{c.reason} The app won't choose between them.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => askClarify(c.quotes.join("” and “"), "conflicting instructions")}>
                <HelpCircle aria-hidden /> Prepare a question about this
              </Button>
            </div>
          ))}
          {explanation.missingPages ? (
            <div className="rounded-2xl bg-paper p-3">
              <p className="text-[0.82rem] font-bold uppercase tracking-wide text-caution">Possibly missing pages</p>
              <p>{explanation.missingPages}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {explanation.sections.map((s) => (
        <section key={s.title} className="space-y-2" aria-label={s.title}>
          <h3 className={s.type === "when-to-get-help" ? "text-xl font-semibold text-urgent" : "text-xl font-semibold"}>{s.title}</h3>
          <ul className="space-y-2">
            {s.items.map((it, i) => (
              <ItemRow key={i} item={it} onShowPage={onShowPage} />
            ))}
          </ul>
        </section>
      ))}

      {explanation.droppedUnsourced > 0 ? (
        <p className="rounded-2xl bg-muted px-4 py-3 text-[0.92rem]">
          {explanation.droppedUnsourced} AI statement{explanation.droppedUnsourced > 1 ? "s were" : " was"} removed because
          {explanation.droppedUnsourced > 1 ? " they" : " it"} couldn't be matched to your document.
        </p>
      ) : null}

      {explanation.reminders.length ? (
        <section className="space-y-2 rounded-3xl bg-paper p-4 shadow-soft" aria-labelledby="rem-h">
          <h3 id="rem-h" className="flex items-center gap-2 text-xl font-semibold">
            <CalendarPlus className="h-5 w-5 text-sage" aria-hidden /> Proposed checklist items
          </h3>
          <p className="text-[0.92rem] text-muted-foreground">Nothing is added until you confirm each one against your document.</p>
          <ul className="space-y-2">
            {explanation.reminders.map((r) => {
              const blocked = blockedReminderQuotes.some((q) => r.sourceQuote.includes(q) || q.includes(r.sourceQuote));
              const done = confirmed.has(r.sourceQuote);
              return (
                <li key={r.sourceQuote} className="rounded-2xl border border-border p-3">
                  <p className="font-semibold">{r.text}</p>
                  <p className="text-[0.88rem] text-muted-foreground">From: “{r.sourceQuote}”</p>
                  {blocked ? (
                    <p className="mt-1 text-[0.9rem] font-semibold text-caution">Can't be added: this passage is flagged as unclear.</p>
                  ) : (
                    <Button
                      size="sm"
                      variant={done ? "secondary" : "outline"}
                      className="mt-2"
                      disabled={done}
                      onClick={async () => {
                        await store.putReminder({ id: newId(), text: r.text, sourceQuote: r.sourceQuote, resourceId, confirmedAt: Date.now() });
                        notifyChange();
                        setConfirmed(new Set([...confirmed, r.sourceQuote]));
                        toast.success("Added to your checklist in My care");
                      }}
                    >
                      {done ? "Added" : "I checked it. Add to checklist"}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {related.length || hasHelp ? (
        <section className="space-y-2 rounded-3xl bg-sage-soft p-4" aria-labelledby="edu-h">
          <h3 id="edu-h" className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5" aria-hidden /> General guide information
          </h3>
          <p className="text-[0.92rem]">Background reading only. These pages are not your personal instructions.</p>
          <ul className="space-y-1">
            {hasHelp ? (
              <li>
                <Link to="/help" className="font-semibold text-urgent underline">
                  Get help now: warning signs
                </Link>
              </li>
            ) : null}
            {related.map((t) => (
              <li key={t.id}>
                <Link to="/topics/$topicId" params={{ topicId: t.id }} className="font-semibold underline">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ItemRow({ item, onShowPage }: { item: Explanation["sections"][number]["items"][number]; onShowPage: (p: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl bg-paper p-3 shadow-soft">
      <p className="text-[1.05rem]">{item.explanation}</p>
      {item.fellBackToOriginal ? (
        <p className="mt-1 text-[0.85rem] text-muted-foreground">Shown in the original wording to keep every number exact.</p>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="mt-1 inline-flex min-h-10 items-center gap-1 text-[0.92rem] font-semibold text-primary"
      >
        <FileSearch className="h-4 w-4" aria-hidden />
        Original passage{item.page ? ` (page ${item.page})` : ""}
        <ChevronDown className={open ? "h-4 w-4 rotate-180 transition-transform" : "h-4 w-4 transition-transform"} aria-hidden />
      </button>
      {open ? (
        <div className="mt-1 rounded-xl bg-muted p-3">
          <OriginTag origin="ocr" />
          <p className="mt-2 font-semibold">“{item.sourceQuote}”</p>
          {item.page ? (
            <button type="button" onClick={() => onShowPage(item.page!)} className="mt-1 text-[0.92rem] font-semibold underline">
              View page {item.page} of your original
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
