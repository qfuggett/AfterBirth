import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getServiceStatus } from "./guide.functions";

/** Re-runs a loader whenever stored data changes. Browser only. */
export function useStored<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(load);
  loadRef.current = load;
  const refresh = useCallback(() => {
    loadRef
      .current()
      .then((d) => setData(d))
      .catch(() => setData(undefined))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    refresh();
    window.addEventListener("afterbirth:data", refresh);
    return () => window.removeEventListener("afterbirth:data", refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, refresh };
}

export function useServiceStatus() {
  return useQuery({
    queryKey: ["service-status"],
    queryFn: () => getServiceStatus(),
    staleTime: 5 * 60_000,
  });
}

/** Read text aloud with the browser's built-in speech, when available. */
export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);
  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }, []);
  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);
  return { supported, speaking, speak, stop };
}
