"use client";

// Sticky przełącznik PREZENTACJA | REKLAMY (stan w hashu, żeby dało się podlinkować zakładkę) + podzakładki reklam.
import clsx from "clsx";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";

type Tab = "prezentacja" | "reklamy";
type Sub = "glowne" | "hooki" | "kreacje";

export function DeckTabs({ deck, ads, hooks, creatives, strategy }: {
  deck: React.ReactNode;
  ads: React.ReactNode;
  hooks: React.ReactNode;
  creatives: React.ReactNode;
  strategy: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("prezentacja");
  const [sub, setSub] = useState<Sub>("glowne");

  useEffect(() => {
    const read = () => setTab(location.hash === "#reklamy" ? "reklamy" : "prezentacja");
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", t === "reklamy" ? "#reklamy" : location.pathname + location.search);
    window.scrollTo({ top: 0 });
  };

  const tabCls = (on: boolean) =>
    clsx("relative min-h-11 px-3 text-[13px] font-semibold uppercase tracking-[0.2em] transition sm:px-5",
      on ? "text-[#16291f] after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-[#b4975a] sm:after:inset-x-5" : "text-[#16291f]/45 hover:text-[#16291f]");

  return (
    <>
      <div className="np-nav sticky top-0 z-40 border-b border-[#ece4d4] bg-[#faf7f1]/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <div role="tablist" aria-label="Materiał" className="flex">
            <button role="tab" id="tab-prezentacja" aria-selected={tab === "prezentacja"} aria-controls="panel-prezentacja" className={tabCls(tab === "prezentacja")} onClick={() => go("prezentacja")}>Prezentacja</button>
            <span className="self-center text-[#d8c8a4]" aria-hidden>|</span>
            <button role="tab" id="tab-reklamy" aria-selected={tab === "reklamy"} aria-controls="panel-reklamy" className={tabCls(tab === "reklamy")} onClick={() => go("reklamy")}>Reklamy</button>
          </div>
          {tab === "prezentacja" && (
            <button onClick={() => window.print()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#1f3b30] px-4 text-[13px] font-semibold text-[#faf7f1]" data-testid="print-deck">
              <Printer size={15} aria-hidden /> <span className="hidden sm:inline">Drukuj / zapisz PDF</span><span className="sm:hidden">PDF</span>
            </button>
          )}
        </div>
      </div>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div role="tabpanel" id="panel-prezentacja" aria-labelledby="tab-prezentacja" hidden={tab !== "prezentacja"}>{deck}</div>
        <div role="tabpanel" id="panel-reklamy" aria-labelledby="tab-reklamy" hidden={tab !== "reklamy"} className="np-ads">
          <header className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9a7d43]">Meta Ads</p>
            <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#16291f] sm:text-[2.4rem]">Reklamy Meta – pozyskanie psychologów na webinar</h1>
          </header>
          <div role="tablist" aria-label="Rodzaj materiału" className="mb-6 inline-flex rounded-full bg-[#f2ece0] p-1 ring-1 ring-[#e3d8c2]">
            {([["glowne", "Główne reklamy"], ["hooki", "Hooki"], ["kreacje", "Kreacje"]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={sub === k} onClick={() => setSub(k)}
                className={clsx("min-h-10 rounded-full px-4 text-sm font-medium transition", sub === k ? "bg-[#1f3b30] text-[#faf7f1]" : "text-[#1f3b30] hover:bg-white/60")}>
                {l}
              </button>
            ))}
          </div>
          <div>{sub === "glowne" ? ads : sub === "hooki" ? hooks : creatives}</div>
          <div className="mt-12">{strategy}</div>
        </div>
      </main>
    </>
  );
}
