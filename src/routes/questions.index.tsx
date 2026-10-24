import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Maximize2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, Illustration, OriginTag, Page } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { useStored } from "@/lib/hooks";
import { notifyChange, store, type SavedQuestion } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/questions/")({
  head: () => ({
    meta: [
      { title: "Questions for your nurse — After Birth" },
      { name: "description", content: "Prepare clear questions to show or read to your nurse or care team." },
      { property: "og:title", content: "Questions for your nurse — After Birth" },
      { property: "og:description", content: "Prepare clear questions to show or read to your nurse." },
    ],
  }),
  component: QuestionsPage,
});

function QuestionsPage() {
  const { data: questions, loading } = useStored(() => store.listQuestions());
  const open = (questions ?? []).filter((q) => !q.discussed);
  const done = (questions ?? []).filter((q) => q.discussed);

  return (
    <Page className="space-y-6 pb-6">
      <header className="space-y-4">
        <Illustration src={IMAGES.questions.src} alt={IMAGES.questions.alt} priority className="aspect-[16/9]" />
        <div>
          <h1 className="text-[2rem] font-semibold">Help me ask my nurse</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Turn a worry into one clear question. Show it on screen or play it aloud.
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link to="/questions/new">
            <Plus aria-hidden /> Prepare a question
          </Link>
        </Button>
        <p className="text-[0.92rem] text-muted-foreground">
          Questions stay on this phone. Showing one doesn't send it to staff or call anyone.
        </p>
      </header>

      {loading ? null : !questions?.length ? (
        <EmptyState title="No saved questions yet">
          Save questions here, or tap "Save" on any guide page's questions list.
        </EmptyState>
      ) : (
        <>
          <QuestionGroup title="Not yet discussed" items={open} />
          {done.length ? <QuestionGroup title="Discussed" items={done} /> : null}
        </>
      )}
    </Page>
  );
}

function QuestionGroup({ title, items }: { title: string; items: SavedQuestion[] }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">
        {title} <span className="text-muted-foreground">({items.length})</span>
      </h2>
      <ul className="space-y-3">
        {items.map((q) => (
          <li key={q.id} className={cn("rounded-3xl bg-paper p-4 shadow-soft", q.discussed && "opacity-80")}>
            <p className="text-[1.08rem] font-semibold leading-snug">{q.text}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <OriginTag origin={q.wordedBy === "gemma" ? "ai" : q.wordedBy === "you" ? "you" : "template"} />
              <span className="text-[0.88rem] text-muted-foreground">{q.concern}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="soft" size="sm">
                <Link to="/questions/$questionId" params={{ questionId: q.id }}>
                  <Maximize2 aria-hidden /> Show large
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-pressed={q.discussed}
                onClick={async () => {
                  await store.putQuestion({ ...q, discussed: !q.discussed });
                  notifyChange();
                }}
              >
                {q.discussed ? <CheckCircle2 aria-hidden /> : <Circle aria-hidden />}
                {q.discussed ? "Discussed" : "Mark discussed"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await store.deleteQuestion(q.id);
                  notifyChange();
                  toast("Question deleted");
                }}
              >
                <Trash2 aria-hidden /> Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
