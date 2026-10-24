import type { HospitalId } from "./catalog";

/**
 * Detroit-area hospitals that deliver babies, with phone numbers taken from each
 * hospital's own website. Never add a number that wasn't confirmed on an
 * official page; when a unit number isn't published, list only the main line.
 */
export const HOSPITALS_CHECKED_ON = "October 24, 2026";

export type HospitalNumber = { label: string; number: string };

export type DetroitHospital = {
  id: string;
  name: string;
  city: string;
  group: string;
  /** Health-system id used to label which guide sources come from this system. */
  system: HospitalId;
  numbers: HospitalNumber[];
  sourceUrl: string;
};

const MAIN = "Main hospital line";

export const DETROIT_HOSPITALS: DetroitHospital[] = [
  // Henry Ford Health
  {
    id: "hf-detroit", name: "Henry Ford Hospital", city: "Detroit", group: "Henry Ford Health", system: "henry-ford",
    numbers: [{ label: "Birthing center information", number: "(313) 916-0397" }, { label: MAIN, number: "(313) 916-2600" }],
    sourceUrl: "https://www.henryford.com/services/baby/birthing-centers",
  },
  {
    id: "hf-st-john", name: "Henry Ford St. John Hospital", city: "Detroit", group: "Henry Ford Health", system: "henry-ford",
    numbers: [{ label: MAIN, number: "(313) 343-4000" }],
    sourceUrl: "https://www.henryford.com/locations/st-john-hospital",
  },
  {
    id: "hf-west-bloomfield", name: "Henry Ford West Bloomfield Hospital", city: "West Bloomfield", group: "Henry Ford Health", system: "henry-ford",
    numbers: [{ label: MAIN, number: "(248) 325-1000" }],
    sourceUrl: "https://www.henryford.com/locations/west-bloomfield",
  },
  {
    id: "hf-macomb", name: "Henry Ford Macomb Hospital", city: "Clinton Township", group: "Henry Ford Health", system: "henry-ford",
    numbers: [{ label: "Birthing center information", number: "(586) 263-2410" }, { label: MAIN, number: "(586) 263-2300" }],
    sourceUrl: "https://www.henryford.com/services/baby/birthing-centers",
  },
  {
    id: "hf-wyandotte", name: "Henry Ford Wyandotte Hospital", city: "Wyandotte", group: "Henry Ford Health", system: "henry-ford",
    numbers: [{ label: "Birthing center information", number: "(734) 246-6023" }, { label: MAIN, number: "(734) 246-6000" }],
    sourceUrl: "https://www.henryford.com/services/baby/birthing-centers",
  },
  {
    id: "hf-providence-southfield", name: "Henry Ford Providence Southfield Hospital", city: "Southfield", group: "Henry Ford Health", system: "henry-ford",
    numbers: [{ label: MAIN, number: "(248) 849-3000" }],
    sourceUrl: "https://www.henryford.com/locations/providence-southfield-hospital",
  },
  {
    id: "hf-providence-novi", name: "Henry Ford Providence Novi Hospital", city: "Novi", group: "Henry Ford Health", system: "henry-ford",
    numbers: [{ label: MAIN, number: "(248) 465-4100" }],
    sourceUrl: "https://www.henryford.com/locations/providence-novi-hospital",
  },
  {
    id: "hf-rochester", name: "Henry Ford Rochester Hospital", city: "Rochester", group: "Henry Ford Health", system: "henry-ford",
    numbers: [{ label: MAIN, number: "(248) 652-5000" }],
    sourceUrl: "https://www.henryford.com/locations/rochester-hospital",
  },

  // Detroit Medical Center
  {
    id: "dmc-hutzel", name: "DMC Hutzel Women's Hospital", city: "Detroit", group: "Detroit Medical Center", system: "dmc",
    numbers: [{ label: "DMC main line (all DMC hospitals; press 3 for a nurse)", number: "(888) 362-2500" }],
    sourceUrl: "https://www.dmc.org/services/obstetrics/birthing-centers/hutzel-birthing-center",
  },
  {
    id: "dmc-sinai-grace", name: "DMC Sinai-Grace Hospital", city: "Detroit", group: "Detroit Medical Center", system: "dmc",
    numbers: [{ label: MAIN, number: "(313) 966-3300" }],
    sourceUrl: "https://www.dmc.org/locations/detail/dmc-sinai-grace-hospital",
  },
  {
    id: "dmc-huron-valley", name: "DMC Huron Valley-Sinai Hospital", city: "Commerce Township", group: "Detroit Medical Center", system: "dmc",
    numbers: [{ label: "Harris Birthing Center", number: "(248) 937-5220" }],
    sourceUrl: "https://www.dmc.org/locations/detail/harris-birthing-center-at-dmc-huron-valley-sinai-hospital",
  },

  // Corewell Health
  {
    id: "cw-royal-oak", name: "Corewell Health William Beaumont University Hospital", city: "Royal Oak", group: "Corewell Health", system: "corewell",
    numbers: [{ label: MAIN, number: "(248) 898-5000" }],
    sourceUrl: "https://corewellhealth.org/contact-us",
  },
  {
    id: "cw-troy", name: "Corewell Health Beaumont Troy Hospital", city: "Troy", group: "Corewell Health", system: "corewell",
    numbers: [{ label: "Family Birth Center", number: "(248) 964-3595" }, { label: MAIN, number: "(248) 964-5000" }],
    sourceUrl: "https://corewellhealth.org/locations/LOC0000193214/corewell-health-beaumont-troy-hospital-family-birth-center-3-west",
  },
  {
    id: "cw-dearborn", name: "Corewell Health Dearborn Hospital", city: "Dearborn", group: "Corewell Health", system: "corewell",
    numbers: [{ label: "Main hospital line (also listed for the Birth Center)", number: "(313) 593-7000" }],
    sourceUrl: "https://corewellhealth.org/locations/LOC0000194878/corewell-health-dearborn-hospital-birth-center",
  },
  {
    id: "cw-farmington-hills", name: "Corewell Health Farmington Hills Hospital", city: "Farmington Hills", group: "Corewell Health", system: "corewell",
    numbers: [{ label: "Main hospital line (also listed for the Family Birth Center)", number: "(248) 471-8000" }],
    sourceUrl: "https://corewellhealth.org/locations/LOC0000194962/corewell-health-farmington-hills-hospital-family-birth-center",
  },
  {
    id: "cw-grosse-pointe", name: "Corewell Health Beaumont Grosse Pointe Hospital", city: "Grosse Pointe", group: "Corewell Health", system: "corewell",
    numbers: [{ label: MAIN, number: "(313) 473-1000" }],
    sourceUrl: "https://corewellhealth.org/contact-us",
  },
  {
    id: "cw-trenton", name: "Corewell Health Trenton Hospital", city: "Trenton", group: "Corewell Health", system: "corewell",
    numbers: [{ label: "Birth Center", number: "(734) 671-3950" }, { label: MAIN, number: "(734) 671-3800" }],
    sourceUrl: "https://corewellhealth.org/locations/LOC0000194971/corewell-health-trenton-hospital-birth-center",
  },

  // Trinity Health Michigan
  {
    id: "th-oakland", name: "Trinity Health Oakland Hospital", city: "Pontiac", group: "Trinity Health", system: "other",
    numbers: [{ label: "Birth Center", number: "(248) 858-3525" }, { label: MAIN, number: "(248) 858-3000" }],
    sourceUrl: "https://www.trinityhealthmichigan.org/location/trinity-health-birth-center-oakland-hospital",
  },
  {
    id: "th-livonia", name: "Trinity Health Livonia Hospital", city: "Livonia", group: "Trinity Health", system: "other",
    numbers: [{ label: "Main hospital line (also listed for the Birth Center)", number: "(734) 655-1000" }],
    sourceUrl: "https://www.trinityhealthmichigan.org/location/trinity-health-birth-center-livonia-hospital",
  },
  {
    id: "th-ann-arbor", name: "Trinity Health Ann Arbor Hospital", city: "Ypsilanti", group: "Trinity Health", system: "other",
    numbers: [{ label: MAIN, number: "(734) 712-3456" }],
    sourceUrl: "https://www.trinityhealthmichigan.org/location/trinity-health-ann-arbor-hospital",
  },

  // Other systems
  {
    id: "um-von-voigtlander", name: "U-M Von Voigtlander Women's Hospital", city: "Ann Arbor", group: "University of Michigan Health", system: "umich",
    numbers: [{ label: "Obstetric triage (for patients of U-M OB-GYNs and midwives)", number: "(734) 764-8134" }],
    sourceUrl: "https://www.umwomenshealth.org/conditions-treatments/delivering-at-umvv",
  },
  {
    id: "mclaren-macomb", name: "McLaren Macomb", city: "Mount Clemens", group: "McLaren Health Care", system: "other",
    numbers: [{ label: "Family Birth Center", number: "(586) 493-8298" }, { label: MAIN, number: "(586) 493-8000" }],
    sourceUrl: "https://www.mclaren.org/main/locations/family-birth-center-mclaren-macomb-427",
  },
];

export const HOSPITAL_GROUPS = Array.from(new Set(DETROIT_HOSPITALS.map((h) => h.group))).map((label) => ({
  label,
  hospitals: DETROIT_HOSPITALS.filter((h) => h.group === label),
}));

const byId = new Map(DETROIT_HOSPITALS.map((h) => [h.id, h]));
export function getHospital(id: string) {
  return byId.get(id);
}

/** The number the one-tap Call button uses: the birth unit when published, otherwise the main line. */
export function primaryNumber(h: DetroitHospital): HospitalNumber {
  return h.numbers[0]!;
}

export function telHref(number: string) {
  return `tel:+1${number.replace(/\D/g, "")}`;
}
