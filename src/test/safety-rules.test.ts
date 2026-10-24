import { describe, expect, it } from "vitest";
import { checkUrgent } from "@/lib/urgent";
import { searchTopics } from "@/lib/search";
import { validateRouteDecision } from "@/lib/route-validation";
import { validateExplanation, validateOrganizedNote, validateWordedQuestion } from "@/lib/assist-validation";
import { analyzePage, checkMissingPages } from "@/lib/doc-checks";
import { TOPICS, SECTION_IDS } from "@/content/topics";
import { SOURCES } from "@/content/catalog";

const ids = TOPICS.map((t) => t.id);

describe("catalog import", () => {
  it("imports all 45 topics with their sources", () => {
    expect(TOPICS).toHaveLength(45);
    for (const t of TOPICS) expect(t.sources.length).toBe(t.source_ids.length);
  });
  it("never labels draft content as clinically reviewed", () => {
    for (const t of TOPICS) expect(t.publication_status).toBe("research_outline_requires_clinical_review");
    expect(SOURCES).toHaveLength(43);
  });
});

describe("urgent check", () => {
  it("leads with help for a current heavy-bleeding report", () => {
    expect(checkUrgent("I'm bleeding heavily and feel faint").urgent).toBe(true);
  });
  it("routes newborn fever to baby help", () => {
    const r = checkUrgent("My newborn has a fever");
    expect(r.urgent).toBe(true);
    expect(r.audience).toBe("baby");
  });
  it("does not treat general education as urgent", () => {
    expect(checkUrgent("What is eclampsia?").urgent).toBe(false);
    expect(checkUrgent("Why do they check my reflexes on magnesium?").urgent).toBe(false);
  });
  it("flags severe headache with blurry vision", () => {
    expect(checkUrgent("I have a severe headache and blurry vision").urgent).toBe(true);
  });
});

describe("title search", () => {
  it("opens the magnesium page for a magnesium question", () => {
    expect(searchTopics("What is the magnesium drip for?")[0]?.topic.id).toBe("magnesium");
  });
  it("tolerates the misspelling 'preclampsia'", () => {
    expect(searchTopics("preclampsia after birth")[0]?.topic.id).toBe("preeclampsia");
  });
});

describe("Gemma route validation", () => {
  it("accepts a known topic and section", () => {
    expect(validateRouteDecision({ action: "open_page", topic_id: "magnesium", section_id: "why" }, ids, SECTION_IDS)).toEqual({
      action: "open_page",
      topicId: "magnesium",
      sectionId: "why",
    });
  });
  it("rejects nonexistent topic ids", () => {
    expect(() => validateRouteDecision({ action: "open_page", topic_id: "made-up" }, ids, SECTION_IDS)).toThrow();
  });
  it("rejects arbitrary URLs", () => {
    expect(() =>
      validateRouteDecision({ action: "open_page", topic_id: "magnesium", section_id: "https://evil.example" }, ids, SECTION_IDS),
    ).toThrow();
  });
  it("turns an urgent topic match into urgent help", () => {
    expect(validateRouteDecision({ action: "open_page", topic_id: "urgent-baby" }, ids, SECTION_IDS)).toEqual({
      action: "urgent_help",
      audience: "baby",
    });
  });
});

describe("document explanation guards", () => {
  const doc = "Ibuprofen 600 mg by mouth every 6 hours as needed for pain.";
  it("drops statements that don't quote the document", () => {
    const r = validateExplanation(
      { summary: "Pain medicine.", sections: [{ type: "medicines", title: "Medicines", items: [{ explanation: "Take aspirin.", source_quote: "Aspirin daily" }] }] },
      doc,
      [doc],
    );
    expect(r.sections).toHaveLength(0);
    expect(r.droppedUnsourced).toBe(1);
  });
  it("falls back to the original wording when a number is changed", () => {
    const r = validateExplanation(
      { summary: "Pain medicine.", sections: [{ type: "medicines", title: "Medicines", items: [{ explanation: "Take 800 mg every 6 hours.", source_quote: doc }] }] },
      doc,
      [doc],
    );
    expect(r.sections[0]?.items[0]?.explanation).toBe(doc);
    expect(r.sections[0]?.items[0]?.fellBackToOriginal).toBe(true);
  });
});

describe("on-device document checks", () => {
  it("flags a blurred medication dose instead of guessing", () => {
    const flags = analyzePage("Nifedipine mg by mouth once daily", [], 1);
    expect(flags.some((f) => f.kind === "unreadable-dose")).toBe(true);
  });
  it("flags a low-confidence dose number", () => {
    const flags = analyzePage("Nifedipine 3O mg once daily", [{ text: "3O", confidence: 40 }], 1);
    expect(flags.some((f) => f.kind === "unreadable-dose")).toBe(true);
  });
  it("detects a missing page from 'Page X of Y'", () => {
    expect(checkMissingPages(["... Page 1 of 3", "... Page 2 of 3"])?.message).toContain("3");
  });
});

describe("voice note guards", () => {
  it("keeps an uncertain medication recollection marked uncertain", () => {
    const transcript = "I think she said twice a day for the iron pill.";
    const r = validateOrganizedNote(
      {
        organized: [],
        questions: [],
        reported_tasks: [{ text: "Take iron twice a day", source_quote: "I think she said twice a day" }],
        related_topic_ids: ["anemia", "not-a-topic"],
      },
      transcript,
      ids,
    );
    expect(r.reportedTasks[0]?.uncertain).toBe(true);
    expect(r.relatedTopicIds).toEqual(["anemia"]);
  });
  it("rejects worded questions that add numbers", () => {
    expect(validateWordedQuestion("Should I take 2 pills?", "my pain medicine")).toBeNull();
    expect(validateWordedQuestion("What is my pain medicine for?", "my pain medicine")).toBe("What is my pain medicine for?");
  });
});
