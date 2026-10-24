import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Camera, HeartHandshake, MessageCircleQuestion, SlidersHorizontal, X } from "lucide-react";
import { AskGuide } from "@/components/app/AskGuide";
import { Page, Illustration } from "@/components/app/bits";
import { GUIDE_SECTIONS, getTopic, topicsForSection } from "@/content/topics";
import { IMAGES } from "@/lib/images";
import { usePrefs } from "@/lib/prefs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "After Birth — your postpartum guide" },
      {
        name: "description",
        content: "Calm, illustrated postpartum guidance for new parents and support people: hospital recovery, going home, home recovery and complications.",
      },
      { property: "og:title", content: "After Birth — your postpartum guide" },
      { property: "og:description", content: "Calm, illustrated postpartum guidance for new parents and support people." },
    ],
  }),
  component: Home,
});

function Home() {
  const { prefs, ready, update } = usePrefs();
  const featuredId =
    prefs.stage === "going-home" ? "going-home" : prefs.stage === "home" ? "at-home" : "hospital";
  const featured = GUIDE_SECTIONS.find((s) => s.id === featuredId)!;
  const others = GUIDE_SECTIONS.filter((s) => s.id !== featuredId);
  const lastTopic = prefs.lastTopicId ? getTopic(prefs.lastTopicId) : undefined;
  const hardStart = prefs.birth === "loss" || prefs.birth === "difficult" || prefs.birth === "nicu";
  const showPersonalize = ready && !prefs.dismissedIntro && !prefs.stage && !prefs.birth;

  return (
    <Page className="space-y-8 pb-6">
      <section className="animate-rise">
        <p className="text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-primary">For new parents & support people</p>
        <h1 className="mt-2 text-[2.3rem] font-semibold leading-[1.08]">
          Recovery, one gentle step at a time.
        </h1>
        {!hardStart ? (
          <Illustration src={IMAGES.hero.src} alt={IMAGES.hero.alt} priority className="mt-5 aspect-[4/3]" />
        ) : (
          <Illustration src={IMAGES.support.src} alt="" priority className="mt-5 aspect-[16/9]" />
        )}
      </section>

      <AskGuide />

      {lastTopic ? (
        <Link
          to="/topics/$topicId"
          params={{ topicId: lastTopic.id }}
          className="flex items-center gap-3 rounded-2xl bg-sage-soft px-4 py-3 text-secondary-foreground"
        >
          <Bookmark className="h-5 w-5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-[0.85rem] font-bold uppercase tracking-wide">Continue reading</span>
            <span className="block truncate font-semibold">{lastTopic.title}</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </Link>
      ) : null}

      {hardStart ? <HardTimesCard prominent /> : null}

      <section aria-labelledby="guide-heading" className="space-y-4">
        <h2 id="guide-heading" className="text-2xl font-semibold">
          The guide
        </h2>
        <Link
          to="/sections/$sectionId"
          params={{ sectionId: featured.id }}
          className="group block overflow-hidden rounded-3xl bg-paper shadow-soft"
        >
          <img
            src={IMAGES[featured.image].src}
            alt={IMAGES[featured.image].alt}
            width={1024}
            height={768}
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="flex items-end gap-3 p-5">
            <div className="flex-1">
              <p className="text-[0.85rem] font-bold uppercase tracking-wide text-primary">
                {prefs.stage ? "Where you are now" : "Start here"}
              </p>
              <h3 className="mt-1 text-2xl font-semibold">{featured.title}</h3>
              <p className="mt-1 text-muted-foreground">{featured.blurb}</p>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </Link>

        <ul className="divide-y divide-border overflow-hidden rounded-3xl bg-paper shadow-soft">
          {others.map((s) => (
            <li key={s.id}>
              <Link
                to="/sections/$sectionId"
                params={{ sectionId: s.id }}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/60"
              >
                <img
                  src={IMAGES[s.image].src}
                  alt=""
                  width={1024}
                  height={768}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold">{s.title}</span>
                  <span className="block text-[0.92rem] text-muted-foreground">
                    {topicsForSection(s.id).length} topics
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tools-heading" className="space-y-3">
        <h2 id="tools-heading" className="text-2xl font-semibold">
          Helpful right now
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/questions/new" className="flex flex-col gap-3 rounded-3xl bg-primary-soft p-4 text-accent-foreground">
            <MessageCircleQuestion className="h-7 w-7" aria-hidden />
            <span className="font-display text-lg font-semibold leading-snug">Help me ask my nurse</span>
          </Link>
          <Link to="/care/new" className="flex flex-col gap-3 rounded-3xl bg-sage-soft p-4 text-secondary-foreground">
            <Camera className="h-7 w-7" aria-hidden />
            <span className="font-display text-lg font-semibold leading-snug">Save my discharge papers</span>
          </Link>
        </div>
      </section>

      {!hardStart ? <HardTimesCard /> : null}

      {showPersonalize ? (
        <section className="relative rounded-3xl border-2 border-border bg-paper p-5">
          <button
            type="button"
            onClick={() => update({ dismissedIntro: true })}
            className="tap absolute right-2 top-2 grid place-items-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Hide this suggestion"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <SlidersHorizontal className="h-6 w-6 text-sage" aria-hidden />
          <h2 className="mt-2 pr-10 text-xl font-semibold">Make the guide fit you (optional)</h2>
          <p className="mt-1 text-muted-foreground">
            Tell us where you are in recovery. Every question can be skipped, and answers stay on this phone.
          </p>
          <Link to="/settings" className="mt-3 inline-flex min-h-12 items-center gap-2 font-semibold text-primary underline">
            Choose preferences
          </Link>
        </section>
      ) : null}

      <p className="text-center text-[0.88rem] text-muted-foreground">
        A standalone companion. Not connected to any hospital or medical record.{" "}
        <Link to="/about" className="font-semibold underline">
          About & privacy
        </Link>
      </p>
    </Page>
  );
}

function HardTimesCard({ prominent = false }: { prominent?: boolean }) {
  return (
    <Link
      to="/support"
      className={
        prominent
          ? "flex items-center gap-4 rounded-3xl bg-sage p-5 text-sage-foreground shadow-soft"
          : "flex items-center gap-4 rounded-3xl bg-paper p-4 shadow-soft"
      }
    >
      <span className={prominent ? "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage-foreground/15" : "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage-soft text-sage"}>
        <HeartHandshake className="h-6 w-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-semibold">A hard birth, NICU stay or loss</span>
        <span className={prominent ? "block text-[0.95rem] opacity-90" : "block text-[0.95rem] text-muted-foreground"}>
          Gentle pages for difficult experiences.
        </span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
    </Link>
  );
}
