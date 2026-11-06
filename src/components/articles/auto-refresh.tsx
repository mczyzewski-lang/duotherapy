"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Odświeża dane strony co kilka sekund (np. postęp generowania w tle). */
export function AutoRefresh({ ms = 5000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), ms);
    return () => clearInterval(t);
  }, [router, ms]);
  return null;
}
