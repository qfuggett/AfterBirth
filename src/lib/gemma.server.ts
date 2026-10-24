/**
 * Server-only Gemma client.
 *
 * Configuration (project secrets / environment variables):
 *   GEMMA_API_KEY     required. Google AI Studio key, or a key for an OpenAI-compatible Gemma host.
 *   GEMMA_MODEL       optional. Exact instruction-tuned Gemma model id. Default "gemma-3-27b-it".
 *   GEMMA_API_BASE    optional. Default "https://generativelanguage.googleapis.com/v1beta".
 *   GEMMA_API_FORMAT  optional. "google" (generateContent) or "openai" (chat/completions). Default "google".
 *
 * The model id must contain "gemma": this client refuses to silently call a
 * different model family. Personal content sent here is never logged.
 */

export type GemmaConfig = {
  apiKey: string;
  model: string;
  base: string;
  format: "google" | "openai";
};

export class GemmaUnavailableError extends Error {
  constructor(
    public reason: "not_configured" | "invalid_model" | "upstream_error" | "rate_limited" | "bad_output",
    message: string,
  ) {
    super(message);
  }
}

export function readGemmaConfig(): GemmaConfig | null {
  const apiKey = process.env["GEMMA_API_KEY"];
  if (!apiKey) return null;
  const model = (process.env["GEMMA_MODEL"] || "gemma-3-27b-it").trim();
  const base = (process.env["GEMMA_API_BASE"] || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, "");
  const format = process.env["GEMMA_API_FORMAT"] === "openai" ? "openai" : "google";
  return { apiKey, model, base, format };
}

export function gemmaStatus() {
  const cfg = readGemmaConfig();
  if (!cfg) return { configured: false as const, model: null };
  if (!/gemma/i.test(cfg.model)) return { configured: false as const, model: cfg.model, invalidModel: true };
  return { configured: true as const, model: cfg.model };
}

export async function callGemma(prompt: string, opts: { maxTokens?: number } = {}): Promise<{ text: string; model: string }> {
  const cfg = readGemmaConfig();
  if (!cfg) throw new GemmaUnavailableError("not_configured", "Gemma is not configured.");
  if (!/gemma/i.test(cfg.model)) {
    throw new GemmaUnavailableError("invalid_model", "Configured model is not a Gemma model.");
  }
  const maxTokens = opts.maxTokens ?? 600;

  let res: Response;
  try {
    if (cfg.format === "google") {
      const modelPath = cfg.model.startsWith("models/") ? cfg.model : `models/${cfg.model}`;
      res = await fetch(`${cfg.base}/${modelPath}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": cfg.apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, maxOutputTokens: maxTokens },
        }),
        signal: AbortSignal.timeout(30000),
      });
    } else {
      res = await fetch(`${cfg.base}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({
          model: cfg.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
          max_tokens: maxTokens,
        }),
        signal: AbortSignal.timeout(30000),
      });
    }
  } catch {
    throw new GemmaUnavailableError("upstream_error", "Could not reach the Gemma service.");
  }

  if (res.status === 429) throw new GemmaUnavailableError("rate_limited", "Gemma is busy. Try again shortly.");
  if (!res.ok) {
    // Log status only; never log prompts (they can contain personal content).
    console.error("[gemma] upstream status", res.status);
    throw new GemmaUnavailableError("upstream_error", `Gemma service returned ${res.status}.`);
  }

  const json = (await res.json()) as any;
  const text: string =
    cfg.format === "google"
      ? (json?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p?.text ?? "").join("")
      : json?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new GemmaUnavailableError("bad_output", "Gemma returned an empty response.");
  return { text, model: cfg.model };
}

/** Pull the first JSON object out of a model reply (handles ```json fences). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text) ?? "";
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new GemmaUnavailableError("bad_output", "No JSON in Gemma reply.");
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw new GemmaUnavailableError("bad_output", "Gemma reply was not valid JSON.");
  }
}

export function normalizeForMatch(s: string) {
  return s.toLowerCase().replace(/[\s\u00a0]+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();
}
