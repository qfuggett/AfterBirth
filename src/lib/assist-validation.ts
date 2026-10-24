import { z } from "zod";

/**
 * Guards applied to Gemma's document and note output. Every explained item
 * must quote the original text; numbers the model adds that are not in the
 * quoted passage cause the item to fall back to the original wording.
 */

export function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[\s\u00a0]+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

export function quoteFound(quote: string, source: string) {
  const q = norm(quote);
  return q.length >= 4 && norm(source).includes(q);
}

const NUM = /\d+(?:[.,:/]\d+)*/g;
export function numbersIn(s: string) {
  return (s.match(NUM) ?? []).map((n) => n.replace(",", "."));
}

/** True if every number in `text` also appears in `source`. */
export function numbersPreserved(text: string, source: string) {
  const src = new Set(numbersIn(source));
  return numbersIn(text).every((n) => src.has(n));
}

const HEDGES = /\b(i think|i believe|maybe|might|not sure|i guess|probably|something like|or so|kind of|sort of|i forget|don'?t remember|unclear|possibly|she said\?|he said\?)\b/i;
export function soundsUncertain(s: string) {
  return HEDGES.test(s);
}

// ---------- Discharge explanation ----------

export const SECTION_TYPES = [
  "medicines",
  "wound-care",
  "appointments",
  "when-to-get-help",
  "activity",
  "food-and-drink",
  "baby-care",
  "feeding",
  "contacts",
  "other",
] as const;

const rawExplain = z.object({
  summary: z.string().max(600),
  sections: z
    .array(
      z.object({
        type: z.string(),
        title: z.string().max(80),
        items: z
          .array(z.object({ explanation: z.string().max(400), source_quote: z.string().max(600), page: z.number().int().nullish() }))
          .max(20),
      }),
    )
    .max(12),
  unclear: z.array(z.object({ source_quote: z.string().max(400), reason: z.string().max(200) })).max(20).nullish(),
  conflicts: z.array(z.object({ quotes: z.array(z.string().max(400)).max(4), reason: z.string().max(200) })).max(10).nullish(),
  missing_pages: z.string().max(200).nullish(),
  reminders: z.array(z.object({ text: z.string().max(200), source_quote: z.string().max(400) })).max(10).nullish(),
});

export type ExplainedItem = {
  explanation: string;
  sourceQuote: string;
  page: number | null;
  /** True when the explanation was replaced with the original wording. */
  fellBackToOriginal: boolean;
};
export type Explanation = {
  summary: string;
  sections: { type: (typeof SECTION_TYPES)[number]; title: string; items: ExplainedItem[] }[];
  unclear: { sourceQuote: string; reason: string }[];
  conflicts: { quotes: string[]; reason: string }[];
  missingPages: string | null;
  reminders: { text: string; sourceQuote: string }[];
  droppedUnsourced: number;
};

export function validateExplanation(value: unknown, sourceText: string, pageTexts: string[]): Explanation {
  const p = rawExplain.parse(value);
  let dropped = 0;
  const findPage = (quote: string) => {
    const i = pageTexts.findIndex((t) => quoteFound(quote, t));
    return i === -1 ? null : i + 1;
  };
  const sections = p.sections
    .map((s) => {
      const type = (SECTION_TYPES as readonly string[]).includes(s.type) ? (s.type as Explanation["sections"][number]["type"]) : "other";
      const items: ExplainedItem[] = [];
      for (const it of s.items) {
        if (!quoteFound(it.source_quote, sourceText)) {
          dropped++;
          continue;
        }
        const keep = numbersPreserved(it.explanation, it.source_quote);
        items.push({
          explanation: keep ? it.explanation : it.source_quote,
          sourceQuote: it.source_quote,
          page: findPage(it.source_quote),
          fellBackToOriginal: !keep,
        });
      }
      return { type, title: s.title, items };
    })
    .filter((s) => s.items.length > 0);

  // Summary must not introduce numbers absent from the document.
  const summary = numbersPreserved(p.summary, sourceText)
    ? p.summary
    : "Summary withheld because it included details not found in your document. Please read the sections below.";

  return {
    summary,
    sections,
    unclear: (p.unclear ?? [])
      .filter((u) => quoteFound(u.source_quote, sourceText))
      .map((u) => ({ sourceQuote: u.source_quote, reason: u.reason })),
    conflicts: (p.conflicts ?? [])
      .filter((c) => c.quotes.length >= 2 && c.quotes.every((q) => quoteFound(q, sourceText)))
      .map((c) => ({ quotes: c.quotes, reason: c.reason })),
    missingPages: p.missing_pages ?? null,
    reminders: (p.reminders ?? [])
      .filter((r) => quoteFound(r.source_quote, sourceText) && numbersPreserved(r.text, r.source_quote))
      .map((r) => ({ text: r.text, sourceQuote: r.source_quote })),
    droppedUnsourced: dropped,
  };
}

// ---------- Voice note organization ----------

const rawNote = z.object({
  organized: z.array(z.object({ heading: z.string().max(60), points: z.array(z.string().max(300)).max(10) })).max(8),
  questions: z.array(z.string().max(240)).max(8),
  reported_tasks: z.array(z.object({ text: z.string().max(240), source_quote: z.string().max(400) })).max(10),
  related_topic_ids: z.array(z.string().max(80)).max(5),
});

export type OrganizedNote = {
  organized: { heading: string; points: string[] }[];
  questions: string[];
  reportedTasks: { text: string; sourceQuote: string; uncertain: boolean }[];
  relatedTopicIds: string[];
};

export function validateOrganizedNote(value: unknown, transcript: string, allowedTopics: readonly string[]): OrganizedNote {
  const p = rawNote.parse(value);
  const allowed = new Set(allowedTopics);
  return {
    organized: p.organized.map((o) => ({
      heading: o.heading,
      points: o.points.filter((pt) => numbersPreserved(pt, transcript)),
    })),
    questions: p.questions.filter((q) => numbersPreserved(q, transcript)),
    reportedTasks: p.reported_tasks
      .filter((t) => quoteFound(t.source_quote, transcript))
      .map((t) => ({
        text: numbersPreserved(t.text, t.source_quote) ? t.text : t.source_quote,
        sourceQuote: t.source_quote,
        uncertain: soundsUncertain(t.source_quote) || soundsUncertain(t.text),
      })),
    relatedTopicIds: [...new Set(p.related_topic_ids.filter((id) => allowed.has(id)))],
  };
}

// ---------- Question wording ----------

export function validateWordedQuestion(question: string, facts: string): string | null {
  const q = question.trim().replace(/^["']|["']$/g, "");
  if (!q || q.length > 280 || !q.endsWith("?")) return null;
  if (!numbersPreserved(q, facts)) return null;
  if (/https?:\/\//i.test(q)) return null;
  return q;
}
