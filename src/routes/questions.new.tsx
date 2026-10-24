import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Maximize2, Pause, Save, Sparkles, Volume2 } from "lucide-react";
import { BackLink, OriginTag, Page } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getTopic } from "@/content/topics";
import { CONCERNS, getConcern } from "@/lib/question-templates";
import { wordQuestion } from "@/lib/assist.functions";
import { newId, notifyChange, store } from "@/lib/db";
import { useServiceStatus, useSpeech } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/questions/new")({
  validateSearch: z.object({ topic: z.string().max(80).optional() }),
  head: () => ({
    meta: [
      { title: "Prepare a question — After Birth" },
      { name: "description", content: "Choose a concern and get one clear, editable question for your nurse." },
      { property: "og:title", content: "Prepare a question — After Birth" },
      { property: "og:description", content: "Choose a concern and get one clear, editable question for your nurse." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewQuestion,
});

function NewQuestion() {
  const { topic: topicId } = Route.useSearch();
  const topic = topicId ? getTopic(topicId) : undefined;
  const navigate = useNavigate();
  const speech = useSpeech();
  const status = useServiceStatus();
  const polish = useServerFn(wordQuestion);

  const [concernId, setConcernId] = useState<string | null>(topic ? "topic" : null);
  const [slot, setSlot] = useState("");
  const [topicQ, setTopicQ] = useState(0);
  const [edited, setEdited] = useState<string | null>(null);
  const [wordedBy, setWordedBy] = useState<"template" | "you" | "gemma">("template");
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [polishing, setPolishing] = useState(false);
  const [consented, setConsented] = useState(false);

  const concern = concernId && concernId !== "topic" ? getConcern(concernId) : undefined;
  const suggested = useMemo(() => {
    if (concernId === "topic" && topic) return topic.questions[topicQ] ?? "";
    return concern ? concern.build(slot) : "";
  }, [concernId, topic, topicQ, concern, slot]);
  const text = edited ?? suggested;

  const choose = (id: string) => {
    setConcernId(id);
    setEdited(null);
    setWordedBy("template");
    setSlot("");
  };

  const save = async (thenShow: boolean) => {
    const t = text.trim();
    if (!t) return;
    const id = newId();
    await store.putQuestion({
      id,
      text: t,
      concern: concernId === "topic" && topic ? topic.title : (concern?.label ?? "Question"),
      topicId: topic?.id,
      discussed: false,
      wordedBy,
      createdAt: Date.now(),
    });
    notifyChange();
    toast.success("Question saved");
    if (thenShow) navigate({ to: "/questions/$questionId", params: { questionId: id } });
    else navigate({ to: "/questions" });
  };

  const runPolish = async () => {
    if (!slot.trim()) return;
    setPolishing(true);
    try {
      const r = await polish({ data: { concern: concern?.label ?? "Question", facts: slot } });
      if (r.ok) {
        setEdited(r.question);
        setWordedBy("gemma");
        setAiModel(r.model);
      } else {
        toast.error(`${r.message} We kept the template wording.`);
      }
    } catch {
      toast.error("Gemma couldn't be reached. We kept the template wording.");
    } finally {
      setPolishing(false);
    }
  };

  return (
    <Page className="space-y-6 pb-6">
      <BackLink fallback="/questions" />
      <h1 className="text-[2rem] font-semibold">What would you like to ask?</h1>

      <fieldset>
        <legend className="mb-3 font-display text-xl font-semibold">1. Choose a concern</legend>
        <div className="flex flex-wrap gap-2">
          {topic ? (
            <ChoiceChip selected={concernId === "topic"} onClick={() => choose("topic")}>
              About: {topic.title}
            </ChoiceChip>
          ) : null}
          {CONCERNS.map((c) => (
            <ChoiceChip key={c.id} selected={concernId === c.id} onClick={() => choose(c.id)}>
              {c.label}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      {concernId === "topic" && topic ? (
        <fieldset>
          <legend className="mb-3 font-display text-xl font-semibold">2. Pick a starting question</legend>
          <div className="grid gap-2">
            {topic.questions.map((q, i) => (
              <ChoiceChip
                key={q}
                selected={topicQ === i}
                onClick={() => {
                  setTopicQ(i);
                  setEdited(null);
                }}
              >
                {q}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>
      ) : concern?.slotLabel ? (
        <div className="space-y-2">
          <label htmlFor="slot" className="block font-display text-xl font-semibold">
            2. {concern.slotLabel}
          </label>
          <Textarea
            id="slot"
            value={slot}
            onChange={(e) => {
              setSlot(e.target.value);
              setEdited(null);
              setWordedBy("template");
            }}
            maxLength={500}
            placeholder={concern.slotPlaceholder}
            className="min-h-20 rounded-2xl bg-paper text-base"
          />
          {status.data?.gemma.configured && slot.trim().length > 2 ? (
            <div className="rounded-2xl bg-muted p-3 text-[0.95rem]">
              {!consented ? (
                <>
                  <p>
                    Optional: Gemma can reword your question. Only the words in this box are sent to the Gemma service
                    for this one request. It won't add advice.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setConsented(true)}>
                    I understand, show the option
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={runPolish} disabled={polishing}>
                  {polishing ? <Loader2 className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />}
                  Reword with Gemma
                </Button>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {text || concern ? (
        <section className="space-y-3" aria-labelledby="suggested-h">
          <h2 id="suggested-h" className="font-display text-xl font-semibold">
            3. Your question
          </h2>
          <div className="rounded-3xl bg-primary-soft p-4">
            <label htmlFor="final" className="sr-only">
              Edit your question
            </label>
            <Textarea
              id="final"
              value={text}
              onChange={(e) => {
                setEdited(e.target.value);
                setWordedBy("you");
              }}
              maxLength={600}
              className="min-h-28 border-0 bg-transparent p-0 text-[1.2rem] font-semibold leading-snug shadow-none focus-visible:ring-0"
            />
            <div className="mt-2">
              <OriginTag
                origin={wordedBy === "gemma" ? "ai" : wordedBy === "you" ? "you" : "template"}
                detail={wordedBy === "gemma" && aiModel ? aiModel : undefined}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => save(false)} disabled={!text.trim()}>
              <Save aria-hidden /> Save
            </Button>
            <Button variant="sage" onClick={() => save(true)} disabled={!text.trim()}>
              <Maximize2 aria-hidden /> Save & show large
            </Button>
            {speech.supported ? (
              <Button variant="outline" onClick={() => (speech.speaking ? speech.stop() : speech.speak(text))} disabled={!text.trim()}>
                {speech.speaking ? <Pause aria-hidden /> : <Volume2 aria-hidden />}
                {speech.speaking ? "Stop" : "Play aloud"}
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
    </Page>
  );
}

function ChoiceChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-12 rounded-2xl border-2 px-4 py-2 text-left font-semibold transition-colors",
        selected ? "border-primary bg-primary-soft text-accent-foreground" : "border-input bg-paper hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
