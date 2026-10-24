import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TOPICS } from "@/content/topics";
import {
  validateExplanation,
  validateOrganizedNote,
  validateWordedQuestion,
  SECTION_TYPES,
  type Explanation,
  type OrganizedNote,
} from "./assist-validation";

type Fail = { ok: false; reason: string; message: string };

async function failFrom(e: unknown): Promise<Fail> {
  const { GemmaUnavailableError } = await import("./gemma.server");
  if (e instanceof GemmaUnavailableError) return { ok: false, reason: e.reason, message: e.message };
  return { ok: false, reason: "bad_output", message: "The AI response could not be checked against your text, so it was not shown." };
}

// ---------- Explain discharge instructions ----------

export const explainDocument = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        owner: z.enum(["parent", "baby"]),
        pages: z.array(z.string().max(12000)).min(1).max(12),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true; explanation: Explanation; model: string } | Fail> => {
    const { callGemma, extractJson } = await import("./gemma.server");
    const full = data.pages.map((t, i) => `--- PAGE ${i + 1} ---\n${t}`).join("\n");
    const prompt = `You help a ${data.owner === "baby" ? "parent understand discharge instructions for their newborn" : "person understand their own postpartum discharge instructions"}.
Explain ONLY what is written. Never add instructions, doses, times or advice that are not in the text. Never guess unclear text. Never choose between conflicting instructions.

Return ONE JSON object:
{
 "summary": "2-3 plain sentences describing what the document covers",
 "sections": [ { "type": one of ${JSON.stringify(SECTION_TYPES)}, "title": "short title", "items": [ { "explanation": "plain-language restatement keeping every name, number, unit, date, time and phone number exactly", "source_quote": "exact text copied from the document", "page": <page number> } ] } ],
 "unclear": [ { "source_quote": "exact text", "reason": "why it is unclear (e.g. dose unreadable, word cut off)" } ],
 "conflicts": [ { "quotes": ["exact text A", "exact text B"], "reason": "how they disagree" } ],
 "missing_pages": "describe evidence of missing pages (e.g. 'Page 2 of 4' but only 1 page) or null",
 "reminders": [ { "text": "possible reminder", "source_quote": "exact text" } ]
}
Only include sections that actually appear in the document. source_quote must be copied exactly from the document.

DOCUMENT:
${full}

JSON:`;
    try {
      const { text, model } = await callGemma(prompt, { maxTokens: 2000 });
      return { ok: true, explanation: validateExplanation(extractJson(text), data.pages.join("\n"), data.pages), model };
    } catch (e) {
      return failFrom(e);
    }
  });

// ---------- Organize a voice note ----------

export const organizeNote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ transcript: z.string().trim().min(5).max(8000) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true; note: OrganizedNote; model: string } | Fail> => {
    const { callGemma, extractJson } = await import("./gemma.server");
    const topicList = TOPICS.filter((t) => t.stage !== "urgent")
      .map((t) => `${t.id}: ${t.title}`)
      .join("\n");
    const prompt = `Organize a new parent's personal voice note. It is their own recollection, not a clinician's instruction.
Do not add facts, advice, doses, times or treatments. Keep uncertainty words exactly (e.g. "I think", "maybe").

Return ONE JSON object:
{
 "organized": [ { "heading": "short heading", "points": ["point using only the note's words and facts"] } ],
 "questions": ["questions the person could ask their care team, based only on the note"],
 "reported_tasks": [ { "text": "task the person says they were told", "source_quote": "exact words from the note" } ],
 "related_topic_ids": ["up to 3 ids from the list below that relate to the note"]
}

Topic ids:
${topicList}

NOTE:
"""${data.transcript.replaceAll('"""', '"')}"""
JSON:`;
    try {
      const { text, model } = await callGemma(prompt, { maxTokens: 1200 });
      return {
        ok: true,
        note: validateOrganizedNote(extractJson(text), data.transcript, TOPICS.map((t) => t.id)),
        model,
      };
    } catch (e) {
      return failFrom(e);
    }
  });

// ---------- Word a question for the nurse ----------

export const wordQuestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ concern: z.string().max(80), facts: z.string().trim().min(3).max(500) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true; question: string; model: string } | Fail> => {
    const { callGemma } = await import("./gemma.server");
    const prompt = `Rewrite what a new parent wants to ask their nurse as ONE short, polite question in plain English.
Use only the facts they state. Do not add medical advice, diagnoses, numbers, doses or assumptions. Do not answer the question.
Topic: ${data.concern}
What they said: """${data.facts.replaceAll('"""', '"')}"""
Reply with the question only.`;
    try {
      const { text, model } = await callGemma(prompt, { maxTokens: 100 });
      const q = validateWordedQuestion(text.split("\n").find((l) => l.trim()) ?? "", data.facts);
      if (!q) return { ok: false, reason: "bad_output", message: "The suggested wording didn't pass our checks." };
      return { ok: true, question: q, model };
    } catch (e) {
      return failFrom(e);
    }
  });
