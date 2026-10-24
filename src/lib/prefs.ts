import { useEffect, useState, useCallback } from "react";
import type { HospitalId } from "@/content/catalog";

export type Prefs = {
  stage: "hospital" | "going-home" | "home" | "unsure" | null;
  birth: "vaginal" | "cesarean" | "nicu" | "difficult" | "loss" | "skip" | null;
  role: "birth-parent" | "partner" | "support" | "skip" | null;
  hospital: HospitalId | null;
  /** Specific Detroit-area hospital (id from src/content/hospitals.ts). */
  hospitalSite: string | null;
  lastTopicId: string | null;
  dismissedIntro: boolean;
};

const KEY = "afterbirth:prefs";
const DEFAULTS: Prefs = {
  stage: null,
  birth: null,
  role: null,
  hospital: null,
  hospitalSite: null,
  lastTopicId: null,
  dismissedIntro: false,
};

function read(): Prefs {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Prefs>) };
  } catch {
    return DEFAULTS;
  }
}

/** Optional preferences, stored on this device only. Never required. */
export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setPrefs(read());
    setReady(true);
    const on = () => setPrefs(read());
    window.addEventListener("afterbirth:prefs", on);
    return () => window.removeEventListener("afterbirth:prefs", on);
  }, []);
  const update = useCallback((patch: Partial<Prefs>) => {
    const next = { ...read(), ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("afterbirth:prefs"));
  }, []);
  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("afterbirth:prefs"));
  }, []);
  return { prefs, ready, update, clear };
}
