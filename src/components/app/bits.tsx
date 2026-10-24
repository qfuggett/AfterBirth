import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, FileText, ScanText, Mic, Sparkles, BookOpenCheck, FlaskConical, PencilLine, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-lg px-5 pt-4", className)}>{children}</div>;
}

export function BackLink({ fallback = "/", label = "Back" }: { fallback?: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.history.back();
        else router.navigate({ to: fallback });
      }}
      className="tap -ml-2 inline-flex items-center gap-1.5 rounded-full px-2 font-semibold text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
      {label}
    </button>
  );
}

export type Origin = "original" | "ocr" | "voice" | "ai" | "guide" | "demo" | "you" | "template";

const ORIGIN: Record<Origin, { label: string; icon: typeof FileText; cls: string }> = {
  original: { label: "Your original document", icon: FileText, cls: "bg-muted text-ink-soft" },
  ocr: { label: "Text read from your photo", icon: ScanText, cls: "bg-caution-soft text-caution" },
  voice: { label: "Your voice note", icon: Mic, cls: "bg-sage-soft text-secondary-foreground" },
  ai: { label: "AI-assisted explanation", icon: Sparkles, cls: "bg-primary-soft text-accent-foreground" },
  guide: { label: "Guide information (research draft)", icon: BookOpenCheck, cls: "bg-sage-soft text-secondary-foreground" },
  demo: { label: "Fictional demo material", icon: FlaskConical, cls: "bg-caution-soft text-caution" },
  you: { label: "Written by you", icon: PencilLine, cls: "bg-muted text-ink-soft" },
  template: { label: "Suggested template", icon: BookOpenCheck, cls: "bg-sage-soft text-secondary-foreground" },
};

export function OriginTag({ origin, detail, className }: { origin: Origin; detail?: string | undefined; className?: string }) {
  const o = ORIGIN[origin];
  const Icon = o.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.82rem] font-bold", o.cls, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {o.label}
      {detail ? <span className="font-normal">· {detail}</span> : null}
    </span>
  );
}

export function DraftNotice({ compact = false, outline = false }: { compact?: boolean; outline?: boolean }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-2xl bg-caution-soft px-4 py-3 text-[0.95rem] text-foreground",
        compact && "py-2 text-[0.88rem]",
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-caution" aria-hidden />
      <span>
        <strong>{outline ? "Research outline." : "Prototype draft."}</strong>{" "}
        Not yet clinically reviewed. Your own care team's instructions come first.{" "}
        <Link to="/about" className="font-semibold underline">
          About this app
        </Link>
      </span>
    </p>
  );
}

export function SectionTitle({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <h2 id={id} className={cn("text-2xl font-semibold", className)}>
      {children}
    </h2>
  );
}

export function Illustration({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden rounded-3xl bg-muted", className)}>
      <img
        src={src}
        alt={alt}
        width={1024}
        height={768}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-border bg-paper/60 px-5 py-8 text-center">
      <p className="font-display text-xl font-semibold">{title}</p>
      {children ? <div className="mt-2 text-muted-foreground">{children}</div> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
