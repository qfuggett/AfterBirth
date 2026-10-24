/**
 * Predefined urgent-help content. Shown without any AI involvement.
 * Draft wording that still requires clinical review.
 */

export const MATERNAL_WARNING_SIGNS = {
  sourceIds: ["N01", "N08"],
  intro:
    "Get medical care right away if you have any of these during pregnancy or in the year after birth. If it is an emergency, call 911 and say you were pregnant in the last year.",
  signs: [
    "Headache that won't go away or gets worse over time",
    "Dizziness or fainting",
    "Changes in your vision",
    "Fever of 100.4°F (38°C) or higher",
    "Extreme swelling of your hands or face",
    "Thoughts about harming yourself or your baby",
    "Trouble breathing",
    "Chest pain or fast-beating heart",
    "Severe nausea and throwing up",
    "Severe belly pain that doesn't go away",
    "Heavy vaginal bleeding or leaking fluid that smells bad",
    "Swelling, redness or pain of your leg",
    "Overwhelming tiredness",
  ],
};

export const BABY_WARNING_SIGNS = {
  sourceIds: ["N07", "CW02"],
  call911: [
    "Your baby is not breathing, is struggling to breathe, or has long pauses in breathing",
    "Lips, tongue or face look blue or gray",
    "Your baby is limp, or you cannot wake them",
    "Your baby has a seizure",
  ],
  callNow: [
    {
      text: "Your baby is younger than 3 months and has a temperature of 100.4°F (38°C) or higher",
      detail: "Call your baby's doctor right away, even at night. The American Academy of Pediatrics advises a rectal temperature for young infants.",
    },
  ],
  note: "Keep newborn warning signs separate from your own symptoms. If you are unsure, call your baby's doctor or 911.",
};

export const CRISIS_LINES = [
  {
    id: "911",
    label: "Emergency",
    number: "911",
    tel: "911",
    detail: "For any emergency for you or your baby.",
  },
  {
    id: "988",
    label: "988 Suicide & Crisis Lifeline",
    number: "988",
    tel: "988",
    sms: "988",
    detail: "Call or text, 24 hours. For thoughts of harming yourself or your baby, or emotional crisis.",
    url: "https://988lifeline.org/",
  },
  {
    id: "tlc-mama",
    label: "National Maternal Mental Health Hotline",
    number: "1-833-852-6262",
    tel: "18338526262",
    sms: "18338526262",
    detail: "Call or text 1-833-TLC-MAMA, 24 hours, for pregnant and new parents and their families. Not for emergencies.",
    url: "https://mchb.hrsa.gov/programs-impact/national-maternal-mental-health-hotline",
  },
];
