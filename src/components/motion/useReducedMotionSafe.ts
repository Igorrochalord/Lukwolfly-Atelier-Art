"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Igual a `useReducedMotion`, mas seguro para hidratação: durante o SSR e a
 * hidratação retorna `false` (mesma árvore do servidor) e só depois reflete
 * a preferência real. O `MotionConfig reducedMotion="user"` cobre o intervalo.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
