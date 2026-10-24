import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { BackLink, DraftNotice, Illustration, Page } from "@/components/app/bits";
import { AskGuide } from "@/components/app/AskGuide";
import { GUIDE_SECTIONS, topicsForSection, type GuideSectionId } from "@/content/topics";
import { IMAGES } from "@/lib/images";

export const Route = createFileRoute("/sections/$sectionId")({
  loader: ({ params }) => {
    const section = GUIDE_SECTIONS.find((s) => s.id === params.sectionId);
    if (!section) throw notFound();
    return { section };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.section.title} — After Birth` },
          { name: "description", content: loaderData.section.blurb },
          { property: "og:title", content: `${loaderData.section.title} — After Birth` },
          { property: "og:description", content: loaderData.section.blurb },
        ]
      : [{ title: "Guide section — After Birth" }, { name: "robots", content: "noindex" }],
  }),
  component: SectionPage,
});

function SectionPage() {
  const { section } = Route.useLoaderData();
  const topics = topicsForSection(section.id as GuideSectionId);
  const img = IMAGES[section.image];

  return (
    <Page className="space-y-6 pb-6">
      <BackLink fallback="/" label="Guide" />
      <header className="space-y-4">
        <Illustration src={img.src} alt={img.alt} priority className="aspect-[16/9]" />
        <div>
          <h1 className="text-[2rem] font-semibold">{section.title}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{section.blurb}</p>
        </div>
        {section.id === "complications" ? (
          <Link
            to="/help"
            className="flex items-center gap-3 rounded-2xl bg-urgent-soft px-4 py-3 font-semibold text-urgent"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
            <span className="flex-1">Having warning signs now? Go to Get help now.</span>
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        ) : null}
      </header>

      <ol className="space-y-3">
        {topics.map((t, i) => (
          <li key={t.id}>
            <Link
              to="/topics/$topicId"
              params={{ topicId: t.id }}
              className="group flex gap-4 rounded-3xl bg-paper p-4 shadow-soft hover:shadow-lift"
            >
              <span
                aria-hidden
                className="font-display text-2xl font-semibold leading-none text-primary/70 tabular-nums"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-semibold leading-snug">{t.title}</span>
                <span className="mt-1 line-clamp-2 block text-[0.95rem] text-muted-foreground">{t.summary}</span>
                {t.draftLevel === "outline" ? (
                  <span className="mt-2 inline-block rounded-full bg-caution-soft px-2.5 py-0.5 text-[0.8rem] font-bold text-caution">
                    Research outline only
                  </span>
                ) : null}
              </span>
              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>

      <DraftNotice compact />
      <AskGuide />
    </Page>
  );
}
