import { createFileRoute, Link } from "@tanstack/react-router";
import { BackLink, Page } from "@/components/app/bits";
import { CATALOG_META, SOURCES } from "@/content/catalog";
import { TOPICS } from "@/content/topics";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About After Birth — content status and privacy" },
      { name: "description", content: "What After Birth is, how its guide content was drafted, and what it does not do." },
      { property: "og:title", content: "About After Birth" },
      { property: "og:description", content: "What After Birth is, how its content was drafted, and what it does not do." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const outlines = TOPICS.filter((t) => t.draftLevel === "outline");
  return (
    <Page className="space-y-6 pb-6">
      <BackLink fallback="/" />
      <h1 className="text-[2rem] font-semibold">About After Birth</h1>
      <p className="text-lg">
        A standalone companion for new parents and support people. Browse without an account. It is not connected to any
        hospital, medical record or clinician, and it never sends messages to staff.
      </p>

      <section className="space-y-2 rounded-3xl bg-caution-soft p-5">
        <h2 className="text-xl font-semibold">Content status: prototype drafts</h2>
        <p>
          All {TOPICS.length} guide pages are drafts written from a research catalog dated {CATALOG_META.researchDate}.{" "}
          <strong>Clinical review has not occurred.</strong> {outlines.length} page
          {outlines.length === 1 ? " is" : "s are"} research outlines only because the source could not be fully read.
          Your own discharge instructions and care team always come first.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[0.95rem]">
          {CATALOG_META.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What this app does not do</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>It does not diagnose, interpret readings, or change treatment.</li>
          <li>It is not an emergency detector. Get help now is always one tap away.</li>
          <li>It does not book appointments or verify insurance.</li>
          <li>No hospital has endorsed it. Hospital sources are labeled by publisher.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Where AI is used</h2>
        <p>
          When it is set up, Google's Gemma model picks which guide page matches your question. It never writes medical
          answers in the guide. Optional AI help with documents and notes always quotes your original text and is labeled
          "AI-assisted".
        </p>
      </section>

      <p>
        <Link to="/sources" className="font-semibold underline">
          See all {SOURCES.length} sources in the research catalog
        </Link>
        {" · "}
        <Link to="/settings" className="font-semibold underline">
          Privacy and storage
        </Link>
      </p>
    </Page>
  );
}
