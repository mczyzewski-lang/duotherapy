"use client";

// Film od Klaudii: natywny odtwarzacz (sterowanie, przewijanie, napisy PL), bez autoodtwarzania z dźwiękiem.
// Mierzymy tylko postęp oglądania (bez danych osobowych). Gdy filmu jeszcze nie ma – zastępnik z transkrypcją.
import clsx from "clsx";
import { ChevronDown, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track-client";
import { VSL_SCRIPT } from "@/lib/vsl-script";

export function VslTracker() {
  useEffect(() => {
    track("vsl_page_view");
  }, []);
  return null;
}

export function VslPlayer({ videoUrl, posterUrl, captionsUrl }: { videoUrl: string; posterUrl: string; captionsUrl: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const sent = useRef(new Set<string>());
  const [transcript, setTranscript] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const once = (e: Parameters<typeof track>[0]) => {
      if (sent.current.has(e)) return;
      sent.current.add(e);
      track(e);
    };
    const onPlay = () => once("vsl_play");
    const onTime = () => {
      if (!v.duration || !isFinite(v.duration)) return;
      const p = v.currentTime / v.duration;
      if (p >= 0.25) once("vsl_25_percent");
      if (p >= 0.5) once("vsl_50_percent");
      if (p >= 0.75) once("vsl_75_percent");
    };
    const onEnd = () => once("vsl_completed");
    v.addEventListener("play", onPlay);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnd);
    };
  }, []);

  return (
    <div>
      <div id="vsl-video" className="relative aspect-video w-full overflow-hidden rounded-[1.4rem] bg-forest-800 shadow-soft ring-1 ring-sand sm:rounded-[1.75rem]">
        {videoUrl ? (
          <video
            ref={ref}
            className="h-full w-full bg-black object-contain"
            controls
            playsInline
            preload="metadata"
            poster={posterUrl || "/img/vsl-poster.jpg"}
            crossOrigin={captionsUrl ? "anonymous" : undefined}
            aria-label="Film: Klaudia z DUO opowiada o Mapie Relacji"
          >
            <source src={videoUrl} />
            {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="pl" label="Polski" default />}
            Twoja przeglądarka nie odtwarza wideo. Poniżej znajdziesz pełną transkrypcję.
          </video>
        ) : (
          // Zastępnik do czasu wgrania filmu – bez udawanego przycisku odtwarzania
          <div className="absolute inset-0">
            <img src="/img/vsl-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-800/90 via-forest-800/55 to-transparent" aria-hidden />
            <div className="relative flex h-full max-w-[70%] flex-col justify-end p-4 text-white sm:max-w-[60%] sm:p-7">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/75 sm:text-xs">Wiadomość od Klaudii</p>
              <p className="mt-1 font-display text-lg leading-snug sm:text-2xl">Film pojawi się tutaj wkrótce.</p>
              <button
                type="button"
                onClick={() => {
                  setTranscript(true);
                  document.getElementById("vsl-transcript")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-3 inline-flex min-h-10 w-max items-center gap-2 rounded-full bg-white/95 px-4 text-sm font-medium text-forest"
              >
                <FileText size={16} aria-hidden /> Przeczytaj wiadomość
              </button>
            </div>
          </div>
        )}
      </div>

      <details id="vsl-transcript" open={transcript} onToggle={(e) => setTranscript((e.target as HTMLDetailsElement).open)} className="group mt-3 scroll-mt-20 rounded-2xl bg-white/80 ring-1 ring-sand">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[15px] font-medium text-forest">
          <span className="inline-flex items-center gap-2"><FileText size={16} aria-hidden /> {videoUrl ? "Transkrypcja filmu" : "Wiadomość od Klaudii (tekst)"}</span>
          <ChevronDown size={18} className="transition group-open:rotate-180" aria-hidden />
        </summary>
        <div className="max-h-[28rem] space-y-5 overflow-y-auto border-t border-sand px-4 py-4 text-[15px] leading-relaxed text-ink-soft">
          {VSL_SCRIPT.map((s) => (
            <section key={s.time}>
              <h3 className="flex items-baseline gap-2 font-display text-lg text-ink">
                {videoUrl && <span className="font-sans text-xs tabular-nums text-muted">{s.time}</span>}
                {s.title}
              </h3>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className={clsx("mt-2")}>{p}</p>
              ))}
            </section>
          ))}
        </div>
      </details>
    </div>
  );
}
