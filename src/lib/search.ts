import { TOPICS, type Topic } from "@/content/topics";

/** Plain title/keyword search with typo tolerance. No AI involved. */

const STOP = new Set([
  "a", "an", "the", "is", "are", "am", "i", "my", "me", "to", "of", "and", "or", "for", "in", "on", "it", "do",
  "does", "what", "why", "how", "can", "should", "be", "after", "with", "this", "that", "was", "will", "when",
  "they", "them", "you", "your", "about", "have", "has", "had", "so", "at", "we", "our", "not", "get", "keep",
]);

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(s: string) {
  return normalize(s)
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n]!;
}

function tokenScore(q: string, t: string) {
  if (q === t) return 3;
  if (t.startsWith(q) && q.length >= 3) return 2.2;
  if (q.length >= 5 && t.includes(q)) return 1.8;
  const allowed = q.length >= 8 ? 2 : q.length >= 5 ? 1 : 0;
  if (allowed && Math.abs(q.length - t.length) <= allowed && levenshtein(q, t) <= allowed) return 2;
  return 0;
}

type Indexed = { topic: Topic; title: string[]; keys: string[]; body: string[] };

let index: Indexed[] | null = null;
function getIndex() {
  if (!index) {
    index = TOPICS.map((topic) => ({
      topic,
      title: tokens(topic.title),
      keys: tokens([...topic.keywords, ...topic.example_questions].join(" ")),
      body: tokens([topic.summary, topic.next.text].join(" ")),
    }));
  }
  return index;
}

export type SearchHit = { topic: Topic; score: number };

export function searchTopics(query: string, limit = 6): SearchHit[] {
  const qt = tokens(query);
  if (!qt.length) return [];
  const nq = normalize(query);
  const hits: SearchHit[] = [];
  for (const row of getIndex()) {
    let score = 0;
    for (const q of qt) {
      let best = 0;
      for (const t of row.title) best = Math.max(best, tokenScore(q, t) * 1.4);
      for (const t of row.keys) best = Math.max(best, tokenScore(q, t) * 1.2);
      for (const t of row.body) best = Math.max(best, tokenScore(q, t) * 0.5);
      score += best;
    }
    // Phrase bonus for multi-word keywords ("safe sleep", "c-section")
    for (const k of row.topic.keywords) {
      if (k.includes(" ") && nq.includes(normalize(k))) score += 2.5;
    }
    if (score > 1.5) hits.push({ topic: row.topic, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
