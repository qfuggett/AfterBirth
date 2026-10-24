/**
 * On-device text reading with Tesseract. Images never leave the browser for
 * this step (the reader's language data is downloaded once from a CDN).
 * Import lazily from event handlers only.
 */
import type { PageOcr } from "./db";

export const OCR_LOW_CONFIDENCE = 70;

export async function readImageText(blob: Blob, onProgress?: (p: number) => void): Promise<PageOcr> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") onProgress?.(m.progress);
    },
  });
  try {
    const { data } = await worker.recognize(blob, {}, { text: true, blocks: true });
    const words: { text: string; confidence: number }[] = [];
    for (const block of data.blocks ?? []) {
      for (const para of block.paragraphs ?? []) {
        for (const line of para.lines ?? []) {
          for (const w of line.words ?? []) words.push({ text: w.text, confidence: w.confidence });
        }
      }
    }
    return {
      text: data.text ?? "",
      confidence: Math.round(data.confidence ?? 0),
      lowConfidenceWords: words.filter((w) => w.confidence < OCR_LOW_CONFIDENCE && w.text.trim().length > 0),
      engine: "tesseract",
      readAt: Date.now(),
    };
  } finally {
    await worker.terminate();
  }
}

/** Apply a rotation (degrees, multiple of 90) and optional crop to an image blob. */
export async function transformImage(
  blob: Blob,
  rotation: number,
  crop?: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  const bmp = await createImageBitmap(blob);
  const src = crop ?? { x: 0, y: 0, width: bmp.width, height: bmp.height };
  const r = ((rotation % 360) + 360) % 360;
  const swap = r === 90 || r === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? src.height : src.width;
  canvas.height = swap ? src.width : src.height;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((r * Math.PI) / 180);
  ctx.drawImage(bmp, src.x, src.y, src.width, src.height, -src.width / 2, -src.height / 2, src.width, src.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.92));
}
