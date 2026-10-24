import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ExternalLink, HeartHandshake } from "lucide-react";
import { CallButtons, UrgentHelpContent } from "@/components/app/UrgentHelp";
import { HospitalNumbersCard } from "@/components/app/HospitalPicker";
import { DraftNotice, Page } from "@/components/app/bits";
import { BABY_WARNING_SIGNS, CRISIS_LINES, MATERNAL_WARNING_SIGNS } from "@/content/help";
import { getSource } from "@/content/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/help")({
  validateSearch: z.object({ for: z.enum(["me", "baby"]).optional() }),
  head: () => ({
    meta: [
      { title: "Get help now — After Birth" },
      { name: "description", content: "Urgent warning signs after birth for parents and newborns, with emergency numbers." },
      { property: "og:title", content: "Get help now — After Birth" },
      { property: "og:description", content: "Urgent warning signs after birth for parents and newborns, with emergency numbers." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const { for: who = "me" } = Route.useSearch();
  const sourceIds = who === "baby" ? BABY_WARNING_SIGNS.sourceIds : MATERNAL_WARNING_SIGNS.sourceIds;

  return (
    <Page className="space-y-6 pb-6">
      <header>
        <h1 className="text-[2.1rem] font-semibold text-urgent">Get help now</h1>
        <p className="mt-1 text-lg">
          If this is an emergency, <strong>call 911</strong>. This app does not contact anyone for you.
        </p>
      </header>

      <a
        href="tel:911"
        className="flex min-h-16 items-center justify-center gap-3 rounded-full bg-urgent text-xl font-bold text-urgent-foreground shadow-lift"
      >
        Call 911
      </a>

      <div role="tablist" aria-label="Who needs help" className="grid grid-cols-2 gap-2 rounded-full bg-muted p-1.5">
        {(
          [
            ["me", "For me"],
            ["baby", "For my baby"],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            to="/help"
            search={{ for: id }}
            replace
            role="tab"
            aria-selected={who === id}
            className={cn(
              "flex min-h-12 items-center justify-center rounded-full font-bold",
              who === id ? "bg-paper text-urgent shadow-soft" : "text-muted-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <section className="rounded-3xl border-2 border-urgent bg-urgent-soft p-5" role="tabpanel">
        <h2 className="mb-3 text-2xl font-semibold">
          {who === "baby" ? "Newborn warning signs" : "Warning signs after birth"}
        </h2>
        <UrgentHelpContent audience={who === "baby" ? "baby" : "maternal"} />
      </section>

      {who === "me" ? (
        <section className="space-y-3 rounded-3xl bg-paper p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <HeartHandshake className="h-5 w-5 text-sage" aria-hidden />
            Emotional crisis or thoughts of harm
          </h2>
          <ul className="space-y-3">
            {CRISIS_LINES.filter((l) => l.id !== "911").map((l) => (
              <li key={l.id}>
                <p className="font-semibold">{l.label}</p>
                <p className="text-[0.95rem] text-muted-foreground">{l.detail}</p>
                {l.url ? (
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[0.92rem] font-semibold underline">
                    Official site <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
          <CallButtons />
        </section>
      ) : (
        <p className="rounded-2xl bg-muted px-4 py-3">{BABY_WARNING_SIGNS.note}</p>
      )}

      <HospitalNumbersCard />

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Where this list comes from</h2>
        <ul className="space-y-1 text-[0.95rem]">
          {sourceIds.map((id) => {
            const s = getSource(id);
            return s ? (
              <li key={id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  {s.publisher}: {s.title}
                </a>
                {s.published_or_revised ? ` (${s.published_or_revised})` : ""}
              </li>
            ) : null;
          })}
        </ul>
        <p className="text-[0.92rem] text-muted-foreground">
          These lists are not a diagnosis tool, and this app can't judge how serious a symptom is. Trust your instincts:
          if something feels wrong, get care.
        </p>
      </section>

      <DraftNotice compact />
    </Page>
  );
}
