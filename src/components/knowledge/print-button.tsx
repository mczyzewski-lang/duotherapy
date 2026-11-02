"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Wydrukuj / zapisz jako PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="no-print inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-forest ring-1 ring-sand-dark">
      <Printer size={16} aria-hidden /> {label}
    </button>
  );
}
