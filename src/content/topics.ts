import { CATALOG_TOPICS, getSource, type CatalogTopic, type Source } from "./catalog";
import { TOPIC_CONTENT, type TopicContent } from "./topic-content";

export type Topic = CatalogTopic & TopicContent & { sources: Source[] };

export const TOPICS: Topic[] = CATALOG_TOPICS.map((t) => {
  const content = TOPIC_CONTENT[t.id];
  if (!content) throw new Error(`Missing content for topic ${t.id}`);
  return {
    ...t,
    ...content,
    sources: t.source_ids.map((id) => getSource(id)).filter((s): s is Source => !!s),
  };
});

const topicMap = new Map(TOPICS.map((t) => [t.id, t]));
export function getTopic(id: string) {
  return topicMap.get(id);
}

/** Section ids a guide page can open to. Used by the router and highlighting. */
export const SECTION_IDS = [
  "summary",
  "next",
  "key-facts",
  "what-may-happen",
  "why",
  "what-varies",
  "questions",
  "sources",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export function sectionsForTopic(t: Topic): SectionId[] {
  const s: SectionId[] = ["summary", "next"];
  if (t.keyFacts?.length) s.push("key-facts");
  if (t.mayHappen?.length) s.push("what-may-happen");
  if (t.why?.length) s.push("why");
  if (t.varies?.length) s.push("what-varies");
  if (t.questions.length) s.push("questions");
  s.push("sources");
  return s;
}

export const GUIDE_SECTIONS = [
  {
    id: "hospital",
    title: "In the hospital",
    short: "Hospital",
    blurb: "The first hours and days: checks, recovery, feeding and your baby.",
    image: "hospital" as const,
    stages: ["hospital", "hospital_and_home"],
  },
  {
    id: "going-home",
    title: "Going home",
    short: "Going home",
    blurb: "What happens before discharge, paperwork and appointments.",
    image: "goingHome" as const,
    stages: ["discharge"],
  },
  {
    id: "at-home",
    title: "Recovering at home",
    short: "At home",
    blurb: "Rest, healing, mood, support and follow-up care.",
    image: "atHome" as const,
    stages: ["home", "hospital_and_home"],
  },
  {
    id: "complications",
    title: "Complications",
    short: "Complications",
    blurb: "Blood pressure, bleeding, infection and other conditions explained calmly.",
    image: "complications" as const,
    stages: ["complication"],
  },
] as const;

export type GuideSectionId = (typeof GUIDE_SECTIONS)[number]["id"];

export function topicsForSection(id: GuideSectionId) {
  const sec = GUIDE_SECTIONS.find((s) => s.id === id)!;
  return TOPICS.filter((t) => (sec.stages as readonly string[]).includes(t.stage));
}

export const SENSITIVE_PATHWAY_IDS = [
  "pregnancy-loss-trauma",
  "baby-needs-extra-care",
  "milk-pumping-separation",
  "mental-health-treatment",
  "mood-and-bonding",
];

/** Topic ids a router may legitimately send someone to (urgent pages included). */
export const ALLOWED_TOPIC_IDS = TOPICS.map((t) => t.id);

export function topicHref(t: Pick<Topic, "id" | "stage">) {
  if (t.id === "urgent-maternal") return { to: "/help" as const, search: { for: "me" as const } };
  if (t.id === "urgent-baby") return { to: "/help" as const, search: { for: "baby" as const } };
  return null;
}
