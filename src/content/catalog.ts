import raw from "./catalog.json";

export type Source = {
  id: string;
  publisher: string;
  geography: string;
  title: string;
  url: string;
  format: string;
  verification: string;
  published_or_revised: string | null;
  coverage: string;
  limitations: string;
  checked_on: string;
};

export type Stage =
  | "hospital"
  | "hospital_and_home"
  | "discharge"
  | "home"
  | "complication"
  | "urgent";

export type CatalogTopic = {
  id: string;
  title: string;
  stage: Stage;
  source_ids: string[];
  example_questions: string[];
  publication_status: string;
  answer_mode: string;
};

export const CATALOG_META = {
  title: raw.title as string,
  researchDate: raw.research_date as string,
  scope: raw.scope as string,
  notes: raw.notes as string[],
};

export const SOURCES: Source[] = raw.sources as Source[];
export const CATALOG_TOPICS: CatalogTopic[] = raw.topics as CatalogTopic[];

const sourceMap = new Map(SOURCES.map((s) => [s.id, s]));
export function getSource(id: string) {
  return sourceMap.get(id);
}

/** Human-readable description of how far a source could be checked. */
export function verificationLabel(v: string): { label: string; caution: boolean } {
  const map: Record<string, { label: string; caution: boolean }> = {
    page_read: { label: "Page read in full", caution: false },
    page_opened: { label: "Page opened; details need rechecking", caution: true },
    pdf_all_pages_read: { label: "All PDF pages read", caution: false },
    pdf_relevant_pages_read: { label: "Relevant PDF pages read", caution: false },
    indexed_content_read: { label: "Read from a search index copy", caution: true },
    indexed_content_read_direct_open_unverified: {
      label: "Search index copy only; current page not confirmed",
      caution: true,
    },
    indexed_content_read_direct_open_403: {
      label: "Search index copy only; site blocked direct access",
      caution: true,
    },
    indexed_content_read_direct_open_402: {
      label: "Search index copy only; full page is paywalled",
      caution: true,
    },
    indexed_content_read_direct_open_unavailable: {
      label: "Search index copy only; link unavailable",
      caution: true,
    },
    indexed_content_read_redirects_to_library: {
      label: "Old link now redirects; document must be relocated",
      caution: true,
    },
    indexed_excerpt_only: { label: "Only a short excerpt was reviewed", caution: true },
    indexed_excerpt_read: { label: "Only a short excerpt was reviewed", caution: true },
  };
  return map[v] ?? { label: v.replaceAll("_", " "), caution: true };
}

/** Health systems named in the catalog, for the optional hospital preference. */
export const HOSPITAL_SYSTEMS = [
  { id: "dmc", label: "Detroit Medical Center (incl. Hutzel, Sinai-Grace)", publisherMatch: "Detroit Medical Center" },
  { id: "henry-ford", label: "Henry Ford Health", publisherMatch: "Henry Ford Health" },
  { id: "corewell", label: "Corewell Health (incl. former Beaumont)", publisherMatch: "Corewell Health" },
  { id: "umich", label: "University of Michigan Health", publisherMatch: "University of Michigan Health" },
  { id: "other", label: "Another hospital", publisherMatch: null },
] as const;

export type HospitalId = (typeof HOSPITAL_SYSTEMS)[number]["id"];

export function isNationalSource(s: Source) {
  return ["CDC", "ACOG", "AHRQ", "Mayo Clinic", "Office on Women's Health"].includes(s.publisher) ||
    s.publisher.startsWith("American Academy") ||
    s.publisher.startsWith("Michigan Department");
}
