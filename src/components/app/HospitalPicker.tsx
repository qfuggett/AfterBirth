import { Building2, ChevronDown, ExternalLink, Phone } from "lucide-react";
import { HOSPITAL_GROUPS, HOSPITALS_CHECKED_ON, getHospital, primaryNumber, telHref } from "@/content/hospitals";
import { usePrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";

/** Native drop-down of Detroit-area birthing hospitals. Saved on this device only. */
export function HospitalSelect({ id = "hospital-select", className }: { id?: string; className?: string }) {
  const { prefs, update } = usePrefs();
  return (
    <div className={cn("relative min-w-0", className)}>
      <select
        id={id}
        value={prefs.hospitalSite ?? ""}
        onChange={(e) => {
          const h = getHospital(e.target.value);
          update({ hospitalSite: h?.id ?? null, ...(h ? { hospital: h.system } : {}) });
        }}
        className="h-11 w-full min-w-0 appearance-none truncate rounded-full border border-border bg-paper pl-4 pr-9 text-[0.95rem] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Choose your Detroit-area hospital</option>
        {HOSPITAL_GROUPS.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.city})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  );
}

/** Compact row shown next to "Get help now": pick a hospital, then call it in one tap. */
export function HospitalBar() {
  const { prefs } = usePrefs();
  const h = prefs.hospitalSite ? getHospital(prefs.hospitalSite) : undefined;
  const num = h ? primaryNumber(h) : undefined;
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="hospital-bar-select" className="sr-only">
        Your hospital
      </label>
      <Building2 className="h-5 w-5 shrink-0 text-sage" aria-hidden />
      <HospitalSelect id="hospital-bar-select" className="flex-1" />
      {h && num ? (
        <a
          href={telHref(num.number)}
          aria-label={`Call ${h.name}, ${num.label}, ${num.number}`}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-sage px-3.5 text-[0.95rem] font-bold text-sage-foreground hover:bg-sage/90"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
      ) : null}
    </div>
  );
}

/** Phone numbers for the chosen hospital, for the Get help page. */
export function HospitalNumbersCard() {
  const { prefs, ready } = usePrefs();
  const h = prefs.hospitalSite ? getHospital(prefs.hospitalSite) : undefined;
  return (
    <section className="space-y-3 rounded-3xl bg-paper p-5 shadow-soft" aria-labelledby="your-hospital-heading">
      <h2 id="your-hospital-heading" className="flex items-center gap-2 text-xl font-semibold">
        <Building2 className="h-5 w-5 text-sage" aria-hidden />
        Your hospital
      </h2>
      {!ready ? null : h ? (
        <>
          <p className="font-semibold">
            {h.name} <span className="font-normal text-muted-foreground">· {h.city}</span>
          </p>
          <ul className="space-y-2">
            {h.numbers.map((n) => (
              <li key={n.number}>
                <a
                  href={telHref(n.number)}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-border px-4 py-2 hover:bg-muted/60"
                >
                  <Phone className="h-5 w-5 shrink-0 text-sage" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9rem] text-muted-foreground">{n.label}</span>
                    <span className="block text-lg font-bold">{n.number}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-[0.92rem] text-muted-foreground">
            Still in the hospital? Press your call button or tell your nurse. For an emergency, call 911. Numbers come from
            the hospital's own website, checked {HOSPITALS_CHECKED_ON}.{" "}
            <a href={h.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold underline">
              Hospital page <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </p>
          <label htmlFor="hospital-help-select" className="block pt-1 text-[0.92rem] font-semibold">
            Change hospital
          </label>
          <HospitalSelect id="hospital-help-select" />
        </>
      ) : (
        <>
          <p className="text-[0.95rem] text-muted-foreground">
            Choose where you gave birth to keep its phone numbers here. Saved on this phone only; the app doesn't contact the
            hospital.
          </p>
          <label htmlFor="hospital-help-select" className="sr-only">
            Your hospital
          </label>
          <HospitalSelect id="hospital-help-select" />
        </>
      )}
    </section>
  );
}
