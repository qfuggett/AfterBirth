import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Camera, FileText, FlaskConical, Mic, Search, CheckSquare, Trash2, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, Illustration, Page, formatDate } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { useStored } from "@/lib/hooks";
import { notifyChange, store, type Owner, type Resource } from "@/lib/db";
import { createDemoResource } from "@/lib/demo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/care/")({
  head: () => ({
    meta: [
      { title: "My care — After Birth" },
      { name: "description", content: "Keep discharge papers, photos, voice notes and checklists for you and your baby on this device." },
      { property: "og:title", content: "My care — After Birth" },
      { property: "og:description", content: "Keep discharge papers, photos and voice notes on this device." },
    ],
  }),
  component: MyCare,
});

function MyCare() {
  const [owner, setOwner] = useState<Owner>("parent");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const resources = useStored(() => store.listResources());
  const notes = useStored(() => store.listNotes());
  const reminders = useStored(() => store.listReminders());

  const q = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      (resources.data ?? []).filter(
        (r) => r.owner === owner && (!q || r.name.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q))),
      ),
    [resources.data, owner, q],
  );
  const noteList = (notes.data ?? []).filter(
    (n) => n.owner === owner && (!q || n.title.toLowerCase().includes(q) || n.transcript.toLowerCase().includes(q)),
  );

  const tryDemo = async () => {
    const r = await createDemoResource();
    await store.putResource(r);
    notifyChange();
    navigate({ to: "/care/$resourceId", params: { resourceId: r.id } });
  };

  return (
    <Page className="space-y-6 pb-6">
      <header className="space-y-4">
        <Illustration src={IMAGES.myCare.src} alt="" priority className="aspect-[16/9]" />
        <div>
          <h1 className="text-[2rem] font-semibold">My care</h1>
          <p className="mt-1 text-lg text-muted-foreground">Your papers, photos and notes in one place.</p>
        </div>
        <p className="flex items-start gap-2 rounded-2xl bg-muted px-4 py-3 text-[0.95rem]">
          <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>
            Saved <strong>only on this device</strong>, with no cloud backup. Clearing browser data removes it.{" "}
            <Link to="/settings" className="font-semibold underline">
              Export or delete
            </Link>
          </span>
        </p>
      </header>

      <div role="tablist" aria-label="Whose information" className="grid grid-cols-2 gap-2 rounded-full bg-muted p-1.5">
        {(
          [
            ["parent", "For me"],
            ["baby", "For my baby"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={owner === id}
            onClick={() => setOwner(id)}
            className={cn(
              "min-h-12 rounded-full font-bold",
              owner === id ? "bg-paper text-primary shadow-soft" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/care/new"
          search={{ owner }}
          className="flex flex-col gap-3 rounded-3xl bg-primary-soft p-4 text-accent-foreground"
        >
          <Camera className="h-7 w-7" aria-hidden />
          <span className="font-display text-lg font-semibold leading-snug">Add papers or photos</span>
        </Link>
        <Link
          to="/care/voice"
          search={{ owner }}
          className="flex flex-col gap-3 rounded-3xl bg-sage-soft p-4 text-secondary-foreground"
        >
          <Mic className="h-7 w-7" aria-hidden />
          <span className="font-display text-lg font-semibold leading-snug">Record a voice note</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 rounded-full border-2 border-input bg-paper px-4">
        <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
        <label htmlFor="care-search" className="sr-only">
          Search my files and notes
        </label>
        <input
          id="care-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search names, tags or notes"
          className="min-h-12 w-full bg-transparent outline-none"
        />
      </div>

      <section className="space-y-3" aria-labelledby="files-h">
        <h2 id="files-h" className="text-xl font-semibold">
          Papers & photos
        </h2>
        {resources.loading ? null : list.length ? (
          <ul className="space-y-3">
            {list.map((r) => (
              <ResourceRow key={r.id} r={r} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title={q ? "Nothing matches" : owner === "baby" ? "No baby papers yet" : "No papers yet"}
            action={
              owner === "parent" && !q ? (
                <Button variant="outline" onClick={tryDemo}>
                  <FlaskConical aria-hidden /> Try a fictional sample
                </Button>
              ) : null
            }
          >
            {!q ? "Photograph discharge instructions, appointment cards or other papers." : null}
          </EmptyState>
        )}
        {list.length > 0 && owner === "parent" ? (
          <Button variant="ghost" size="sm" onClick={tryDemo}>
            <FlaskConical aria-hidden /> Add a fictional sample
          </Button>
        ) : null}
      </section>

      <section className="space-y-3" aria-labelledby="notes-h">
        <h2 id="notes-h" className="text-xl font-semibold">
          Voice notes
        </h2>
        {noteList.length ? (
          <ul className="space-y-2">
            {noteList.map((n) => (
              <li key={n.id}>
                <Link
                  to="/care/notes/$noteId"
                  params={{ noteId: n.id }}
                  className="flex items-center gap-3 rounded-2xl bg-paper p-4 shadow-soft"
                >
                  <Mic className="h-5 w-5 shrink-0 text-sage" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{n.title}</span>
                    <span className="block truncate text-[0.92rem] text-muted-foreground">
                      {formatDate(n.createdAt)} · {n.transcript.slice(0, 60)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No voice notes yet.</p>
        )}
      </section>

      <RemindersSection items={reminders.data ?? []} />
    </Page>
  );
}

function ResourceRow({ r }: { r: Resource }) {
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    const p = r.pages[0];
    if (!p || !p.mime.startsWith("image/")) return;
    const url = URL.createObjectURL(p.edited ?? p.blob);
    setThumb(url);
    return () => URL.revokeObjectURL(url);
  }, [r]);
  return (
    <li>
      <Link
        to="/care/$resourceId"
        params={{ resourceId: r.id }}
        className="flex items-center gap-4 rounded-3xl bg-paper p-3 shadow-soft hover:shadow-lift"
      >
        <span className="grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
          {thumb ? (
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <FileText className="h-7 w-7 text-muted-foreground" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug">{r.name}</span>
          <span className="block text-[0.92rem] text-muted-foreground">
            {formatDate(r.createdAt)} · {r.pages.length} page{r.pages.length === 1 ? "" : "s"}
          </span>
          <span className="mt-1 flex flex-wrap gap-1">
            {r.isDemo ? (
              <span className="rounded-full bg-caution-soft px-2 py-0.5 text-[0.78rem] font-bold text-caution">Fictional demo</span>
            ) : null}
            {r.tags
              .filter((t) => t !== "demo")
              .slice(0, 3)
              .map((t) => (
                <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[0.78rem] font-semibold">
                  {t}
                </span>
              ))}
          </span>
        </span>
      </Link>
    </li>
  );
}

function RemindersSection({ items }: { items: { id: string; text: string; sourceQuote: string; resourceId: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3" aria-labelledby="rem-h">
      <h2 id="rem-h" className="flex items-center gap-2 text-xl font-semibold">
        <CheckSquare className="h-5 w-5 text-sage" aria-hidden /> Checklist you confirmed
      </h2>
      <ul className="space-y-2">
        {items.map((r) => (
          <li key={r.id} className="flex items-start gap-3 rounded-2xl bg-paper p-4 shadow-soft">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{r.text}</span>
              <span className="block text-[0.9rem] text-muted-foreground">From your document: “{r.sourceQuote}”</span>
              <Link to="/care/$resourceId" params={{ resourceId: r.resourceId }} className="text-[0.9rem] font-semibold underline">
                Open document
              </Link>
            </span>
            <button
              type="button"
              className="tap grid place-items-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label={`Remove checklist item: ${r.text}`}
              onClick={async () => {
                await store.deleteReminder(r.id);
                notifyChange();
                toast("Removed from checklist");
              }}
            >
              <Trash2 className="h-5 w-5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
