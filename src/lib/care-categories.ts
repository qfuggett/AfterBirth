/** Find-care categories and how each one is backed by real directory data. */

export type CareCategory = {
  id: string;
  audience: "baby" | "recovery";
  label: string;
  description: string;
  /** NPPES taxonomy description searched, and filter on returned taxonomy desc. */
  nppes: { query: string; descMatch: RegExp } | null;
  /** Google Places text query. */
  placesQuery: string;
  /** Honest note about what directory data can and can't confirm. */
  caveat?: string;
  optional?: boolean;
};

export const CARE_CATEGORIES: CareCategory[] = [
  {
    id: "pediatrician",
    audience: "baby",
    label: "Pediatrician",
    description: "Doctors who specialize in children's health.",
    nppes: { query: "Pediatrics", descMatch: /^Pediatrics(,\s*(General|Neonatal-Perinatal Medicine))?$|^Pediatrics$/i },
    placesQuery: "pediatrician",
  },
  {
    id: "family-newborn",
    audience: "baby",
    label: "Family medicine",
    description: "Family doctors. Many see newborns, but the directory does not confirm newborn care.",
    nppes: { query: "Family Medicine", descMatch: /^Family Medicine$/i },
    placesQuery: "family medicine doctor",
    caveat: "Newborn care is not confirmed by the directory. Call and ask whether they see newborns.",
  },
  {
    id: "obgyn",
    audience: "recovery",
    label: "OB-GYN",
    description: "Obstetrics and gynecology, including postpartum care.",
    nppes: { query: "Obstetrics & Gynecology", descMatch: /^Obstetrics & Gynecology(,\s*Maternal & Fetal Medicine)?$/i },
    placesQuery: "OB-GYN obstetrician",
  },
  {
    id: "midwife",
    audience: "recovery",
    label: "Midwife",
    description: "Certified and advanced practice midwives.",
    nppes: { query: "Midwife", descMatch: /^(Advanced Practice Midwife|Midwife)$/i },
    placesQuery: "certified nurse midwife",
  },
  {
    id: "primary-care",
    audience: "recovery",
    label: "Primary care",
    description: "Family medicine doctors for ongoing care.",
    nppes: { query: "Family Medicine", descMatch: /^Family Medicine$/i },
    placesQuery: "primary care doctor",
  },
  {
    id: "lactation",
    audience: "recovery",
    label: "Lactation support",
    description: "Lactation consultants listed in the national provider directory.",
    nppes: { query: "Lactation Consultant", descMatch: /Lactation Consultant/i },
    placesQuery: "lactation consultant",
    optional: true,
  },
  {
    id: "pelvic-floor",
    audience: "recovery",
    label: "Pelvic-floor care",
    description: "Pelvic-floor physical therapy.",
    nppes: null,
    placesQuery: "pelvic floor physical therapy",
    caveat:
      "The free national directory has no pelvic-floor specialty, so we only search this when a live places service is connected. Results are businesses describing themselves this way; ask about postpartum experience.",
    optional: true,
  },
  {
    id: "perinatal-mental-health",
    audience: "recovery",
    label: "Perinatal mental health",
    description: "Mental-health care for pregnancy and after birth.",
    nppes: null,
    placesQuery: "perinatal postpartum therapist",
    caveat:
      "No directory we use can confirm perinatal mental-health training. Postpartum Support International keeps its own provider directory.",
    optional: true,
  },
];

export function getCategory(id: string) {
  return CARE_CATEGORIES.find((c) => c.id === id);
}

export const CALL_CHECKLIST = [
  "Are you accepting new patients?",
  "Do you take my insurance (or Medicaid plan)?",
  "Do you see newborns / postpartum patients?",
  "How soon is the first available appointment?",
  "Which languages do your clinicians or interpreters speak?",
  "Is the office accessible (parking, elevators, stroller access)?",
];
