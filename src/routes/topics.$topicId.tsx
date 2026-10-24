import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { z } from "zod";
import { AlertTriangle, ArrowRight, BookmarkPlus, MessageCircleQuestion, Pause, Volume2, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";
import { BackLink, DraftNotice, Illustration, OriginTag, Page } from "@/components/app/bits";
import { SourceList } from "@/components/app/SourceList";
import { Button } from "@/components/ui/button";
import { GUIDE_SECTIONS, getTopic, type Topic } from "@/content/topics";
import { IMAGES } from "@/lib/images";
import { usePrefs } from "@/lib/prefs";
import { useSpeech } from "@/lib/hooks";
import { newId, notifyChange, store } from "@/lib/db";
import { cn } from "@/lib/utils";

const search = z.object({
  section: z.string().max(40).optional(),
  q: z.string().max(500).optional(),
  via: z.enum(["gemma", "search", "choice"]).optional(),
  model: z.string().max(80).optional(),
});

export const Route = createFileRoute("/topics/$topicId")({
  validateSearch: search,
  loader: ({ params }) => {
    if (params.topicId === "urgent-maternal") throw redirect({ to: "/help", search: { for: "me" } });
    if (params.topicId === "urgent-baby") throw redirect({ to: "/help", search: { for: "baby" } });
    const topic = getTopic(params.topicId);
    if (!topic) throw notFound();
    return { topicId: topic.id };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? getTopic(loaderData.topicId) : undefined;
    return {
      meta: t
        ? [
            { title: `${t.title} — After Birth` },
            { name: "description", content: t.summary },
            { property: "og:title", content: t.title },
            { property: "og:description", content: t.summary },
          ]
        : [{ title: "Guide page — After Birth" }, { name: "robots", content: "noindex" }],
    };
  },
  component: TopicPage,
});

const STAGE_LABEL: Record<string, string> = {
  hospital: "In the hospital",
  hospital_and_home: "Hospital & home",
  discharge: "Going home",
  home: "At home",
  complication: "Complications",
};

function TopicPage() {
  const { topicId } = Route.useLoaderData();
  const topic = getTopic(topicId)!;
  const { section, q, via, model } = Route.useSearch();
  const { update } = usePrefs();
  const speech = useSpeech();
  const img = IMAGES[topic.image];

  useEffect(() => {
    update({ lastTopicId: topic.id });
  }, [topic.id, update]);

  useEffect(() => {
    if (!section) return;
    const el = document.getElementById(`sec-${section}`);
    if (!el) return;
    if (el instanceof HTMLDetailsElement) el.open = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      el.classList.add("highlighted");
      (el.querySelector("h2, summary") as HTMLElement | null)?.focus?.({ preventScroll: true });
    }, 150);
    return () => clearTimeout(t);
  }, [section, topic.id]);

  const readAloud = () => {
    const parts = [topic.title, topic.summary, `${topic.next.title}. ${topic.next.text}`, ...(topic.keyFacts ?? [])];
    speech.speak(parts.join(". "));
  };

  const saveQuestion = async (text: string) => {
    await store.putQuestion({
      id: newId(),
      text,
      concern: topic.title,
      topicId: topic.id,
      discussed: false,
      wordedBy: "template",
      createdAt: Date.now(),
    });
    notifyChange();
    toast.success("Saved to Questions");
  };

  const sectionFor = GUIDE_SECTIONS.find((s) => (s.stages as readonly string[]).includes(topic.stage));

  return (
    <Page className="space-y-6 pb-6">
      <BackLink fallback={sectionFor ? `/sections/${sectionFor.id}` : "/"} />

      {q ? <AskBanner q={q} via={via} model={model} /> : null}

      <header className="space-y-4">
        <Illustration src={img.src} alt={img.alt} priority className="aspect-[16/9]" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-[0.82rem] font-bold text-ink-soft">
            {STAGE_LABEL[topic.stage] ?? topic.stage}
          </span>
          <OriginTag origin="guide" />
        </div>
        <h1 className="text-[2rem] font-semibold leading-tight">{topic.title}</h1>
      </header>

      <Block id="summary" active={section}>
        <p className="text-[1.18rem] leading-relaxed">{topic.summary}</p>
      </Block>

      <Block id="next" active={section}>
        <div className="rounded-3xl bg-primary-soft p-5 text-accent-foreground">
          <p className="text-[0.85rem] font-bold uppercase tracking-wide">Most important</p>
          <h2 className="mt-1 text-xl font-semibold text-accent-foreground">{topic.next.title}</h2>
          <p className="mt-1 text-[1.05rem] text-foreground">{topic.next.text}</p>
        </div>
      </Block>

      {topic.urgent ? (
        <Link
          to="/help"
          search={{ for: topic.urgent === "baby" ? "baby" : "me" }}
          className="flex items-center gap-3 rounded-2xl border-2 border-urgent bg-urgent-soft px-4 py-3 font-semibold text-urgent"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <span className="flex-1">Warning signs that need care right away</span>
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      ) : null}

      {topic.keyFacts?.length ? (
        <Block id="key-facts" active={section}>
          <div className="rounded-3xl border-2 border-border bg-paper p-5">
            <h2 className="text-xl font-semibold">Important to know</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              {topic.keyFacts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </Block>
      ) : null}

      {topic.draftLevel === "outline" ? (
        <p className="rounded-2xl bg-caution-soft px-4 py-3 text-[0.98rem]">
          <strong>Research outline.</strong> {topic.outlineNote}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="sage">
          <Link to="/questions/new" search={{ topic: topic.id }}>
            <MessageCircleQuestion aria-hidden />
            Help me ask about this
          </Link>
        </Button>
        {speech.supported ? (
          <Button variant="outline" onClick={speech.speaking ? speech.stop : readAloud} aria-pressed={speech.speaking}>
            {speech.speaking ? <Pause aria-hidden /> : <Volume2 aria-hidden />}
            {speech.speaking ? "Stop reading" : "Read aloud"}
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        {topic.mayHappen?.length ? (
          <Detail id="what-may-happen" title="What may happen" active={section}>
            <ul className="list-disc space-y-1.5 pl-5">
              {topic.mayHappen.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </Detail>
        ) : null}
        {topic.why?.length ? (
          <Detail id="why" title="Why" active={section}>
            {topic.why.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </Detail>
        ) : null}
        {topic.varies?.length ? (
          <Detail id="what-varies" title="What varies" active={section}>
            {topic.varies.map((x) => (
              <p key={x} className="mb-2 last:mb-0">
                {x}
              </p>
            ))}
          </Detail>
        ) : null}
      </div>

      {topic.questions.length ? (
        <Block id="questions" active={section}>
          <h2 className="text-2xl font-semibold">Questions to ask</h2>
          <ul className="mt-3 space-y-2">
            {topic.questions.map((qq) => (
              <li key={qq} className="flex items-center gap-2 rounded-2xl bg-paper p-3 pl-4 shadow-soft">
                <span className="flex-1">{qq}</span>
                <button
                  type="button"
                  onClick={() => saveQuestion(qq)}
                  className="tap inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.92rem] font-semibold text-primary hover:bg-primary-soft"
                >
                  <BookmarkPlus className="h-5 w-5" aria-hidden />
                  Save
                </button>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      <DraftNotice compact outline={topic.draftLevel === "outline"} />

      <Block id="sources" active={section}>
        <h2 className="text-2xl font-semibold">Sources</h2>
        <p className="mt-1 text-[0.95rem] text-muted-foreground">
          Summaries are drafted from these public sources. No hospital has endorsed this app.
        </p>
        <div className="mt-3">
          <SourceList sources={topic.sources} />
        </div>
      </Block>
    </Page>
  );
}

function AskBanner({ q, via, model }: { q: string; via?: string; model?: string }) {
  return (
    <div className="rounded-2xl bg-sage-soft px-4 py-3 text-secondary-foreground">
      <p className="flex items-center gap-2 text-[0.85rem] font-bold uppercase tracking-wide">
        {via === "gemma" ? <Sparkles className="h-4 w-4" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
        {via === "gemma" ? `Matched by Gemma${model ? ` (${model})` : ""}` : via === "choice" ? "You chose this page" : "Matched by title search"}
      </p>
      <p className="mt-1 text-foreground">For your question: “{q}”</p>
      <Link to="/ask" search={{ q }} className="mt-1 inline-block text-[0.92rem] font-semibold underline">
        Not right? See other matches
      </Link>
    </div>
  );
}

function Block({ id, active, children }: { id: string; active?: string; children: ReactNode }) {
  return (
    <section id={`sec-${id}`} aria-labelledby={undefined} className={cn("scroll-mt-24 p-0.5", active === id && "highlighted")}>
      {children}
    </section>
  );
}

function Detail({ id, title, active, children }: { id: string; title: string; active?: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details
      ref={ref}
      id={`sec-${id}`}
      open={active === id ? true : undefined}
      className="group scroll-mt-24 rounded-3xl bg-paper shadow-soft open:shadow-lift"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-muted text-lg transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="px-5 pb-5 text-[1.02rem]">{children}</div>
    </details>
  );
}

export type { Topic };
