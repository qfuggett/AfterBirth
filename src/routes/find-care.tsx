import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { lazy, Suspense, useState, type FormEvent } from "react";
import { Globe, List, Loader2, LocateFixed, Map as MapIcon, MapPin, Navigation, Phone, ExternalLink, Info } from "lucide-react";
import { Illustration, Page } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { CALL_CHECKLIST, CARE_CATEGORIES } from "@/lib/care-categories";
import { searchCare, type CareSearchResponse } from "@/lib/care.functions";
import { cn } from "@/lib/utils";

const CareMap = lazy(() => import("@/components/app/CareMap"));

export const Route = createFileRoute("/find-care")({
  head: () => ({
    meta: [
      { title: "Find care nearby — After Birth" },
      { name: "description", content: "Search for pediatricians, OB-GYNs, midwives and postpartum support near a ZIP code or your location." },
      { property: "og:title", content: "Find care nearby — After Birth" },
      { property: "og:description", content: "Search for pediatricians, OB-GYNs, midwives and postpartum support nearby." },
    ],
  }),
  component: FindCare,
});

function FindCare() {
  const [audience, setAudience] = useState<"baby" | "recovery">("baby");
  const [categoryId, setCategoryId] = useState("pediatrician");
  const [place, setPlace] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [result, setResult] = useState<CareSearchResponse | null>(null);
  const [pending, setPending] = useState(false);
  const search = useServerFn(searchCare);

  const cats = CARE_CATEGORIES.filter((c) => c.audience === audience);
  const category = CARE_CATEGORIES.find((c) => c.id === categoryId)!;

  const run = async (input: { place?: string; coords?: { lat: number; lng: number } }) => {
    setPending(true);
    setResult(null);
    try {
      setResult(await search({ data: { categoryId, ...input } }));
    } catch {
      setResult({ ok: false, reason: "service_error", message: "The search didn't respond. No results are shown." });
    } finally {
      setPending(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = place.trim();
    if (!p) return;
    setCoords(null);
    run({ place: p });
  };

  const useLocation = () => {
    setLocError(null);
    if (!("geolocation" in navigator)) {
      setLocError("Location isn't available in this browser. Enter a ZIP code instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Round to ~1 km so only an approximate location is sent.
        const c = { lat: Math.round(pos.coords.latitude * 100) / 100, lng: Math.round(pos.coords.longitude * 100) / 100 };
        setCoords(c);
        setLocating(false);
        run({ coords: c });
      },
      () => {
        setLocating(false);
        setLocError("Location wasn't shared. That's fine. Enter a ZIP code or city instead.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <Page className="space-y-6 pb-6">
      <header className="space-y-4">
        <Illustration src={IMAGES.findCare.src} alt="" priority className="aspect-[16/9]" />
        <div>
          <h1 className="text-[2rem] font-semibold">Find care nearby</h1>
          <p className="mt-1 text-lg text-muted-foreground">Possible clinicians near you, from a public directory.</p>
        </div>
      </header>

      <div role="tablist" aria-label="Who is the care for" className="grid grid-cols-2 gap-2 rounded-full bg-muted p-1.5">
        {(
          [
            ["baby", "For my baby"],
            ["recovery", "For my recovery"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={audience === id}
            onClick={() => {
              setAudience(id);
              setCategoryId(CARE_CATEGORIES.find((c) => c.audience === id)!.id);
              setResult(null);
            }}
            className={cn("min-h-12 rounded-full font-bold", audience === id ? "bg-paper text-primary shadow-soft" : "text-muted-foreground")}
          >
            {label}
          </button>
        ))}
      </div>

      <fieldset>
        <legend className="mb-2 font-display text-lg font-semibold">Type of care</legend>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={categoryId === c.id}
              onClick={() => {
                setCategoryId(c.id);
                setResult(null);
              }}
              className={cn(
                "min-h-12 rounded-full border-2 px-4 font-semibold",
                categoryId === c.id ? "border-primary bg-primary-soft text-accent-foreground" : "border-input bg-paper",
              )}
            >
              {c.label}
              {c.optional ? <span className="sr-only"> (specialist)</span> : null}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[0.95rem] text-muted-foreground">{category.description}</p>
        {category.caveat ? (
          <p className="mt-2 flex items-start gap-2 rounded-2xl bg-caution-soft px-4 py-3 text-[0.95rem]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-caution" aria-hidden />
            {category.caveat}
          </p>
        ) : null}
        {category.id === "perinatal-mental-health" ? (
          <p className="mt-2 text-[0.95rem]">
            <a href="https://postpartum.net/get-help/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold underline">
              Postpartum Support International: get help <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </p>
        ) : null}
      </fieldset>

      <section className="space-y-3">
        <form onSubmit={submit} className="space-y-2">
          <label htmlFor="place" className="block font-display text-lg font-semibold">
            ZIP code or city
          </label>
          <div className="flex gap-2">
            <input
              id="place"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="48201 or Detroit, MI"
              inputMode="text"
              autoComplete="postal-code"
              maxLength={80}
              className="min-h-12 w-full rounded-full border-2 border-input bg-paper px-4 text-base outline-none focus:border-primary"
            />
            <Button type="submit" disabled={!place.trim() || pending}>
              Search
            </Button>
          </div>
        </form>
        <Button variant="outline" className="w-full" onClick={useLocation} disabled={locating || pending}>
          {locating ? <Loader2 className="animate-spin" aria-hidden /> : <LocateFixed aria-hidden />}
          Use my current location
        </Button>
        <p className="text-[0.88rem] text-muted-foreground">
          Location is only asked for when you tap this, rounded to about 1 km, and never stored. Only your location is sent,
          never documents or notes.
        </p>
        {locError ? (
          <p role="alert" className="rounded-2xl bg-caution-soft px-4 py-3">
            {locError}
          </p>
        ) : null}
      </section>

      {pending ? (
        <p role="status" className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Searching the directory…
        </p>
      ) : null}

      {result && !result.ok ? (
        <p role="alert" className="rounded-2xl bg-muted px-4 py-3">
          {result.message}
        </p>
      ) : null}

      {result?.ok ? (
        <section className="space-y-4" aria-labelledby="results-h">
          <div>
            <h2 id="results-h" className="text-2xl font-semibold">
              {result.results.length} result{result.results.length === 1 ? "" : "s"} {result.origin?.label}
            </h2>
            <p className="text-[0.92rem] text-muted-foreground">
              Source: {result.directoryLabel}. {result.note}
            </p>
          </div>

          <details className="rounded-2xl bg-paper p-4 shadow-soft" open>
            <summary className="cursor-pointer font-display text-lg font-semibold">Not confirmed: ask when you call</summary>
            <p className="mt-1 text-[0.95rem] text-muted-foreground">
              Insurance, new-patient status, languages, accessibility and appointment times are not known from this directory.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {CALL_CHECKLIST.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </details>

          {result.results.length ? (
            <>
              <div role="tablist" aria-label="Results view" className="grid grid-cols-2 gap-2 rounded-full bg-muted p-1.5">
                <button role="tab" aria-selected={view === "list"} onClick={() => setView("list")} className={cn("flex min-h-11 items-center justify-center gap-2 rounded-full font-bold", view === "list" ? "bg-paper text-primary shadow-soft" : "text-muted-foreground")}>
                  <List className="h-4 w-4" aria-hidden /> List
                </button>
                <button role="tab" aria-selected={view === "map"} onClick={() => setView("map")} className={cn("flex min-h-11 items-center justify-center gap-2 rounded-full font-bold", view === "map" ? "bg-paper text-primary shadow-soft" : "text-muted-foreground")}>
                  <MapIcon className="h-4 w-4" aria-hidden /> Map
                </button>
              </div>

              {view === "map" && result.origin ? (
                <ClientOnly fallback={<div className="h-96 rounded-3xl bg-muted" />}>
                  <Suspense fallback={<div className="h-96 rounded-3xl bg-muted" />}>
                    <div className="overflow-hidden rounded-3xl shadow-soft">
                      <CareMap origin={result.origin} results={result.results} />
                    </div>
                  </Suspense>
                  <p className="text-[0.88rem] text-muted-foreground">
                    Only results with a confirmed address location appear on the map. All results are in the list.
                  </p>
                </ClientOnly>
              ) : null}

              <ol className="space-y-3">
                {result.results.map((r, i) => (
                  <li key={r.id} className="rounded-3xl bg-paper p-4 shadow-soft">
                    <div className="flex gap-3">
                      <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-[0.9rem] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-sans text-lg font-bold leading-snug">{r.name}</h3>
                        {r.specialty ? <p className="text-[0.95rem]">Listed as: {r.specialty}</p> : null}
                        {r.address ? (
                          <p className="mt-1 flex items-start gap-1.5 text-[0.95rem] text-muted-foreground">
                            <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden /> {r.address}
                          </p>
                        ) : null}
                        <p className="text-[0.9rem] text-muted-foreground">
                          {r.distanceMiles != null ? `About ${r.distanceMiles} mi away (straight line)` : "Distance not available"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.phone ? (
                        <Button asChild size="sm" variant="sage">
                          <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>
                            <Phone aria-hidden /> {r.phone}
                          </a>
                        </Button>
                      ) : null}
                      <Button asChild size="sm" variant="outline">
                        <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer">
                          <Navigation aria-hidden /> Directions
                        </a>
                      </Button>
                      {r.website ? (
                        <Button asChild size="sm" variant="outline">
                          <a href={r.website} target="_blank" rel="noopener noreferrer">
                            <Globe aria-hidden /> Website
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="rounded-2xl bg-muted px-4 py-3">
              The directory returned no matches here. Try a nearby city or a different type of care.
            </p>
          )}
        </section>
      ) : null}

      <p className="text-[0.9rem] text-muted-foreground">
        Results are sorted by distance; the closest isn't necessarily the best fit. This doesn't book appointments or replace
        emergency care. For an emergency, call 911.
      </p>
    </Page>
  );
}
