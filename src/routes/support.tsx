import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { BackLink, Illustration, Page } from "@/components/app/bits";
import { getTopic } from "@/content/topics";
import { IMAGES } from "@/lib/images";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "After a hard birth, NICU stay or loss — After Birth" },
      { name: "description", content: "Gentle pages for frightening births, babies in special care, and pregnancy or infant loss." },
      { property: "og:title", content: "After a hard birth, NICU stay or loss" },
      { property: "og:description", content: "Gentle pages for frightening births, babies in special care, and loss." },
    ],
  }),
  component: SupportPage,
});

const PATHS = [
  { id: "pregnancy-loss-trauma", lead: "If your birth was frightening, or you have lost a baby" },
  { id: "baby-needs-extra-care", lead: "If your baby is in the NICU or needs extra monitoring" },
  { id: "milk-pumping-separation", lead: "If you are apart from your baby, or your milk is a worry" },
  { id: "mental-health-treatment", lead: "If you are struggling with depression or anxiety" },
  { id: "father-mental-health", lead: "For partners and support people who are struggling" },
];

function SupportPage() {
  return (
    <Page className="space-y-6 pb-6">
      <BackLink fallback="/" label="Guide" />
      <Illustration src={IMAGES.support.src} alt="" priority className="aspect-[16/9]" />
      <header>
        <h1 className="text-[2rem] font-semibold">When things didn't go as expected</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Take only what helps. You can leave and come back anytime. Nothing here assumes how your birth went or how
          you feed your baby.
        </p>
      </header>

      <ul className="space-y-3">
        {PATHS.map((p) => {
          const t = getTopic(p.id)!;
          return (
            <li key={p.id}>
              <Link
                to="/topics/$topicId"
                params={{ topicId: p.id }}
                className="flex items-center gap-3 rounded-3xl bg-paper p-4 shadow-soft hover:shadow-lift"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.92rem] text-muted-foreground">{p.lead}</span>
                  <span className="block font-display text-lg font-semibold">{t.title}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="rounded-3xl bg-sage-soft p-5">
        <h2 className="text-xl font-semibold">Talk to someone today</h2>
        <p className="mt-1">
          National Maternal Mental Health Hotline: call or text <strong>1-833-852-6262</strong> (1-833-TLC-MAMA), 24 hours.
          If you have thoughts of harming yourself, call or text <strong>988</strong>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="tel:18338526262" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-sage px-5 font-bold text-sage-foreground">
            <Phone className="h-5 w-5" aria-hidden /> Call hotline
          </a>
          <a href="tel:988" className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-sage px-5 font-bold text-secondary-foreground">
            <Phone className="h-5 w-5" aria-hidden /> Call 988
          </a>
        </div>
      </section>

      <p className="text-[0.95rem] text-muted-foreground">
        You can tell the app about your experience in{" "}
        <Link to="/settings" className="font-semibold underline">
          preferences
        </Link>{" "}
        so the home screen shows these pages first. It's optional and stays on this phone.
      </p>
    </Page>
  );
}
