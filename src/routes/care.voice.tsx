import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mic, Square, Info } from "lucide-react";
import { BackLink, OriginTag, Page } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { newId, notifyChange, store, type Owner } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/care/voice")({
  validateSearch: z.object({ owner: z.enum(["parent", "baby"]).optional() }),
  head: () => ({
    meta: [
      { title: "Record a voice note — After Birth" },
      { name: "description", content: "Dictate a personal note, review the transcript and save it on this device." },
      { property: "og:title", content: "Record a voice note — After Birth" },
      { property: "og:description", content: "Dictate a personal note and save it on this device." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VoiceNote,
});

type SR = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function VoiceNote() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [owner, setOwner] = useState<Owner>(search.owner ?? "parent");
  const [keepAudio, setKeepAudio] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [original, setOriginal] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [audio, setAudio] = useState<Blob | null>(null);
  const [srSupported, setSrSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SR | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const finalRef = useRef("");

  useEffect(() => {
    const w = window as any;
    setSrSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      recRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const start = async () => {
    setError(null);
    finalRef.current = "";
    setFinalText("");
    setInterim("");
    setSeconds(0);
    setAudio(null);
    try {
      if (keepAudio) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mr = new MediaRecorder(stream);
        chunks.current = [];
        mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
        mr.onstop = () => setAudio(new Blob(chunks.current, { type: mr.mimeType || "audio/webm" }));
        mr.start();
        mediaRef.current = mr;
      }
      const w = window as any;
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (Ctor) {
        const rec: SR = new Ctor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = navigator.language || "en-US";
        rec.onresult = (e: any) => {
          let inter = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) finalRef.current += `${r[0].transcript.trim()} `;
            else inter += r[0].transcript;
          }
          setFinalText(finalRef.current);
          setInterim(inter);
        };
        rec.onerror = (e: any) => {
          if (e.error === "not-allowed" || e.error === "service-not-allowed") {
            setError("Microphone or speech recognition permission was denied. You can type your note instead.");
          } else if (e.error !== "no-speech" && e.error !== "aborted") {
            setError("Speech recognition stopped. You can keep what was captured or type your note.");
          }
        };
        rec.onend = () => {
          if (recRef.current === rec && mediaRef.current?.state !== "recording") return;
        };
        rec.start();
        recRef.current = rec;
      } else if (!keepAudio) {
        setError("This browser can't turn speech into text. Type your note below, or turn on 'Keep the audio' to save a recording.");
        return;
      }
      setRecording(true);
    } catch {
      setError("Microphone permission was denied or unavailable. You can type your note below instead.");
      setRecording(false);
    }
  };

  const stop = () => {
    recRef.current?.stop();
    recRef.current = null;
    if (mediaRef.current?.state === "recording") mediaRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
    // Give the recognizer a moment to deliver final results.
    setTimeout(() => {
      const text = (finalRef.current + " " + "").trim();
      setOriginal(text);
      setTranscript((prev) => (prev ? `${prev}\n${text}` : text));
      setInterim("");
    }, 600);
  };

  const save = async () => {
    const t = transcript.trim();
    if (!t && !audio) return;
    const id = newId();
    const now = Date.now();
    await store.putNote({
      id,
      owner,
      title: title.trim() || `Voice note · ${new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`,
      originalTranscript: original ?? t,
      transcript: t,
      audio: keepAudio && audio ? audio : undefined,
      audioMime: keepAudio && audio ? audio.type : undefined,
      createdAt: now,
      updatedAt: now,
    });
    notifyChange();
    toast.success("Voice note saved on this device");
    navigate({ to: "/care/notes/$noteId", params: { noteId: id }, replace: true });
  };

  const mm = String(Math.floor(seconds / 60)).padStart(1, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Page className="space-y-6 pb-6">
      <BackLink fallback="/care" label="My care" />
      <h1 className="text-[2rem] font-semibold">Voice note</h1>
      <p className="flex items-start gap-2 rounded-2xl bg-muted px-4 py-3 text-[0.95rem]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          For your own dictation. Recording starts only when you tap Record. Please don't record other people without their
          permission. Speech-to-text uses your browser's built-in service, which may process audio on the browser maker's servers.
        </span>
      </p>

      <fieldset>
        <legend className="mb-2 font-display text-lg font-semibold">This note is about</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["parent", "Me"],
              ["baby", "My baby"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={owner === id}
              onClick={() => setOwner(id)}
              className={cn(
                "min-h-12 rounded-full border-2 font-semibold",
                owner === id ? "border-primary bg-primary-soft text-accent-foreground" : "border-input bg-paper",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-paper p-4 shadow-soft">
        <div>
          <label htmlFor="keep-audio" className="font-semibold">
            Keep the audio recording
          </label>
          <p className="text-[0.9rem] text-muted-foreground">Off: only the text is saved. You can delete audio later.</p>
        </div>
        <Switch id="keep-audio" checked={keepAudio} onCheckedChange={setKeepAudio} disabled={recording} />
      </div>

      <div className="flex flex-col items-center gap-3 rounded-3xl bg-sage-soft p-6 text-center">
        {recording ? (
          <>
            <p className="flex items-center gap-2 text-lg font-bold text-urgent" role="status" aria-live="polite">
              <span aria-hidden className="animate-rec h-3.5 w-3.5 rounded-full bg-urgent" />
              Recording · {mm}:{ss}
            </p>
            <button
              type="button"
              onClick={stop}
              className="grid h-24 w-24 place-items-center rounded-full bg-urgent text-urgent-foreground shadow-lift"
              aria-label="Stop recording"
            >
              <Square className="h-9 w-9" aria-hidden />
            </button>
            <p className="font-semibold">Tap to stop</p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={start}
              className="grid h-24 w-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift"
              aria-label="Start recording"
            >
              <Mic className="h-10 w-10" aria-hidden />
            </button>
            <p className="font-semibold">Tap to record</p>
            {srSupported === false ? (
              <p className="text-[0.9rem]">Speech-to-text isn't available in this browser. You can type below.</p>
            ) : null}
          </>
        )}
        {recording && (finalText || interim) ? (
          <p className="max-h-40 w-full overflow-y-auto rounded-2xl bg-paper p-3 text-left">
            {finalText}
            <span className="text-muted-foreground">{interim}</span>
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="rounded-2xl bg-caution-soft px-4 py-3">
          {error}
        </p>
      ) : null}

      {audio && keepAudio ? <audio controls src={URL.createObjectURL(audio)} className="w-full" /> : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="transcript" className="font-display text-lg font-semibold">
            Review your note
          </label>
          <OriginTag origin="voice" />
        </div>
        <Textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your words appear here after recording. You can also type."
          className="min-h-40 rounded-2xl bg-paper text-base"
          maxLength={8000}
        />
        <p className="text-[0.9rem] text-muted-foreground">
          This is your personal recollection, not a clinician's instruction.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="note-title" className="font-semibold">
          Title (optional)
        </label>
        <Input id="note-title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} className="min-h-12 rounded-2xl bg-paper text-base" />
      </div>

      <Button size="lg" className="w-full" onClick={save} disabled={recording || (!transcript.trim() && !audio)}>
        Save note
      </Button>
    </Page>
  );
}
