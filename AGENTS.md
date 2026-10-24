<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Guide content lives in `src/content/` (catalog.json is the imported research catalog; topic-content.ts holds draft summaries). Never mark content clinically reviewed; publication status comes from the catalog.
- Guide search/navigation must never generate medical text: Gemma only returns a validated topic/section id (`src/lib/route-validation.ts`); unknown ids and URLs are rejected.
- All AI calls go through `src/lib/gemma.server.ts`, configured by GEMMA_API_KEY / GEMMA_MODEL / GEMMA_API_BASE / GEMMA_API_FORMAT; the model id must contain "gemma" so no other model family is silently substituted.
- AI output about personal documents/notes must pass `src/lib/assist-validation.ts` (quotes must exist in the source, numbers must be preserved, otherwise fall back to original wording).
- Urgent help content is predefined (`src/content/help.ts`) and always reachable without AI; urgent heuristics (`src/lib/urgent.ts`) only decide whether to lead with it.
- Personal files, notes, questions and reminders are stored only in IndexedDB (`src/lib/db.ts`); never in localStorage and never uploaded. Deleting a resource cascades to its reminders.
- Text in photos is read on-device with tesseract.js, lazy-imported from event handlers only (never SSR).
- Find care uses Google Places when GOOGLE_MAPS_API_KEY is set, otherwise the free NPPES registry + Census geocoder; never fabricate providers, and categories without real directory data return no results.
- Leaflet is loaded via React.lazy behind ClientOnly (`src/components/app/CareMap.tsx`).
- Safety rules are covered by `src/test/safety-rules.test.ts`; update it when changing those rules.
- Detroit-area hospital phone numbers live in `src/content/hospitals.ts`; only numbers confirmed on the hospital's own website are listed (tested in safety-rules), and the chosen hospital is an on-device preference.
- Gemma 4 models reply with "thought" parts; `gemma.server.ts` requests minimal thinking and keeps only answer parts so reasoning text never reaches validation or users.
- Google-hosted Gemma 4 31B often returns instant HTTP 500s; `callGemma` retries server errors within a ~55s time budget rather than switching models.
