import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Pause, Volume2 } from "lucide-react";
import { BackLink, Page } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { useSpeech, useStored } from "@/lib/hooks";
import { notifyChange, store } from "@/lib/db";

export const Route = createFileRoute("/questions/$questionId")({
  head: () => ({
    meta: [
      { title: "Show my question — After Birth" },
      { name: "description", content: "Your question in large text to show your nurse." },
      { property: "og:title", content: "Show my question — After Birth" },
      { property: "og:description", content: "Your question in large text to show your nurse." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ShowQuestion,
});

function ShowQuestion() {
  const { questionId } = Route.useParams();
  const { data: q, loading } = useStored(() => store.getQuestion(questionId), [questionId]);
  const speech = useSpeech();

  if (loading) return <Page>Loading…</Page>;
  if (!q)
    return (
      <Page className="space-y-4">
        <BackLink fallback="/questions" />
        <p>This question isn't saved on this device.</p>
        <Link to="/questions" className="font-semibold underline">
          Back to questions
        </Link>
      </Page>
    );

  return (
    <Page className="flex min-h-[calc(100dvh-10rem)] flex-col gap-6 pb-6">
      <BackLink fallback="/questions" />
      <div className="flex flex-1 flex-col justify-center rounded-3xl bg-paper p-6 shadow-lift">
        <p className="text-[0.95rem] font-bold uppercase tracking-wide text-muted-foreground">My question</p>
        <p className="mt-3 font-display text-[2rem] font-semibold leading-tight" lang="en">
          {q.text}
        </p>
      </div>
      <div className="grid gap-2">
        {speech.supported ? (
          <Button size="lg" variant="sage" onClick={() => (speech.speaking ? speech.stop() : speech.speak(q.text))}>
            {speech.speaking ? <Pause aria-hidden /> : <Volume2 aria-hidden />}
            {speech.speaking ? "Stop" : "Play aloud"}
          </Button>
        ) : null}
        <Button
          size="lg"
          variant="outline"
          aria-pressed={q.discussed}
          onClick={async () => {
            await store.putQuestion({ ...q, discussed: !q.discussed });
            notifyChange();
          }}
        >
          {q.discussed ? <CheckCircle2 aria-hidden /> : <Circle aria-hidden />}
          {q.discussed ? "Discussed" : "Mark as discussed"}
        </Button>
      </div>
      <p className="text-center text-[0.92rem] text-muted-foreground">Showing this doesn't send it to anyone.</p>
    </Page>
  );
}
