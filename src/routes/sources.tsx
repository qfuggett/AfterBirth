import { createFileRoute } from "@tanstack/react-router";
import { BackLink, Page } from "@/components/app/bits";
import { SourceList } from "@/components/app/SourceList";
import { SOURCES, CATALOG_META } from "@/content/catalog";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "Sources — After Birth" },
      { name: "description", content: "Every public source behind the After Birth guide, with dates and access limitations." },
      { property: "og:title", content: "Sources — After Birth" },
      { property: "og:description", content: "Every public source behind the guide, with dates and limitations." },
    ],
  }),
  component: SourcesPage,
});

function SourcesPage() {
  return (
    <Page className="space-y-5 pb-6">
      <BackLink fallback="/about" />
      <h1 className="text-[2rem] font-semibold">Sources</h1>
      <p className="text-muted-foreground">
        {CATALOG_META.title}. Checked {CATALOG_META.researchDate}. {CATALOG_META.scope}
      </p>
      <SourceList sources={SOURCES} />
    </Page>
  );
}
