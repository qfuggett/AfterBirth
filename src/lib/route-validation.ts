import { z } from "zod";

/**
 * Validates Gemma's routing reply. Anything that names a topic or section
 * outside the allowlist, or includes a URL, is rejected. Pure and testable.
 */

export type RouteDecision =
  | { action: "open_page"; topicId: string; sectionId: string | null }
  | { action: "clarify"; options: string[] }
  | { action: "urgent_help"; audience: "maternal" | "baby" }
  | { action: "no_match" };

const raw = z.object({
  action: z.enum(["open_page", "clarify", "no_match", "urgent_help"]),
  topic_id: z.string().max(80).nullish(),
  section_id: z.string().max(40).nullish(),
  options: z.array(z.string().max(80)).max(4).nullish(),
  audience: z.enum(["maternal", "baby"]).nullish(),
});

export function validateRouteDecision(
  value: unknown,
  allowedTopics: readonly string[],
  allowedSections: readonly string[],
): RouteDecision {
  if (JSON.stringify(value ?? "").match(/https?:\/\/|www\./i)) {
    throw new Error("URL in routing output");
  }
  const parsed = raw.parse(value);
  const topics = new Set(allowedTopics);
  switch (parsed.action) {
    case "open_page": {
      if (!parsed.topic_id || !topics.has(parsed.topic_id)) throw new Error("Unknown topic id");
      if (parsed.topic_id === "urgent-maternal") return { action: "urgent_help", audience: "maternal" };
      if (parsed.topic_id === "urgent-baby") return { action: "urgent_help", audience: "baby" };
      const section = parsed.section_id && allowedSections.includes(parsed.section_id) ? parsed.section_id : null;
      return { action: "open_page", topicId: parsed.topic_id, sectionId: section };
    }
    case "clarify": {
      const opts = [...new Set((parsed.options ?? []).filter((o) => topics.has(o)))].filter(
        (o) => o !== "urgent-maternal" && o !== "urgent-baby",
      );
      if (opts.length < 2) throw new Error("Clarify needs two known topics");
      return { action: "clarify", options: opts.slice(0, 2) };
    }
    case "urgent_help":
      return { action: "urgent_help", audience: parsed.audience ?? "maternal" };
    default:
      return { action: "no_match" };
  }
}
