import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Camera, Crop, FileText, RotateCw, Trash2, Upload } from "lucide-react";
import { BackLink, Page } from "@/components/app/bits";
import { CropDialog } from "@/components/app/CropDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newId, notifyChange, store, type Owner, type Resource, type ResourcePage } from "@/lib/db";
import { transformImage } from "@/lib/ocr";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/care/new")({
  validateSearch: z.object({ owner: z.enum(["parent", "baby"]).optional() }),
  head: () => ({
    meta: [
      { title: "Add papers or photos — After Birth" },
      { name: "description", content: "Photograph or upload discharge papers and other documents, saved on this device." },
      { property: "og:title", content: "Add papers or photos — After Birth" },
      { property: "og:description", content: "Photograph or upload documents, saved on this device." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewResource,
});

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_PAGES = 12;
const KINDS: { id: Resource["kind"]; label: string }[] = [
  { id: "discharge", label: "Discharge instructions" },
  { id: "document", label: "Other document" },
  { id: "photo", label: "Photo" },
  { id: "other", label: "Something else" },
];
const TAG_SUGGESTIONS = ["medicines", "appointment", "wound care", "feeding", "insurance", "test results"];

function NewResource() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [owner, setOwner] = useState<Owner>(search.owner ?? "parent");
  const [kind, setKind] = useState<Resource["kind"]>("discharge");
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [pages, setPages] = useState<ResourcePage[]>([]);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: ResourcePage[] = [];
    for (const f of Array.from(files)) {
      if (!ACCEPT.includes(f.type)) {
        toast.error(`${f.name}: only photos (JPG, PNG, WebP, HEIC) or PDF files can be added.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is larger than 15 MB.`);
        continue;
      }
      next.push({ id: newId(), blob: f, mime: f.type, name: f.name });
    }
    setPages((p) => {
      const merged = [...p, ...next];
      if (merged.length > MAX_PAGES) toast.error(`Up to ${MAX_PAGES} pages per document.`);
      return merged.slice(0, MAX_PAGES);
    });
  };

  const move = (i: number, d: -1 | 1) =>
    setPages((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const c = [...p];
      [c[i], c[j]] = [c[j]!, c[i]!];
      return c;
    });

  const rotate = async (i: number) => {
    const p = pages[i];
    if (!p || !p.mime.startsWith("image/") || p.mime.includes("hei")) return;
    const edited = await transformImage(p.edited ?? p.blob, 90);
    setPages((ps) => ps.map((x, k) => (k === i ? { ...x, edited } : x)));
  };

  const addTag = (t: string) => {
    const v = t.trim().toLowerCase().slice(0, 30);
    if (v && !tags.includes(v)) setTags([...tags, v].slice(0, 8));
    setTagDraft("");
  };

  const save = async () => {
    if (!pages.length) return;
    setSaving(true);
    try {
      const now = Date.now();
      const r: Resource = {
        id: newId(),
        owner,
        kind,
        name: name.trim() || `${KINDS.find((k) => k.id === kind)!.label} · ${new Date().toLocaleDateString()}`,
        tags,
        createdAt: now,
        updatedAt: now,
        pages,
      };
      await store.putResource(r);
      notifyChange();
      toast.success("Saved on this device");
      navigate({ to: "/care/$resourceId", params: { resourceId: r.id }, replace: true });
    } catch {
      toast.error("Couldn't save. Your browser may be out of storage space.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page className="space-y-6 pb-6">
      <BackLink fallback="/care" />
      <h1 className="text-[2rem] font-semibold">Add papers or photos</h1>

      <fieldset>
        <legend className="mb-2 font-display text-xl font-semibold">Whose is this?</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["parent", "Mine"],
              ["baby", "My baby's"],
            ] as const
          ).map(([id, label]) => (
            <Chip key={id} selected={owner === id} onClick={() => setOwner(id)}>
              {label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-display text-xl font-semibold">What is it?</legend>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <Chip key={k.id} selected={kind === k.id} onClick={() => setKind(k.id)}>
              {k.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Pages</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" onClick={() => cameraRef.current?.click()}>
            <Camera aria-hidden /> Take photo
          </Button>
          <Button size="lg" variant="outline" onClick={() => uploadRef.current?.click()}>
            <Upload aria-hidden /> Upload
          </Button>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={uploadRef}
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-[0.92rem] text-muted-foreground">
          Add every page, in order. Photos, PDFs, up to {MAX_PAGES} pages, 15 MB each. Tip: lay the paper flat in good light.
        </p>

        {pages.length ? (
          <ol className="space-y-3">
            {pages.map((p, i) => (
              <PageRow
                key={p.id}
                page={p}
                index={i}
                total={pages.length}
                onUp={() => move(i, -1)}
                onDown={() => move(i, 1)}
                onRotate={() => rotate(i)}
                onCrop={() => setCropIndex(i)}
                onRemove={() => setPages((ps) => ps.filter((_, k) => k !== i))}
              />
            ))}
          </ol>
        ) : null}
      </section>

      <div className="space-y-2">
        <label htmlFor="res-name" className="block font-display text-xl font-semibold">
          Name (optional)
        </label>
        <Input
          id="res-name"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Discharge papers, Oct 24"
          className="min-h-12 rounded-2xl bg-paper text-base"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="res-tag" className="block font-display text-xl font-semibold">
          Tags (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTags(tags.filter((x) => x !== t))}
              className="min-h-10 rounded-full bg-primary-soft px-3 font-semibold text-accent-foreground"
              aria-label={`Remove tag ${t}`}
            >
              {t} ×
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="res-tag"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(tagDraft);
              }
            }}
            placeholder="Add a tag"
            className="min-h-12 rounded-2xl bg-paper text-base"
          />
          <Button variant="outline" onClick={() => addTag(tagDraft)} disabled={!tagDraft.trim()}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).map((t) => (
            <button key={t} type="button" onClick={() => addTag(t)} className="min-h-9 rounded-full border border-border px-3 text-[0.9rem]">
              + {t}
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={save} disabled={!pages.length || saving}>
        Save to My care
      </Button>

      <CropDialog
        open={cropIndex !== null}
        onOpenChange={(o) => !o && setCropIndex(null)}
        source={cropIndex !== null ? (pages[cropIndex]?.edited ?? pages[cropIndex]?.blob ?? null) : null}
        onDone={(edited) => setPages((ps) => ps.map((x, k) => (k === cropIndex ? { ...x, edited } : x)))}
      />
    </Page>
  );
}

function PageRow({
  page,
  index,
  total,
  onUp,
  onDown,
  onRotate,
  onCrop,
  onRemove,
}: {
  page: ResourcePage;
  index: number;
  total: number;
  onUp: () => void;
  onDown: () => void;
  onRotate: () => void;
  onCrop: () => void;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = page.mime.startsWith("image/") && !page.mime.includes("hei");
  useEffect(() => {
    if (!isImage) return;
    const u = URL.createObjectURL(page.edited ?? page.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [page, isImage]);
  return (
    <li className="flex gap-3 rounded-3xl bg-paper p-3 shadow-soft">
      <span className="grid h-28 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
        {url ? <img src={url} alt={`Page ${index + 1} preview`} className="h-full w-full object-cover" /> : <FileText className="h-7 w-7 text-muted-foreground" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Page {index + 1}</p>
        <p className="truncate text-[0.88rem] text-muted-foreground">
          {page.name}
          {page.edited ? " · edited copy (original kept)" : ""}
        </p>
        {!isImage ? (
          <p className="text-[0.85rem] text-muted-foreground">
            {page.mime === "application/pdf" ? "PDF: kept as is." : "HEIC: kept as is; preview may not show."}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-1">
          <IconBtn label="Move up" onClick={onUp} disabled={index === 0}>
            <ArrowUp className="h-5 w-5" />
          </IconBtn>
          <IconBtn label="Move down" onClick={onDown} disabled={index === total - 1}>
            <ArrowDown className="h-5 w-5" />
          </IconBtn>
          {isImage ? (
            <>
              <IconBtn label="Rotate" onClick={onRotate}>
                <RotateCw className="h-5 w-5" />
              </IconBtn>
              <IconBtn label="Crop" onClick={onCrop}>
                <Crop className="h-5 w-5" />
              </IconBtn>
            </>
          ) : null}
          <IconBtn label="Remove page" onClick={onRemove}>
            <Trash2 className="h-5 w-5" />
          </IconBtn>
        </div>
      </div>
    </li>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-30"
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-12 rounded-full border-2 px-4 py-2 font-semibold transition-colors",
        selected ? "border-primary bg-primary-soft text-accent-foreground" : "border-input bg-paper hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
