import hero from "@/assets/home-hero.jpg";
import hospital from "@/assets/hospital.jpg";
import goingHome from "@/assets/going-home.jpg";
import atHome from "@/assets/at-home.jpg";
import complications from "@/assets/complications.jpg";
import support from "@/assets/support.jpg";
import questions from "@/assets/questions.jpg";
import myCare from "@/assets/my-care.jpg";
import findCare from "@/assets/find-care.jpg";
import type { ImageKey } from "@/content/topic-content";

export const IMAGES: Record<ImageKey, { src: string; alt: string }> = {
  hero: { src: hero, alt: "A father holds a sleeping newborn against his chest while the baby's mother rests nearby." },
  hospital: { src: hospital, alt: "A nurse talks with a mother resting in a hospital bed while her partner listens and the baby sleeps in a bassinet." },
  goingHome: { src: goingHome, alt: "A new mother carries her baby out of the hospital beside her own mother, who carries a car seat." },
  atHome: { src: atHome, alt: "A mother rests on a sofa with a glass of water while her partner holds their baby." },
  complications: { src: complications, alt: "" },
  support: { src: support, alt: "" },
  questions: { src: questions, alt: "A mother shows a question on her phone to a nurse, who leans in to read it." },
  myCare: { src: myCare, alt: "" },
  findCare: { src: findCare, alt: "" },
};
