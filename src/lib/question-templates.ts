/**
 * Reviewed-style question templates for "Help me ask my nurse".
 * Slots are filled only with the person's own words.
 */

export type Concern = {
  id: string;
  label: string;
  slotLabel?: string;
  slotPlaceholder?: string;
  build: (slot: string) => string;
};

const clean = (s: string) => s.trim().replace(/[?.!]+$/, "");

export const CONCERNS: Concern[] = [
  {
    id: "medicine",
    label: "A medicine",
    slotLabel: "Medicine name (if you know it)",
    slotPlaceholder: "e.g. the white pill, or its name",
    build: (s) =>
      s ? `What is ${clean(s)} for, and is there anything I should know about taking it?` : "What is this medicine for, and is there anything I should know about taking it?",
  },
  {
    id: "check",
    label: "A check they keep doing",
    slotLabel: "What are they checking?",
    slotPlaceholder: "e.g. my blood pressure",
    build: (s) =>
      s
        ? `Could you explain how often you need to check my ${clean(s).replace(/^my\s+/i, "")} and what you are watching for?`
        : "Could you explain what you are checking, how often, and what you are watching for?",
  },
  {
    id: "test",
    label: "A test",
    slotLabel: "Which test?",
    slotPlaceholder: "e.g. blood test, ultrasound",
    build: (s) => (s ? `Why am I having the ${clean(s)}, and when will I hear the results?` : "Why am I having this test, and when will I hear the results?"),
  },
  {
    id: "food",
    label: "Eating or drinking",
    build: () => "What can I eat or drink right now, and when might that change?",
  },
  {
    id: "report",
    label: "What to report",
    build: () => "What should I tell you about immediately?",
  },
  {
    id: "discharge",
    label: "Going home",
    build: () => "What needs to happen before I can go home?",
  },
  {
    id: "pain",
    label: "Pain",
    build: () => "My pain isn't where I'd like it to be. What options do we have?",
  },
  {
    id: "activity",
    label: "Moving or activity",
    slotLabel: "What do you want to do?",
    slotPlaceholder: "e.g. walk to the bathroom, shower",
    build: (s) => (s ? `Is it okay for me to ${clean(s)}, and should someone help me?` : "What am I allowed to do right now, and should someone help me?"),
  },
  {
    id: "baby",
    label: "My baby",
    slotLabel: "What about your baby?",
    slotPlaceholder: "e.g. the heel prick test, feeding",
    build: (s) => (s ? `Could you explain ${clean(s)} for my baby?` : "Could you explain what is happening with my baby's care right now?"),
  },
  {
    id: "other",
    label: "Something else",
    slotLabel: "Your question, in your own words",
    slotPlaceholder: "Type what you want to ask",
    build: (s) => {
      const c = s.trim();
      if (!c) return "";
      return /[?]$/.test(c) ? c : `${c}?`;
    },
  },
];

export function getConcern(id: string) {
  return CONCERNS.find((c) => c.id === id);
}
