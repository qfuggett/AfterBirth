/**
 * On-device storage for personal material (IndexedDB, this browser only).
 * Nothing here is uploaded. Clearing browser data removes it.
 * Call these functions only in the browser (effects / event handlers).
 */
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Explanation, OrganizedNote } from "./assist-validation";

export type Owner = "parent" | "baby";

export type OcrWord = { text: string; confidence: number };
export type PageOcr = {
  text: string;
  confidence: number;
  lowConfidenceWords: OcrWord[];
  engine: "tesseract" | "demo";
  readAt: number;
};

export type ResourcePage = {
  id: string;
  /** The original file, never modified. */
  blob: Blob;
  mime: string;
  name: string;
  /** Optional rotated/cropped copy used for display and text reading. */
  edited?: Blob | undefined;
  ocr?: PageOcr | undefined;
  /** Text after the person reviewed and corrected it. */
  checkedText?: string | undefined;
};

export type Resource = {
  id: string;
  owner: Owner;
  kind: "discharge" | "document" | "photo" | "other";
  name: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  pages: ResourcePage[];
  textCheckedAt?: number | undefined;
  explanation?: { data: Explanation; model: string; createdAt: number } | undefined;
  isDemo?: boolean | undefined;
};

export type VoiceNote = {
  id: string;
  owner: Owner;
  title: string;
  originalTranscript: string;
  transcript: string;
  audio?: Blob | undefined;
  audioMime?: string | undefined;
  createdAt: number;
  updatedAt: number;
  organized?: { data: OrganizedNote; model: string; createdAt: number } | undefined;
};

export type SavedQuestion = {
  id: string;
  text: string;
  concern: string;
  topicId?: string | undefined;
  discussed: boolean;
  wordedBy: "template" | "you" | "gemma";
  createdAt: number;
};

export type Reminder = {
  id: string;
  text: string;
  sourceQuote: string;
  resourceId: string;
  confirmedAt: number;
};

interface AfterBirthDB extends DBSchema {
  resources: { key: string; value: Resource; indexes: { byCreated: number } };
  notes: { key: string; value: VoiceNote; indexes: { byCreated: number } };
  questions: { key: string; value: SavedQuestion; indexes: { byCreated: number } };
  reminders: { key: string; value: Reminder; indexes: { byResource: string } };
}

let dbp: Promise<IDBPDatabase<AfterBirthDB>> | null = null;
function db() {
  if (!dbp) {
    dbp = openDB<AfterBirthDB>("after-birth", 1, {
      upgrade(d) {
        d.createObjectStore("resources", { keyPath: "id" }).createIndex("byCreated", "createdAt");
        d.createObjectStore("notes", { keyPath: "id" }).createIndex("byCreated", "createdAt");
        d.createObjectStore("questions", { keyPath: "id" }).createIndex("byCreated", "createdAt");
        d.createObjectStore("reminders", { keyPath: "id" }).createIndex("byResource", "resourceId");
      },
    });
  }
  return dbp;
}

export const newId = () => crypto.randomUUID();

export const store = {
  async listResources() {
    return (await (await db()).getAll("resources")).sort((a, b) => b.createdAt - a.createdAt);
  },
  async getResource(id: string) {
    return (await db()).get("resources", id);
  },
  async putResource(r: Resource) {
    await (await db()).put("resources", { ...r, updatedAt: Date.now() });
  },
  /** Deletes the original files, extracted text, explanation and any reminders made from it. */
  async deleteResource(id: string) {
    const d = await db();
    const tx = d.transaction(["resources", "reminders"], "readwrite");
    await tx.objectStore("resources").delete(id);
    const keys = await tx.objectStore("reminders").index("byResource").getAllKeys(id);
    await Promise.all(keys.map((k) => tx.objectStore("reminders").delete(k)));
    await tx.done;
  },

  async listNotes() {
    return (await (await db()).getAll("notes")).sort((a, b) => b.createdAt - a.createdAt);
  },
  async getNote(id: string) {
    return (await db()).get("notes", id);
  },
  async putNote(n: VoiceNote) {
    await (await db()).put("notes", { ...n, updatedAt: Date.now() });
  },
  async deleteNote(id: string) {
    await (await db()).delete("notes", id);
  },

  async listQuestions() {
    return (await (await db()).getAll("questions")).sort((a, b) => b.createdAt - a.createdAt);
  },
  async getQuestion(id: string) {
    return (await db()).get("questions", id);
  },
  async putQuestion(q: SavedQuestion) {
    await (await db()).put("questions", q);
  },
  async deleteQuestion(id: string) {
    await (await db()).delete("questions", id);
  },

  async listReminders() {
    return (await (await db()).getAll("reminders")).sort((a, b) => b.confirmedAt - a.confirmedAt);
  },
  async putReminder(r: Reminder) {
    await (await db()).put("reminders", r);
  },
  async deleteReminder(id: string) {
    await (await db()).delete("reminders", id);
  },

  async wipeAll() {
    const d = await db();
    await Promise.all([d.clear("resources"), d.clear("notes"), d.clear("questions"), d.clear("reminders")]);
  },
};

/** Tell open screens that stored data changed. */
export function notifyChange() {
  window.dispatchEvent(new Event("afterbirth:data"));
}
