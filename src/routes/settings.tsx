import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { BackLink, Page } from "@/components/app/bits";
import { HospitalSelect } from "@/components/app/HospitalPicker";
import { Button } from "@/components/ui/button";
import { HOSPITAL_SYSTEMS } from "@/content/catalog";
import { usePrefs, type Prefs } from "@/lib/prefs";
import { notifyChange, store } from "@/lib/db";
import { exportAll } from "@/lib/export";
import { useServiceStatus } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Preferences & privacy — After Birth" },
      { name: "description", content: "Optional preferences, where your information is stored, export and deletion." },
      { property: "og:title", content: "Preferences & privacy — After Birth" },
      { property: "og:description", content: "Optional preferences, storage, export and deletion." },
    ],
  }),
  component: SettingsPage,
});

type Opt<K extends keyof Prefs> = { value: NonNullable<Prefs[K]>; label: string }[];

const STAGES: Opt<"stage"> = [
  { value: "hospital", label: "In the hospital" },
  { value: "going-home", label: "Going home soon" },
  { value: "home", label: "At home" },
  { value: "unsure", label: "Not sure" },
];
const BIRTH: Opt<"birth"> = [
  { value: "vaginal", label: "Vaginal birth" },
  { value: "cesarean", label: "C-section" },
  { value: "nicu", label: "Baby in NICU / special care" },
  { value: "difficult", label: "A frightening or difficult birth" },
  { value: "loss", label: "We experienced a loss" },
  { value: "skip", label: "Prefer not to say" },
];
const ROLE: Opt<"role"> = [
  { value: "birth-parent", label: "I gave birth" },
  { value: "partner", label: "Partner / other parent" },
  { value: "support", label: "Family or support person" },
  { value: "skip", label: "Prefer not to say" },
];

function SettingsPage() {
  const { prefs, update, clear } = usePrefs();
  const status = useServiceStatus();
  const [busy, setBusy] = useState(false);

  return (
    <Page className="space-y-8 pb-6">
      <BackLink fallback="/" />
      <header>
        <h1 className="text-[2rem] font-semibold">Preferences & privacy</h1>
        <p className="mt-1 text-muted-foreground">Everything here is optional. Skip any question or change it later.</p>
      </header>

      <ChoiceGroup legend="Where are you in recovery?" options={STAGES} value={prefs.stage} onChange={(v) => update({ stage: v })} />
      <ChoiceGroup legend="Who is using the app?" options={ROLE} value={prefs.role} onChange={(v) => update({ role: v })} />
      <ChoiceGroup legend="Your birth experience" options={BIRTH} value={prefs.birth} onChange={(v) => update({ birth: v })} />
      <div className="space-y-2">
        <label htmlFor="hospital-settings-select" className="block font-display text-xl font-semibold">
          Your hospital
        </label>
        <p className="text-[0.95rem] text-muted-foreground">
          Keeps the hospital's phone numbers on the Get help page. Saved on this phone only.
        </p>
        <HospitalSelect id="hospital-settings-select" />
      </div>
      <fieldset className="space-y-2">
        <legend className="font-display text-xl font-semibold">Hospital system</legend>
        <p className="text-[0.95rem] text-muted-foreground">
          Used only to label which sources come from your hospital's system. It doesn't connect to the hospital.
        </p>
        <div className="grid gap-2">
          {HOSPITAL_SYSTEMS.map((h) => (
            <Choice key={h.id} selected={prefs.hospital === h.id} onClick={() => update({ hospital: prefs.hospital === h.id ? null : h.id })}>
              {h.label}
            </Choice>
          ))}
        </div>
      </fieldset>
      <Button variant="ghost" onClick={clear}>
        Clear all preferences
      </Button>

      <section className="space-y-3 rounded-3xl bg-paper p-5 shadow-soft">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ShieldCheck className="h-5 w-5 text-sage" aria-hidden /> Where your information lives
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-[0.98rem]">
          <li>
            <strong>Saved on this device only:</strong> documents, photos, voice notes, transcripts and saved questions are
            stored in this browser. There is no cloud backup. Clearing browser data or losing the phone removes them.
          </li>
          <li>
            <strong>Read on this device:</strong> text in photos is read in your browser. Images are not uploaded for this.
          </li>
          <li>
            <strong>Sent only when you choose:</strong> if you tap an AI action, the text you've checked is sent to the
            configured Gemma service for that one request. We ask first every time.
          </li>
          <li>
            <strong>Speech to text:</strong> uses your browser's built-in speech recognition, which some browsers process on
            their company's servers.
          </li>
          <li>
            <strong>Find care:</strong> only the ZIP, city or approximate location you enter is sent to the directory. Never
            documents or notes.
          </li>
          <li>Nothing is sent to a clinician or monitored by a hospital. No ads or analytics include your content.</li>
        </ul>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="outline"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await exportAll();
              } finally {
                setBusy(false);
              }
            }}
          >
            <Download aria-hidden /> Export everything
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 aria-hidden /> Delete everything
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all saved information?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes every document, photo, extracted text, explanation, voice note, recording,
                  saved question and reminder from this device. It can't be undone. Export first if you want a copy.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my information</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await store.wipeAll();
                    clear();
                    notifyChange();
                    toast.success("All saved information deleted from this device");
                  }}
                >
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      <section className="space-y-2 rounded-3xl bg-paper p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Connected services</h2>
        <ServiceRow
          label="Smart guide matching, explanations and note organizing (Gemma)"
          ok={status.data?.gemma.configured}
          detail={status.data?.gemma.configured ? `Model: ${status.data.gemma.model}` : "Not set up. Plain title search and manual tools still work."}
        />
        <ServiceRow
          label="Live places search (Google Places)"
          ok={status.data?.places.configured}
          detail={
            status.data?.places.configured
              ? "Connected"
              : "Not set up. Find care uses the free U.S. national provider registry instead."
          }
        />
        <ServiceRow label="Reading text in photos" ok detail="Runs in your browser (Tesseract)." />
      </section>

      <p className="text-center text-[0.95rem]">
        <Link to="/about" className="font-semibold underline">
          About this app, content status and sources
        </Link>
      </p>
    </Page>
  );
}

function ServiceRow({ label, ok, detail }: { label: string; ok?: boolean | undefined; detail: string }) {
  return (
    <div className="flex items-start gap-3 border-t border-border pt-2 first-of-type:border-0">
      <span
        className={cn(
          "mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-[0.8rem] font-bold",
          ok ? "bg-sage-soft text-secondary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {ok === undefined ? "…" : ok ? "On" : "Off"}
      </span>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-[0.92rem] text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function ChoiceGroup<K extends keyof Prefs>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: Opt<K>;
  value: Prefs[K];
  onChange: (v: Prefs[K]) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-display text-xl font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Choice key={String(o.value)} selected={value === o.value} onClick={() => onChange((value === o.value ? null : o.value) as Prefs[K])}>
            {o.label}
          </Choice>
        ))}
      </div>
    </fieldset>
  );
}

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-12 rounded-full border-2 px-4 py-2 text-left font-semibold transition-colors",
        selected ? "border-primary bg-primary-soft text-accent-foreground" : "border-input bg-paper hover:bg-muted",
      )}
    >
      {selected ? <span className="sr-only">Selected: </span> : null}
      {children}
    </button>
  );
}
