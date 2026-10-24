import { ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { HOSPITAL_SYSTEMS, isNationalSource, verificationLabel, type Source } from "@/content/catalog";
import { usePrefs } from "@/lib/prefs";

export function SourceList({ sources }: { sources: Source[] }) {
  const { prefs } = usePrefs();
  const hospital = HOSPITAL_SYSTEMS.find((h) => h.id === prefs.hospital);
  return (
    <ul className="space-y-3">
      {sources.map((s) => {
        const v = verificationLabel(s.verification);
        const national = isNationalSource(s);
        const sameSystem = hospital?.publisherMatch && s.publisher.startsWith(hospital.publisherMatch);
        let applicability: string;
        if (national) applicability = "National or state guidance, not a hospital procedure.";
        else if (sameSystem) applicability = "Published by your hospital system. Still confirm with your unit.";
        else if (hospital && hospital.id !== "other")
          applicability = "From a different health system. Procedures at your hospital may differ.";
        else applicability = "Published by one health system. Procedures at your hospital may differ.";
        return (
          <li key={s.id} className="rounded-2xl border border-border bg-paper p-4">
            <p className="text-[0.85rem] font-bold uppercase tracking-wide text-muted-foreground">
              {s.publisher} · <span className="normal-case tracking-normal">{s.geography}</span>
            </p>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-start gap-1.5 font-semibold text-primary underline"
            >
              {s.title}
              <ExternalLink className="mt-1 h-4 w-4 shrink-0" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.92rem]">
              <dt className="text-muted-foreground">Published</dt>
              <dd>{s.published_or_revised ?? "Date not stated"}</dd>
              <dt className="text-muted-foreground">Checked</dt>
              <dd>{s.checked_on}</dd>
              <dt className="text-muted-foreground">Access</dt>
              <dd className="flex items-start gap-1.5">
                {v.caution ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-caution" aria-hidden />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden />
                )}
                {v.label}
              </dd>
            </dl>
            <p className="mt-2 text-[0.92rem]">
              <span className="font-semibold">Applies to: </span>
              {applicability}
            </p>
            <p className="mt-1 text-[0.92rem] text-muted-foreground">
              <span className="font-semibold text-foreground">Limitations: </span>
              {s.limitations}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
