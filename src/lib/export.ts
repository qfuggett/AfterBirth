import { store } from "./db";

function safe(name: string) {
  return name.replace(/[^\w.\- ]+/g, "_").slice(0, 60) || "file";
}

function extFor(mime: string) {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime.startsWith("audio/")) return mime.includes("mp4") ? "m4a" : "webm";
  return "jpg";
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Bundle every original file, extracted text, note and question into a ZIP. */
export async function exportAll() {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const [resources, notes, questions, reminders] = await Promise.all([
    store.listResources(),
    store.listNotes(),
    store.listQuestions(),
    store.listReminders(),
  ]);
  for (const r of resources) {
    const dir = zip.folder(`${r.owner === "baby" ? "baby" : "parent"}/${safe(r.name)}-${r.id.slice(0, 6)}`)!;
    r.pages.forEach((p, i) => {
      dir.file(`original-page-${i + 1}.${extFor(p.mime)}`, p.blob);
      if (p.ocr?.text) dir.file(`text-read-from-photo-page-${i + 1}.txt`, p.ocr.text);
      if (p.checkedText) dir.file(`text-you-checked-page-${i + 1}.txt`, p.checkedText);
    });
    if (r.explanation) dir.file("ai-assisted-explanation.json", JSON.stringify(r.explanation, null, 2));
    dir.file("details.json", JSON.stringify({ name: r.name, owner: r.owner, kind: r.kind, tags: r.tags, createdAt: new Date(r.createdAt).toISOString() }, null, 2));
  }
  for (const n of notes) {
    const dir = zip.folder(`voice-notes/${safe(n.title)}-${n.id.slice(0, 6)}`)!;
    dir.file("original-transcript.txt", n.originalTranscript);
    dir.file("edited-transcript.txt", n.transcript);
    if (n.audio) dir.file(`recording.${extFor(n.audioMime ?? "audio/webm")}`, n.audio);
    if (n.organized) dir.file("ai-organized.json", JSON.stringify(n.organized, null, 2));
  }
  zip.file("questions.json", JSON.stringify(questions, null, 2));
  zip.file("confirmed-reminders.json", JSON.stringify(reminders, null, 2));
  zip.file(
    "README.txt",
    "Exported from After Birth. Personal notes and AI-assisted explanations are not medical orders. Your original documents are included unchanged.",
  );
  const blob = await zip.generateAsync({ type: "blob" });
  download(blob, `after-birth-export-${new Date().toISOString().slice(0, 10)}.zip`);
}
