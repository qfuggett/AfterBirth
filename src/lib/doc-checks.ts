/**
 * On-device checks of text read from a document. These never guess a value;
 * they only point out passages a person should verify against the original.
 */
import type { OcrWord } from "./db";

export type DocFlag = {
  kind: "unreadable-dose" | "low-confidence" | "missing-pages" | "no-text";
  page: number | null;
  message: string;
  context?: string;
};

const UNIT = /^(mg|mcg|µg|ug|ml|mL|g|units?|iu|tabs?|tablets?|caps?|capsules?|puffs?|drops?)\.?$/i;
const UNIT_INLINE = /(mg|mcg|ml|units?|tablets?|capsules?)\b/i;

/** Number-like tokens that contain characters a reader often confuses (O/0, l/1, ?). */
const GARBLED_NUMBER = /^(?=.*\d)(?=.*[^\d.,/:-])[\w?.,/:-]{1,8}$/;

export function analyzePage(text: string, lowWords: OcrWord[], pageNumber: number): DocFlag[] {
  const flags: DocFlag[] = [];
  const trimmed = text.trim();
  if (!trimmed) {
    flags.push({ kind: "no-text", page: pageNumber, message: "No text could be read from this page. The original is kept." });
    return flags;
  }

  const lines = text.split(/\n+/);

  // 1. Dose-like passages where the number is missing, garbled or unclear.
  lines.forEach((line) => {
    const tokens = line.split(/\s+/).filter(Boolean);
    tokens.forEach((tok, i) => {
      if (!UNIT.test(tok)) return;
      const prev = tokens[i - 1] ?? "";
      const missing = !/\d/.test(prev);
      const garbled = GARBLED_NUMBER.test(prev) && !/^\d+([.,]\d+)?$/.test(prev);
      const lowConf = lowWords.some((w) => w.text === prev || w.text === tok);
      if (missing || garbled || lowConf) {
        flags.push({
          kind: "unreadable-dose",
          page: pageNumber,
          message: missing
            ? "A dose amount appears to be missing or unreadable. Check the original and ask your care team."
            : "This dose may have been read incorrectly. Check the original and ask your care team.",
          context: line.trim(),
        });
      }
    });
    // Glued forms like "1O0mg" or "?mg"
    const glued = line.match(/(\S*?)(mg|mcg|ml)\b/i);
    if (glued && glued[1] && !/^\d+([.,]\d+)?$/.test(glued[1]) && /[\d?]/.test(glued[1]) && !flags.some((f) => f.context === line.trim())) {
      flags.push({
        kind: "unreadable-dose",
        page: pageNumber,
        message: "This dose may have been read incorrectly. Check the original and ask your care team.",
        context: line.trim(),
      });
    }
  });

  // 2. Low-confidence words containing digits anywhere (dates, times, phone numbers).
  const numericLow = lowWords.filter((w) => /\d/.test(w.text));
  for (const w of numericLow) {
    const line = lines.find((l) => l.includes(w.text));
    if (line && flags.some((f) => f.context === line.trim())) continue;
    flags.push({
      kind: "low-confidence",
      page: pageNumber,
      message: `“${w.text}” was hard to read. Numbers, dates and phone numbers must match the original.`,
      context: line?.trim(),
    });
  }

  // 3. Unclear passages near medicine units with low-confidence words.
  lines.forEach((line) => {
    if (!UNIT_INLINE.test(line)) return;
    if (flags.some((f) => f.context === line.trim())) return;
    if (lowWords.some((w) => line.includes(w.text) && w.text.length > 2)) {
      flags.push({
        kind: "low-confidence",
        page: pageNumber,
        message: "Part of this medicine line was hard to read. Check the original.",
        context: line.trim(),
      });
    }
  });

  return flags;
}

/** Detect "Page X of Y" evidence that pages are missing. */
export function checkMissingPages(pageTexts: string[]): DocFlag | null {
  const seen = new Set<number>();
  let total = 0;
  for (const t of pageTexts) {
    for (const m of t.matchAll(/page\s+(\d{1,2})\s*(?:of|\/)\s*(\d{1,2})/gi)) {
      seen.add(Number(m[1]));
      total = Math.max(total, Number(m[2]));
    }
  }
  if (!total) return null;
  const missing: number[] = [];
  for (let i = 1; i <= total; i++) if (!seen.has(i)) missing.push(i);
  if (!missing.length) return null;
  return {
    kind: "missing-pages",
    page: null,
    message: `The document says it has ${total} pages, but page${missing.length > 1 ? "s" : ""} ${missing.join(", ")} ${missing.length > 1 ? "were" : "was"} not found. Add the missing page${missing.length > 1 ? "s" : ""} or ask for a copy.`,
  };
}
