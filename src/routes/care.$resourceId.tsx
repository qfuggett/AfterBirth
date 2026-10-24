import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, FileText, FlaskConical, Loader2, Pencil, ScanText, Sparkles, Trash2 } from "lucide-react";
import { BackLink, OriginTag, Page, formatDate } from "@/components/app/bits";
import { ExplanationView } from "@/components/app/ExplanationView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { notifyChange, store, type Resource, type ResourcePage } from "@/lib/db";
import { analyzePage, checkMissingPages, type DocFlag } from "@/lib/doc-checks";
import { explainDocument } from "@/lib/assist.functions";
import { DEMO_EXPLANATION } from "@/lib/demo";
import { download } from "@/lib/export";

export const Route = createFileRoute("/care/$resourceId")({
  head: () => ({
    meta: [
      { title: "Saved document — After Birth" },
      { name: "description", content: "Your saved document, the text read from it, and an optional explanation." },
      { property: "og:title", content: "Saved document — After Birth" },
      { property: "og:description", content: "Your saved document and the text read from it." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResourcePageView,
});

function ResourcePageView() {
  const { resourceId } = Route.useParams();
  const { data: resource, loading } = useStored(() => store.getResource(resourceId), [resourceId]);

  if (loading) return <Page>Loading…</Page>;
  if (!resource)
    return (
      <Page className="space-y-4">
        <BackLink fallback="/care" />
        <p>This item isn't saved on this device. It may have been deleted, or saved in another browser.</p>
        <Link to="/care" className="font-semibold underline">
          Back to My care
        </Link>
      </Page>
    );
  return <ResourceDetail key={resource.id + resource.updatedAt} resource={resource} />;
}

function usePageUrls(pages: ResourcePage[]) {
  const [urls, setUrls] = useState<(string | null)[]>([]);
  useEffect(() => {
    const u = pages.map((p) => (p.mime.startsWith("image/") && !p.mime.includes("hei") ? URL.createObjectURL(p.edited ?? p.blob) : null));
    setUrls(u);
    return () => u.forEach((x) => x && URL.revokeObjectURL(x));
  }, [pages]);
  return urls;
}

function ResourceDetail({ resource }: { resource: Resource }) {
  const navigate = useNavigate();
  const status = useServiceStatus();
  const explain = useServerFn(explainDocument);
  const urls = usePageUrls(resource.pages);
  const [viewPage, setViewPage] = useState<number | null>(null);
  const [texts, setTexts] = useState<string[]>(() => resource.pages.map((p) => p.checkedText ?? p.ocr?.text ?? ""));
  const [reading, setReading] = useState<{ page: number; progress: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(resource.name);

  const anyRead = resource.pages.some((p) => p.ocr);
  const hasText = texts.some((t) => t.trim());
  const textDirty = resource.pages.some((p, i) => (p.checkedText ?? p.ocr?.text ?? "") !== texts[i]);
  const checked = !!resource.textCheckedAt && !textDirty;

  const flags: DocFlag[] = useMemo(() => {
    const f = resource.pages.flatMap((p, i) =>
      p.ocr || texts[i] ? analyzePage(texts[i] ?? "", p.ocr?.lowConfidenceWords ?? [], i + 1) : [],
    );
    const missing = checkMissingPages(texts);
    return missing ? [missing, ...f] : f;
  }, [texts, resource.pages]);

  const save = async (patch: Partial<Resource>) => {
    await store.putResource({ ...resource, ...patch });
    notifyChange();
  };

  const readAll = async () => {
    const { readImageText } = await import("@/lib/ocr");
    const pages = [...resource.pages];
    const nextTexts = [...texts];
    try {
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        if (!p.mime.startsWith("image/") || p.mime.includes("hei")) continue;
        setReading({ page: i + 1, progress: 0 });
        const ocr = await readImageText(p.edited ?? p.blob, (progress) => setReading({ page: i + 1, progress }));
        pages[i] = { ...p, ocr, checkedText: undefined };
        nextTexts[i] = ocr.text;
      }
      setTexts(nextTexts);
      await save({ pages, textCheckedAt: undefined, explanation: undefined });
      toast.success("Text read on this device. Please check it against the original.");
    } catch {
      toast.error("The text reader couldn't run. You can type the text instead. Your original is kept.");
    } finally {
      setReading(null);
    }
  };

  const markChecked = async () => {
    const pages = resource.pages.map((p, i) => ({ ...p, checkedText: texts[i] }));
    await save({ pages, textCheckedAt: Date.now(), explanation: textDirty ? undefined : resource.explanation });
    toast.success("Marked as checked by you");
  };

  const runExplain = async () => {
    setConsentOpen(false);
    setExplaining(true);
    try {
      const r = await explain({ data: { owner: resource.owner, pages: texts.map((t) => t.slice(0, 12000)) } });
      if (r.ok) {
        await save({ explanation: { data: r.explanation, model: r.model, createdAt: Date.now() } });
      } else {
        toast.error(r.message);
      }
    } catch {
      toast.error("The explanation service couldn't be reached. Nothing was sent or saved.");
    } finally {
      setExplaining(false);
    }
  };

  const blockedQuotes = flags.filter((f) => f.kind === "unreadable-dose" && f.context).map((f) => f.context!);

  return (
    <Page className="space-y-6 pb-6">
      <BackLink fallback="/care" label="My care" />

      {resource.isDemo ? (
        <p className="flex items-start gap-2 rounded-2xl border-2 border-caution bg-caution-soft px-4 py-3">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-caution" aria-hidden />
          <span>
            <strong>Fictional demo.</strong> These are made-up instructions for trying the feature. They are not medical
            advice, and this feature has not been validated for real clinical use.
          </span>
        </p>
      ) : null}

      <header className="space-y-2">
        {renaming ? (
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await save({ name: nameDraft.trim() || resource.name });
              setRenaming(false);
            }}
          >
            <label htmlFor="rename" className="sr-only">
              Name
            </label>
            <Input id="rename" value={nameDraft} maxLength={80} onChange={(e) => setNameDraft(e.target.value)} className="min-h-12 rounded-2xl bg-paper text-base" autoFocus />
            <Button type="submit">Save</Button>
          </form>
        ) : (
          <div className="flex items-start gap-2">
            <h1 className="flex-1 text-[1.8rem] font-semibold leading-tight">{resource.name}</h1>
            <button type="button" onClick={() => setRenaming(true)} className="tap grid place-items-center rounded-full hover:bg-muted" aria-label="Rename">
              <Pencil className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}
        <p className="text-muted-foreground">
          {resource.owner === "baby" ? "Baby's document" : "My document"} · {formatDate(resource.createdAt)} · {resource.pages.length} page
          {resource.pages.length === 1 ? "" : "s"}
        </p>
        {resource.tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.map((t) => (
              <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-[0.85rem] font-semibold">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <section className="space-y-3" aria-labelledby="orig-h">
        <div className="flex items-center justify-between gap-2">
          <h2 id="orig-h" className="text-xl font-semibold">
            Original
          </h2>
          <OriginTag origin={resource.isDemo ? "demo" : "original"} />
        </div>
        <ul className="flex gap-3 overflow-x-auto pb-2">
          {resource.pages.map((p, i) => (
            <li key={p.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setViewPage(i + 1)}
                className="block h-40 w-30 overflow-hidden rounded-2xl border border-border bg-muted"
                style={{ width: "7.5rem" }}
                aria-label={`View page ${i + 1}`}
              >
                {urls[i] ? (
                  <img src={urls[i]!} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full place-items-center p-2 text-center text-[0.85rem]">
                    <FileText className="mx-auto h-7 w-7" aria-hidden />
                    {p.mime === "application/pdf" ? "PDF" : "File"}
                  </span>
                )}
              </button>
              <p className="mt-1 text-center text-[0.85rem] text-muted-foreground">Page {i + 1}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="text-h">
        <h2 id="text-h" className="text-xl font-semibold">
          1. Read and check the text
        </h2>
        {!anyRead && resource.pages.some((p) => p.mime.startsWith("image/")) ? (
          <div className="rounded-3xl bg-paper p-4 shadow-soft">
            <p>Read the words in your photos. This happens on this device; the images aren't uploaded.</p>
            <Button className="mt-3" onClick={readAll} disabled={!!reading}>
              {reading ? <Loader2 className="animate-spin" aria-hidden /> : <ScanText aria-hidden />}
              Read text from photos
            </Button>
          </div>
        ) : null}
        {reading ? (
          <div role="status" className="space-y-2 rounded-2xl bg-muted p-4">
            <p>
              Reading page {reading.page} of {resource.pages.length}…
            </p>
            <Progress value={reading.progress * 100} aria-label="Reading progress" />
          </div>
        ) : null}

        {flags.length ? (
          <div className="space-y-2 rounded-3xl border-2 border-caution bg-caution-soft p-4" role="region" aria-label="Things to check">
            <p className="font-display text-lg font-semibold">Check these against the original</p>
            <ul className="space-y-2">
              {flags.map((f, i) => (
                <li key={i} className="rounded-2xl bg-paper p-3">
                  <p className="text-[0.82rem] font-bold uppercase tracking-wide text-caution">
                    {f.kind === "unreadable-dose" ? "Dose unclear · not guessed" : f.kind === "missing-pages" ? "Missing pages?" : f.kind === "no-text" ? "No text found" : "Hard to read"}
                    {f.page ? ` · page ${f.page}` : ""}
                  </p>
                  {f.context ? <p className="mt-1 font-semibold">“{f.context}”</p> : null}
                  <p className="text-[0.95rem]">{f.message}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {resource.pages.map((p, i) => {
          const isImage = p.mime.startsWith("image/") && !p.mime.includes("hei");
          if (!p.ocr && isImage && !texts[i]) return null;
          return (
            <div key={p.id} className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor={`text-${i}`} className="font-semibold">
                  Page {i + 1} text
                </label>
                {p.ocr ? <OriginTag origin="ocr" detail={`${p.ocr.confidence}% confidence`} /> : <OriginTag origin="you" />}
              </div>
              <Textarea
                id={`text-${i}`}
                value={texts[i]}
                onChange={(e) => setTexts(texts.map((t, k) => (k === i ? e.target.value : t)))}
                className="min-h-40 rounded-2xl bg-paper font-mono text-[0.95rem]"
              />
            </div>
          );
        })}

        {resource.pages.some((p, i) => (!p.mime.startsWith("image/") || p.mime.includes("hei")) && !texts[i]) ? (
          <div className="space-y-2">
            <p className="text-[0.95rem] text-muted-foreground">
              Text can't be read automatically from PDFs or HEIC files here. You can type or paste the text instead.
            </p>
            {resource.pages.map((p, i) =>
              (!p.mime.startsWith("image/") || p.mime.includes("hei")) && !texts[i] ? (
                <Textarea
                  key={p.id}
                  aria-label={`Type text for page ${i + 1}`}
                  placeholder={`Type the text from page ${i + 1}`}
                  value={texts[i]}
                  onChange={(e) => setTexts(texts.map((t, k) => (k === i ? e.target.value : t)))}
                  className="min-h-28 rounded-2xl bg-paper"
                />
              ) : null,
            )}
          </div>
        ) : null}

        {hasText ? (
          checked ? (
            <p className="flex items-start gap-2 rounded-2xl bg-sage-soft px-4 py-3 text-secondary-foreground">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <span>
                You checked this text on {formatDate(resource.textCheckedAt!)}. Your check isn't a clinical validation.
              </span>
            </p>
          ) : (
            <div className="rounded-2xl bg-paper p-4 shadow-soft">
              <p>
                Compare names, numbers, units, dates, times and phone numbers with the original. Fix anything wrong. Leave
                anything you can't read as it is.
              </p>
              <Button className="mt-3" variant="sage" onClick={markChecked}>
                <CheckCircle2 aria-hidden /> I've checked the text
              </Button>
            </div>
          )
        ) : null}
      </section>

      {hasText ? (
        <section className="space-y-3" aria-labelledby="explain-h">
          <h2 id="explain-h" className="text-xl font-semibold">
            2. Explain it simply
          </h2>
          {!checked ? (
            <p className="text-muted-foreground">Check the text first. Explanations only use text you've checked.</p>
          ) : resource.explanation ? (
            <ExplanationView
              explanation={resource.explanation.data}
              source={{ kind: "ai", model: resource.explanation.model }}
              resourceId={resource.id}
              onShowPage={setViewPage}
              blockedReminderQuotes={blockedQuotes}
            />
          ) : showDemo && resource.isDemo ? (
            <ExplanationView explanation={DEMO_EXPLANATION} source={{ kind: "demo" }} resourceId={resource.id} onShowPage={setViewPage} />
          ) : (
            <div className="space-y-3 rounded-3xl bg-paper p-4 shadow-soft">
              {status.data?.gemma.configured ? (
                <Button onClick={() => setConsentOpen(true)} disabled={explaining}>
                  {explaining ? <Loader2 className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />}
                  {explaining ? "Explaining…" : "Explain with AI"}
                </Button>
              ) : (
                <p className="text-[0.95rem]">
                  AI explanations aren't set up in this version. Your checked text and the warnings above are still
                  available.
                </p>
              )}
              {resource.isDemo ? (
                <Button variant="outline" onClick={() => setShowDemo(true)}>
                  <FlaskConical aria-hidden /> Show the sample explanation (written by the app team)
                </Button>
              ) : null}
            </div>
          )}
        </section>
      ) : null}

      <section className="flex flex-wrap gap-2 border-t border-border pt-5">
        <Button
          variant="outline"
          onClick={() =>
            resource.pages.forEach((p, i) =>
              download(p.blob, p.name || `${resource.name}-page-${i + 1}`),
            )
          }
        >
          <Download aria-hidden /> Download originals
        </Button>
        <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
          <Trash2 aria-hidden /> Delete
        </Button>
      </section>

      <Dialog open={viewPage !== null} onOpenChange={(o) => !o && setViewPage(null)}>
        <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto rounded-3xl bg-paper">
          <DialogHeader>
            <DialogTitle className="font-display">Page {viewPage}</DialogTitle>
            <DialogDescription>
              {resource.isDemo ? "Fictional demo page." : "Your original document"}
              {viewPage && resource.pages[viewPage - 1]?.edited ? " (edited copy shown; original kept)" : ""}
            </DialogDescription>
          </DialogHeader>
          {viewPage && urls[viewPage - 1] ? (
            <img src={urls[viewPage - 1]!} alt={`Page ${viewPage} of ${resource.name}`} className="w-full rounded-xl" />
          ) : (
            <p>This file can't be previewed here. Use Download originals to open it.</p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={consentOpen} onOpenChange={setConsentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send the checked text for an explanation?</AlertDialogTitle>
            <AlertDialogDescription>
              The text you checked (not the photos) is sent to the Gemma AI service ({status.data?.gemma.model}) for this one
              request. The result is saved only on this device. The explanation may be wrong; your original document and care
              team come first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={runExplain}>Send and explain</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{resource.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the original files, any edited copies, the text read from them, the text you checked,
              any explanation, and checklist items made from it. Questions you saved stay. Guide pages aren't affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await store.deleteResource(resource.id);
                notifyChange();
                toast.success("Deleted from this device");
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
