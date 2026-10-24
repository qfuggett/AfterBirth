import { Link } from "@tanstack/react-router";
import { Phone, MessageSquare } from "lucide-react";
import { BABY_WARNING_SIGNS, CRISIS_LINES, MATERNAL_WARNING_SIGNS } from "@/content/help";

export function CallButtons({ compact = false }: { compact?: boolean }) {
  const lines = compact ? CRISIS_LINES.slice(0, 2) : CRISIS_LINES;
  return (
    <div className="grid gap-2">
      {lines.map((l) => (
        <div key={l.id} className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${l.tel}`}
            className={
              l.id === "911"
                ? "inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-urgent px-5 text-lg font-bold text-urgent-foreground shadow-soft"
                : "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-urgent bg-paper px-5 font-bold text-urgent"
            }
          >
            <Phone className="h-5 w-5" aria-hidden />
            Call {l.number}
            <span className="sr-only">, {l.label}</span>
          </a>
          {"sms" in l && l.sms ? (
            <a
              href={`sms:${l.sms}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-urgent bg-paper px-4 font-bold text-urgent"
            >
              <MessageSquare className="h-5 w-5" aria-hidden />
              Text
              <span className="sr-only">{l.label}</span>
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function UrgentHelpContent({ audience, compact = false }: { audience: "maternal" | "baby"; compact?: boolean }) {
  if (audience === "baby") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Call 911 now if your baby:</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {BABY_WARNING_SIGNS.call911.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Call your baby's doctor right away if:</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {BABY_WARNING_SIGNS.callNow.map((s) => (
              <li key={s.text}>
                {s.text}. <span className="text-muted-foreground">{s.detail}</span>
              </li>
            ))}
          </ul>
        </div>
        <CallButtons compact />
        {compact ? (
          <Link to="/help" search={{ for: "baby" }} className="inline-block font-semibold text-urgent underline">
            Open the full help page
          </Link>
        ) : null}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <p>{MATERNAL_WARNING_SIGNS.intro}</p>
      <ul className="grid gap-1.5">
        {MATERNAL_WARNING_SIGNS.signs.map((s) => (
          <li key={s} className="flex gap-2">
            <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-urgent" />
            <span>{s}</span>
          </li>
        ))}
      </ul>
      <CallButtons compact={compact} />
      {compact ? (
        <Link to="/help" search={{ for: "me" }} className="inline-block font-semibold text-urgent underline">
          Open the full help page
        </Link>
      ) : null}
    </div>
  );
}
