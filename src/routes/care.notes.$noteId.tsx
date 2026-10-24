import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, BookmarkPlus, Loader2, Sparkles, Trash2 } from "lucide-react";
import { BackLink, OriginTag, Page, formatDate } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useServiceStatus, useStored } from "@/lib/hooks";
import { newId, notifyChange, store, type VoiceNote } from "@/lib/db";
import { organizeNote } from "@/lib/assist.functions";
import { getTopic } from "@/content/topics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/care/notes/$noteId")({
  head: () => ({
    meta: [
      { title: "Voice note — After Birth" },
      { name: "description", content: "Your personal voice note and optional organized version." },
      { property: "og:title", content: "Voice note — After Birth" },
      { property: "og:description", content: "Your personal voice note." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotePage,
});

function NotePage() {
  const { noteId } = Route.useParams();
  const { data: note, loading } = useStored(() => store.getNote(noteId), [noteId]);
  if (loading) return <Page>Loading…</Page>;
  if (!note)
    return (
      <Page className="space-y-4">
        <BackLink fallback="/care" />
        <p>This note isn't saved on this device.</p>
      </Page>
    );
  return <NoteDetail key={note.id + note.updatedAt} note={note} />;
}

function NoteDetail({ note }: { note: VoiceNote }) {
  const navigate = useNavigate();
  const status = useServiceStatus();
  const organize = useServerFn(organizeNote);
  const [text, setText] = useState(note.transcript);
  const [tab, setTab] = useState<"note" | "original" | "organized">(note.organized ? "organized" : "note");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!note.audio) return;
    const u = URL.createObjectURL(note.audio);
    setAudioUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [note.audio]);

  const save = async (patch: Partial<VoiceNote>) => {
    await store.putNote({ ...note, ...patch });
    notifyChange();
  };

  const run = async () => {
    setConsent(false);
    setBusy(true);
    try {
      const r = await organize({ data: { transcript: text } });
      if (r.ok) {
        await save({ transcript: text, organized: { data: r.note, model: r.model, createdAt: Date.now() } });
        toast.success("Organized version ready");
      } else toast.error(r.message);
    } catch {
      toast.error("The AI service couldn't be reached. Nothing was saved.");
    } finally {
      setBusy(false);
    }
  };

  const saveQ = async (q: string) => {
    await store.putQuestion({ id: newId(), text: q, concern: "From my voice note", discussed: false, wordedBy: "gemma", createdAt: Date.now() });
    notifyChange();
    toast.success("Saved to Questions");
  };

  const o = note.organized;

  return (
    <Page className="space-y-5 pb-6">
      <BackLink fallback="/care" label="My care" />
      <header>
        <h1 className="text-[1.8rem] font-semibold leading-tight">{note.title}</h1>
        <p className="text-muted-foreground">
          {note.owner === "baby" ? "About my baby" : "About me"} · {formatDate(note.createdAt)}
        </p>
      </header>
      <p className="rounded-2xl bg-muted px-4 py-3 text-[0.95rem]">
        <strong>Personal recollection.</strong> Not a clinician's instruction. Check anything important against your written
        instructions or with your care team.
      </p>

      {audioUrl ? (
        <div className="space-y-2 rounded-2xl bg-paper p-4 shadow-soft">
          <p className="font-semibold">Recording (kept by your choice)</p>
          <audio controls src={audioUrl} className="w-full" />
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await save({ audio: undefined, audioMime: undefined });
              toast("Recording deleted. The text was kept.");
            }}
          >
            <Trash2 aria-hidden /> Delete recording only
          </Button>
        </div>
      ) : null}

      <div role="tablist" aria-label="Note views" className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1.5">
        {(
          [
            ["note", "My note"],
            ["original", "Original"],
            ["organized", "Organized"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("min-h-11 rounded-full text-[0.95rem] font-bold", tab === id ? "bg-paper text-primary shadow-soft" : "text-muted-foreground")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "note" ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="note-text" className="font-semibold">
              Edit your note
            </label>
            <OriginTag origin="voice" />
          </div>
          <Textarea id="note-text" value={text} onChange={(e) => setText(e.target.value)} className="min-h-48 rounded-2xl bg-paper text-base" maxLength={8000} />
          {text !== note.transcript ? (
            <Button onClick={() => save({ transcript: text, organized: undefined })}>Save changes</Button>
          ) : null}
        </div>
      ) : null}

      {tab === "original" ? (
        <div className="space-y-2">
          <OriginTag origin="voice" detail="transcript as first captured" />
          <p className="whitespace-pre-wrap rounded-2xl bg-paper p-4 shadow-soft">{note.originalTranscript || "(No speech was captured.)"}</p>
        </div>
      ) : null}

      {tab === "organized" ? (
        o ? (
          <div className="space-y-4">
            <OriginTag origin="ai" detail={o.model} />
            {o.data.organized.map((s) => (
              <section key={s.heading} className="rounded-2xl bg-paper p-4 shadow-soft">
                <h2 className="text-lg font-semibold">{s.heading}</h2>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </section>
            ))}
            {o.data.reportedTasks.length ? (
              <section className="space-y-2 rounded-2xl border-2 border-caution bg-caution-soft p-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <AlertTriangle className="h-5 w-5 text-caution" aria-hidden /> Things you remember being told. Verify each
                </h2>
                <p className="text-[0.92rem]">These are not reminders or orders. Confirm them against written instructions.</p>
                <ul className="space-y-2">
                  {o.data.reportedTasks.map((t) => (
                    <li key={t.sourceQuote} className="rounded-xl bg-paper p-3">
                      {t.uncertain ? (
                        <span className="mb-1 inline-block rounded-full bg-caution-soft px-2 py-0.5 text-[0.78rem] font-bold text-caution">
                          Uncertain in your note
                        </span>
                      ) : null}
                      <p className="font-semibold">{t.text}</p>
                      <p className="text-[0.88rem] text-muted-foreground">You said: “{t.sourceQuote}”</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {o.data.questions.length ? (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Questions you could ask</h2>
                <ul className="space-y-2">
                  {o.data.questions.map((q) => (
                    <li key={q} className="flex items-center gap-2 rounded-2xl bg-paper p-3 pl-4 shadow-soft">
                      <span className="flex-1">{q}</span>
                      <button type="button" onClick={() => saveQ(q)} className="tap inline-flex items-center gap-1 rounded-full px-3 font-semibold text-primary">
                        <BookmarkPlus className="h-5 w-5" aria-hidden /> Save
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {o.data.relatedTopicIds.length ? (
              <section className="rounded-2xl bg-sage-soft p-4">
                <h2 className="text-lg font-semibold">Related guide pages</h2>
                <p className="text-[0.9rem]">General information with sources, not new instructions.</p>
                <ul className="mt-1 space-y-1">
                  {o.data.relatedTopicIds.map((id) => {
                    const t = getTopic(id);
                    return t ? (
                      <li key={id}>
                        <Link to="/topics/$topicId" params={{ topicId: id }} className="font-semibold underline">
                          {t.title}
                        </Link>
                      </li>
                    ) : null;
                  })}
                </ul>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl bg-paper p-4 shadow-soft">
            <p>Gemma can sort your note into topics, questions to ask, and things to verify. Your original stays as it is.</p>
            {status.data?.gemma.configured ? (
              <Button onClick={() => setConsent(true)} disabled={busy || text.trim().length < 5}>
                {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />}
                Organize my note
              </Button>
            ) : (
              <p className="text-[0.95rem] text-muted-foreground">AI organizing isn't set up in this version.</p>
            )}
          </div>
        )
      ) : null}

      <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
        <Trash2 aria-hidden /> Delete note
      </Button>

      <AlertDialog open={consent} onOpenChange={setConsent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this note's text to Gemma?</AlertDialogTitle>
            <AlertDialogDescription>
              Only the note text (not audio) is sent to the Gemma AI service ({status.data?.gemma.model}) for this request. The
              result is saved only on this device and labeled as AI-assisted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={run}>Send and organize</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this voice note?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes the transcript, your edits, any recording and the organized version from this device. Questions you saved
              from it stay in Questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await store.deleteNote(note.id);
                notifyChange();
                navigate({ to: "/care", replace: true });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
