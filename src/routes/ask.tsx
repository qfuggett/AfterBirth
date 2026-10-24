import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowRight, Loader2, Search, Sparkles } from "lucide-react";
import { AskGuide } from "@/components/app/AskGuide";
import { BackLink, Page } from "@/components/app/bits";
import { UrgentHelpContent } from "@/components/app/UrgentHelp";
import { getTopic } from "@/content/topics";
import { routeQuestion, type RouteResult } from "@/lib/guide.functions";
import { searchTopics } from "@/lib/search";
import { checkUrgent } from "@/lib/urgent";

export const Route = createFileRoute("/ask")({
  validateSearch: z.object({ q: z.string().max(500).optional() }),
  head: () => ({
    meta: [
      { title: "Ask the guide — After Birth" },
      { name: "description", content: "Type a question in your own words and open the matching guide page." },
      { property: "og:title", content: "Ask the guide — After Birth" },
      { property: "og:description", content: "Type a question in your own words and open the matching guide page." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AskPage,
});

function AskPage() {
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate();
  const route = useServerFn(routeQuestion);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [pending, setPending] = useState(false);

  const urgent = useMemo(() => checkUrgent(q), [q]);
  const hits = useMemo(() => searchTopics(q, 6), [q]);

  useEffect(() => {
    if (q.trim().length < 2) return;
    let cancelled = false;
    setResult(null);
    setPending(true);
    route({ data: { question: q } })
      .then((r) => {
        if (cancelled) return;
        setResult(r);
        // Only auto-open a page when nothing suggests an urgent concern.
        if (r.ok && r.decision.action === "open_page" && !urgent.urgent) {
          navigate({
            to: "/topics/$topicId",
            params: { topicId: r.decision.topicId },
            search: { section: r.decision.sectionId ?? undefined, q, via: "gemma", model: r.model },
            replace: true,
          });
        }
      })
      .catch(() => !cancelled && setResult({ ok: false, reason: "upstream_error", message: "Could not reach the guide service." }))
      .finally(() => !cancelled && setPending(false));
    return () => {
      cancelled = true;
    };
  }, [q, route, navigate, urgent.urgent]);

  const gemmaUrgent = result?.ok && result.decision.action === "urgent_help" ? result.decision.audience : null;
  const showUrgent = urgent.urgent || !!gemmaUrgent;
  const audience = gemmaUrgent ?? urgent.audience;

  return (
    <Page className="space-y-6 pb-6">
      <BackLink fallback="/" label="Guide" />
      <AskGuide initial={q} key={q} />

      {!q ? null : (
        <>
          {showUrgent ? (
            <section aria-labelledby="urgent-lead" className="space-y-3 rounded-3xl border-2 border-urgent bg-urgent-soft p-5">
              <h2 id="urgent-lead" className="flex items-center gap-2 text-2xl font-semibold text-urgent">
                <AlertTriangle className="h-6 w-6" aria-hidden />
                This may need care now
              </h2>
              <p>
                Your question mentions something that can be urgent. This app can't tell how serious it is. If you
                have these symptoms now, get medical care right away.
              </p>
              <UrgentHelpContent audience={audience === "baby" ? "baby" : "maternal"} compact />
            </section>
          ) : urgent.mentionsWarningSymptom ? (
            <Link to="/help" className="flex items-center gap-3 rounded-2xl bg-urgent-soft px-4 py-3 font-semibold text-urgent">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
              <span className="flex-1">If this is happening now, see Get help now.</span>
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          ) : null}

          <GemmaStatus pending={pending} result={result} q={q} urgentShown={showUrgent} />

          <section aria-labelledby="title-matches" className="space-y-3">
            <h2 id="title-matches" className="flex items-center gap-2 text-xl font-semibold">
              <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
              {showUrgent ? "Related reading, after you get help" : "Title matches"}
            </h2>
            {hits.length ? (
              <ul className="space-y-2">
                {hits.map(({ topic }) => (
                  <li key={topic.id}>
                    <Link
                      to="/topics/$topicId"
                      params={{ topicId: topic.id }}
                      search={{ q, via: "search" }}
                      className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3 shadow-soft hover:shadow-lift"
                    >
                      <span className="flex-1 font-semibold">{topic.title}</span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No title matches. Try different words, or{" "}
                <Link to="/" className="font-semibold underline">
                  browse the guide
                </Link>
                .
              </p>
            )}
          </section>
        </>
      )}
    </Page>
  );
}

function GemmaStatus({ pending, result, q, urgentShown }: { pending: boolean; result: RouteResult | null; q: string; urgentShown: boolean }) {
  if (pending) {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Finding the best page… this can take up to a minute.
      </p>
    );
  }
  if (!result) return null;
  if (!result.ok) {
    return (
      <p className="rounded-2xl bg-muted px-4 py-3 text-[0.95rem]" role="status">
        <strong>Smart matching is unavailable</strong>
        {result.reason === "not_configured" ? " (not set up yet)" : ""}. Showing plain title matches instead.
      </p>
    );
  }
  const d = result.decision;
  if (d.action === "open_page" && urgentShown) {
    const t = getTopic(d.topicId);
    return t ? (
      <Link
        to="/topics/$topicId"
        params={{ topicId: t.id }}
        search={{ q, via: "gemma", model: result.model, section: d.sectionId ?? undefined }}
        className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3 shadow-soft"
      >
        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
        <span className="flex-1">
          <span className="block text-[0.82rem] font-bold uppercase tracking-wide text-muted-foreground">Gemma's page match</span>
          <span className="font-semibold">{t.title}</span>
        </span>
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Link>
    ) : null;
  }
  if (d.action === "clarify") {
    return (
      <section className="rounded-3xl bg-paper p-5 shadow-soft" aria-labelledby="clarify-h">
        <h2 id="clarify-h" className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          Which is closest?
        </h2>
        <div className="mt-3 grid gap-2">
          {d.options.map((id) => {
            const t = getTopic(id)!;
            return (
              <Link
                key={id}
                to="/topics/$topicId"
                params={{ topicId: id }}
                search={{ q, via: "choice" }}
                className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-border px-4 py-3 font-semibold hover:border-primary"
              >
                <span className="flex-1">{t.title}</span>
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            );
          })}
        </div>
        <p className="mt-2 text-[0.88rem] text-muted-foreground">Suggested by Gemma ({result.model}).</p>
      </section>
    );
  }
  if (d.action === "no_match") {
    return (
      <p className="rounded-2xl bg-muted px-4 py-3" role="status">
        Gemma didn't find a matching guide page. Try the title matches below or browse the guide.
      </p>
    );
  }
  return null;
}
