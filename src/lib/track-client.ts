"use client";

// Pierwszopartyjny pomiar lejka. Wysyłamy wyłącznie nazwę zdarzenia, numer kroku, wariant A/B i UTM.
// Nigdy treści odpowiedzi. Identyfikator to losowy ciąg w sessionStorage (znika po zamknięciu karty).
import { ATTRIBUTION_KEYS, type Attribution, type FunnelEvent } from "./mapa-quiz";

const ID_KEY = "duo_anon";
const ATTR_KEY = "duo_attr";

function store(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function anonId(): string {
  const s = store();
  let id = s?.getItem(ID_KEY) ?? "";
  if (!id) {
    id = crypto.randomUUID().replace(/-/g, "");
    s?.setItem(ID_KEY, id);
  }
  return id;
}

/** Zapamiętuje źródło wejścia (pierwsze w tej sesji, nadpisywane nowymi parametrami UTM). */
export function captureAttribution(): Attribution {
  const s = store();
  const prev: Attribution = JSON.parse(s?.getItem(ATTR_KEY) || "{}");
  const url = new URL(window.location.href);
  const fresh: Attribution = {};
  for (const k of ATTRIBUTION_KEYS) {
    const v = url.searchParams.get(k);
    if (v) fresh[k] = v.slice(0, 200);
  }
  let next = prev;
  if (Object.keys(fresh).length || !prev.landing_path) {
    const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? new URL(document.referrer).hostname : prev.referrer;
    next = { ...(Object.keys(fresh).length ? {} : prev), ...fresh, landing_path: url.pathname, ...(ref ? { referrer: ref } : {}) };
    s?.setItem(ATTR_KEY, JSON.stringify(next));
  }
  return next;
}

export function attribution(): Attribution {
  return JSON.parse(store()?.getItem(ATTR_KEY) || "{}");
}

export function heroVariant(): "A" | "B" | null {
  const m = document.cookie.match(/(?:^|; )duo_hero=([AB])/);
  return m ? (m[1] as "A" | "B") : null;
}

export function track(event: FunnelEvent, step?: number) {
  try {
    const a = attribution();
    const body = JSON.stringify({ event, step, anonId: anonId(), variant: heroVariant(), utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign, path: window.location.pathname });
    if (!navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/events", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
    }
  } catch {
    /* pomiar nigdy nie blokuje użytkownika */
  }
}
