import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TOPICS, SECTION_IDS } from "@/content/topics";
import { validateRouteDecision, type RouteDecision } from "./route-validation";

export type ServiceStatus = {
  gemma: { configured: boolean; model: string | null; invalidModel?: boolean };
  places: { configured: boolean };
};

export const getServiceStatus = createServerFn({ method: "GET" }).handler(async (): Promise<ServiceStatus> => {
  const { gemmaStatus } = await import("./gemma.server");
  return {
    gemma: gemmaStatus(),
    places: { configured: !!process.env["GOOGLE_MAPS_API_KEY"] },
  };
});

export type RouteResult =
  | { ok: true; decision: RouteDecision; model: string }
  | { ok: false; reason: string; message: string };

function buildPrompt(question: string) {
  const catalog = TOPICS.map(
    (t) => `${t.id} | ${t.title} | e.g. ${t.example_questions.join("; ")}`,
  ).join("\n");
  return `You route questions in a postpartum education app to an existing page. You never answer medical questions yourself.

Allowed topic ids (id | title | example questions):
${catalog}

Allowed section ids: ${SECTION_IDS.join(", ")}
(summary = overview, next = most important action, key-facts = safety facts, what-may-happen, why, what-varies, questions = questions to ask, sources)

Rules:
- If the person seems to be REPORTING a current symptom that could be urgent for themselves (heavy bleeding, fainting, chest pain, trouble breathing, severe or lasting headache, vision changes, seizure, fever, thoughts of self-harm or harming the baby, swollen painful leg, severe belly pain), reply urgent_help with audience "maternal".
- If it describes an urgent newborn concern (fever in a baby, blue or gray color, not breathing, limp, cannot wake, seizure), reply urgent_help with audience "baby".
- A general education question (e.g. "what is preeclampsia?") is NOT urgent; open the matching page.
- Tolerate misspellings (e.g. "preclampsia" means preeclampsia, "magnisium" means magnesium).
- If two pages fit equally, reply clarify with exactly two topic ids in "options".
- If nothing fits, reply no_match.
- Use ONLY ids from the lists. Never include URLs or advice.

Reply with ONE JSON object only, one of:
{"action":"open_page","topic_id":"<id>","section_id":"<section id or null>"}
{"action":"clarify","options":["<id>","<id>"]}
{"action":"urgent_help","audience":"maternal"|"baby"}
{"action":"no_match"}

Question: """${question.replaceAll('"""', '"')}"""
JSON:`;
}

export const routeQuestion = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ question: z.string().trim().min(2).max(500) }).parse(d))
  .handler(async ({ data }): Promise<RouteResult> => {
    const { callGemma, extractJson, GemmaUnavailableError } = await import("./gemma.server");
    try {
      const { text, model } = await callGemma(buildPrompt(data.question), { maxTokens: 120 });
      const decision = validateRouteDecision(
        extractJson(text),
        TOPICS.map((t) => t.id),
        SECTION_IDS,
      );
      return { ok: true, decision, model };
    } catch (e) {
      if (e instanceof GemmaUnavailableError) return { ok: false, reason: e.reason, message: e.message };
      return { ok: false, reason: "bad_output", message: "Gemma's answer could not be used." };
    }
  });
