/**
 * A simple, deliberately cautious check for questions that may describe a
 * current urgent symptom. This is NOT a reliable emergency detector; it only
 * decides whether to lead with predefined help content. The help page is
 * always reachable without it.
 */

const SYMPTOM_PATTERNS: RegExp[] = [
  /bleed(ing)? (a lot|heavily|heavy|through)|heavy bleeding|soak(ing|ed)? (a |through|my )?pad|big clots?|large clots?|golf ?ball/,
  /faint(ed|ing)?|pass(ed)? out|dizz(y|iness)|lighthead/,
  /chest (pain|hurts?|tight)|heart (is )?(racing|pounding)|racing heart/,
  /can'?t breathe|cannot breathe|trouble breathing|hard to breathe|short(ness)? of breath|struggling to breathe/,
  /(worst|severe|bad|terrible|pounding) headache|headache (won'?t|that won'?t|will not) (go|stop)/,
  /blurr?y vision|vision (is )?(changes?|blurry|spots)|seeing (spots|stars|flashing)/,
  /seizure|convuls|fitting/,
  /fever|temperature of|temp (of|is)|100\.[4-9]|10[1-4](\.\d)? ?(f|degrees)|3[89](\.\d)? ?c\b/,
  /(harm|hurt|kill) (myself|my ?self|my baby|the baby)|suicid|end my life|don'?t want to (live|be here)/,
  /(leg|calf) (is )?(swollen|red|hot|painful|hurts)|swollen (leg|calf)/,
  /severe (belly|stomach|abdominal) pain|belly pain (won'?t|that won'?t)/,
  /(face|hands?) (is |are )?(very |really )?swollen|extreme swelling/,
  /smell(s|y)? bad|foul (smell|discharge)/,
  /vomit(ing)? (a lot|everything)|can'?t keep (anything|water) down/,
  /(baby|newborn|infant).{0,30}(blue|gray|grey|not breathing|limp|won'?t wake|can'?t wake|unresponsive|floppy)/,
  /(blue|gray|grey) (lips|face|baby)|can'?t wake (him|her|them|my baby|the baby)/,
];

const EDUCATION_LEADS = /^(what('?s| is| are| does)|why (do|does|is|are)|how (do|does|is)|can you explain|explain|define|meaning of|tell me about)\b/;
const PERSONAL_CUES = /\b(i|i'?m|i'?ve|my|me|mine|she|he|her|his|wife|partner|girlfriend|baby is|baby has|baby'?s|newborn is|newborn has|right now|now|today|tonight|keeps?|won'?t|can'?t)\b/;
const BABY_CUES = /\b(baby|newborn|infant|son|daughter|little one)\b/;

export type UrgentCheck = {
  /** Lead with predefined help content. */
  urgent: boolean;
  /** A symptom phrase was mentioned, even in a general question. */
  mentionsWarningSymptom: boolean;
  audience: "maternal" | "baby";
};

export function checkUrgent(input: string): UrgentCheck {
  const q = input.toLowerCase().replace(/\s+/g, " ").trim();
  const mentions = SYMPTOM_PATTERNS.some((p) => p.test(q));
  const personal = PERSONAL_CUES.test(q);
  const education = EDUCATION_LEADS.test(q) && !/\b(i|i'?m|my|me)\b/.test(q);
  const audience = BABY_CUES.test(q) && /(baby|newborn|infant).{0,40}(fever|blue|gray|grey|breath|limp|wake|seizure|temperature|floppy)|(fever|temperature).{0,30}(baby|newborn|infant)/.test(q)
    ? "baby"
    : "maternal";
  return {
    urgent: mentions && (personal || !education),
    mentionsWarningSymptom: mentions,
    audience,
  };
}
