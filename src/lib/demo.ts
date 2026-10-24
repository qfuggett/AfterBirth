/**
 * Fictional demo material for trying the discharge-explanation flow.
 * Clearly labeled everywhere it appears. Not real medical instructions.
 * Page images are drawn in the browser so the on-device text reader can be
 * tried on them for real; one dose is deliberately blurred.
 */
import type { Explanation } from "./assist-validation";
import { newId, type Resource } from "./db";

type Line = { text: string; size?: number; bold?: boolean; blur?: { before: string; hidden: string; after: string }; gap?: number };

const PAGE_1: Line[] = [
  { text: "FICTIONAL SAMPLE - NOT REAL MEDICAL INSTRUCTIONS", size: 26, bold: true, gap: 24 },
  { text: "Lakeside Example Hospital", size: 34, bold: true },
  { text: "Postpartum Discharge Instructions", size: 30, gap: 20 },
  { text: "Patient: Jordan Sample     Discharge date: 10/24/2026", gap: 30 },
  { text: "MEDICINES", bold: true, size: 30 },
  { text: "Ibuprofen 600 mg by mouth every 6 hours as needed for pain." },
  { text: "", blur: { before: "Nifedipine ", hidden: "30", after: " mg by mouth once daily for blood pressure." } },
  { text: "Docusate 100 mg by mouth twice daily as needed for constipation.", gap: 30 },
  { text: "WOUND CARE", bold: true, size: 30 },
  { text: "Keep your incision clean and dry. You may shower." },
  { text: "Pat the incision dry. Do not soak in a bath.", gap: 60 },
  { text: "Page 1 of 3", size: 24 },
];

const PAGE_2: Line[] = [
  { text: "FICTIONAL SAMPLE - NOT REAL MEDICAL INSTRUCTIONS", size: 26, bold: true, gap: 24 },
  { text: "APPOINTMENTS", bold: true, size: 30 },
  { text: "Blood pressure check: 10/27/2026 at 9:30 AM" },
  { text: "Example Women's Clinic, phone (555) 010-0142" },
  { text: "Postpartum visit within 3 weeks.", gap: 30 },
  { text: "WHEN TO GET HELP", bold: true, size: 30 },
  { text: "Call 911 for chest pain, trouble breathing or a seizure." },
  { text: "Call the clinic for a headache that will not go away.", gap: 30 },
  { text: "ACTIVITY", bold: true, size: 30 },
  { text: "No lifting heavier than your baby for 6 weeks." },
  { text: "Do not lift anything for 2 weeks.", gap: 60 },
  { text: "Page 2 of 3", size: 24 },
];

async function drawPage(lines: Line[]): Promise<Blob> {
  const W = 1240;
  const H = 1600;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fbf8f2";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1f1a17";
  ctx.textBaseline = "top";
  let y = 90;
  for (const l of lines) {
    const size = l.size ?? 28;
    ctx.font = `${l.bold ? "700" : "400"} ${size}px Arial, Helvetica, sans-serif`;
    if (l.blur) {
      ctx.fillText(l.blur.before, 90, y);
      const x1 = 90 + ctx.measureText(l.blur.before).width;
      ctx.save();
      ctx.filter = "blur(7px)";
      ctx.fillText(l.blur.hidden, x1, y);
      ctx.restore();
      const x2 = x1 + ctx.measureText(l.blur.hidden).width;
      ctx.fillText(l.blur.after, x2, y);
    } else {
      ctx.fillText(l.text, 90, y);
    }
    y += size * 1.6 + (l.gap ?? 0);
  }
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/png"));
}

export async function createDemoResource(): Promise<Resource> {
  const [p1, p2] = await Promise.all([drawPage(PAGE_1), drawPage(PAGE_2)]);
  const now = Date.now();
  return {
    id: newId(),
    owner: "parent",
    kind: "discharge",
    name: "Fictional sample: discharge instructions",
    tags: ["demo", "discharge"],
    createdAt: now,
    updatedAt: now,
    isDemo: true,
    pages: [
      { id: newId(), blob: p1, mime: "image/png", name: "sample-page-1.png" },
      { id: newId(), blob: p2, mime: "image/png", name: "sample-page-2.png" },
    ],
  };
}

/** Hand-written explanation for the fictional sample. Not produced by AI. */
export const DEMO_EXPLANATION: Explanation = {
  summary:
    "These fictional instructions cover medicines, incision care, two appointments, when to get help and activity limits. One dose could not be read, two activity lines disagree, and page 3 is missing.",
  sections: [
    {
      type: "medicines",
      title: "Medicines",
      items: [
        {
          explanation: "Ibuprofen 600 mg by mouth, every 6 hours if you need it for pain.",
          sourceQuote: "Ibuprofen 600 mg by mouth every 6 hours as needed for pain.",
          page: 1,
          fellBackToOriginal: false,
        },
        {
          explanation: "Docusate 100 mg by mouth, twice a day if you need it for constipation.",
          sourceQuote: "Docusate 100 mg by mouth twice daily as needed for constipation.",
          page: 1,
          fellBackToOriginal: false,
        },
      ],
    },
    {
      type: "wound-care",
      title: "Incision care",
      items: [
        { explanation: "Keep the incision clean and dry. Showering is allowed.", sourceQuote: "Keep your incision clean and dry. You may shower.", page: 1, fellBackToOriginal: false },
        { explanation: "Pat it dry, and don't soak in a bath.", sourceQuote: "Pat the incision dry. Do not soak in a bath.", page: 1, fellBackToOriginal: false },
      ],
    },
    {
      type: "appointments",
      title: "Appointments",
      items: [
        {
          explanation: "Blood pressure check on 10/27/2026 at 9:30 AM at Example Women's Clinic, (555) 010-0142.",
          sourceQuote: "Blood pressure check: 10/27/2026 at 9:30 AM",
          page: 2,
          fellBackToOriginal: false,
        },
        { explanation: "A postpartum visit within 3 weeks.", sourceQuote: "Postpartum visit within 3 weeks.", page: 2, fellBackToOriginal: false },
      ],
    },
    {
      type: "when-to-get-help",
      title: "When to get help",
      items: [
        { explanation: "Call 911 for chest pain, trouble breathing or a seizure.", sourceQuote: "Call 911 for chest pain, trouble breathing or a seizure.", page: 2, fellBackToOriginal: false },
        { explanation: "Call the clinic about a headache that won't go away.", sourceQuote: "Call the clinic for a headache that will not go away.", page: 2, fellBackToOriginal: false },
      ],
    },
  ],
  unclear: [
    {
      sourceQuote: "Nifedipine __ mg by mouth once daily for blood pressure.",
      reason: "The dose number is blurred and cannot be read. It has not been guessed.",
    },
  ],
  conflicts: [
    {
      quotes: ["No lifting heavier than your baby for 6 weeks.", "Do not lift anything for 2 weeks."],
      reason: "These lifting instructions disagree. Ask your care team which one applies.",
    },
  ],
  missingPages: "The pages say “Page 1 of 3” and “Page 2 of 3”, but page 3 was not provided.",
  reminders: [
    { text: "Blood pressure check on 10/27/2026 at 9:30 AM", sourceQuote: "Blood pressure check: 10/27/2026 at 9:30 AM" },
  ],
  droppedUnsourced: 0,
};
