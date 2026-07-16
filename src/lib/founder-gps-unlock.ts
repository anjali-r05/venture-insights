import { useEffect, useState } from "react";

const KEY = "vb.founder-gps.unlocked";

export function isFounderGpsUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockFounderGps() {
  try {
    localStorage.setItem(KEY, "1");
    window.dispatchEvent(new Event("vb:founder-gps-unlock"));
  } catch {}
}

export function useFounderGpsUnlocked() {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    setUnlocked(isFounderGpsUnlocked());
    const handler = () => setUnlocked(isFounderGpsUnlocked());
    window.addEventListener("vb:founder-gps-unlock", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("vb:founder-gps-unlock", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return unlocked;
}
