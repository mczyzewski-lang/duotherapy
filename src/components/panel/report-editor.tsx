"use client";

import clsx from "clsx";
import { CheckCircle2, Copy, Download, Eye, Plus, Save, Share2, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { approveReportAction, saveReportAction, shareReportAction } from "@/actions/reports";
import { Alert, Badge, Button, Card } from "@/components/ui";
import { RoadGlyph } from "@/components/brand";
import { roadFor } from "@/lib/brand-mark";
import { MISSING, PATH_OPTIONS, UNSAFE_WITH_RISK, missingMarkers, renderReportHtml, sectionTitles, type PathKey, type ReportContent, type Severity } from "@/lib/report";
import type { Settings } from "@/lib/settings";

const area = "w-full rounded-xl bg-white px-3 py-2 text-[15px] leading-relaxed ring-1 ring-sand-dark focus:outline-none focus:ring-2 focus:ring-forest";
const hl = (s: string) => (s.includes(MISSING) ? "ring-clay bg-clay-soft/30" : "");

function T({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  const id = label.replace(/\W+/g, "-");
  return (
    <label htmlFor={id} className="block space-y-1">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea id={id} rows={rows} className={clsx(area, hl(value))} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function ReportEditor(p: {
  reportId: string;
  initial: ReportContent;
  version: number;
  approvedVersion: number | null;
  helplines: Settings["helplines"];
  recipients: { id: string; name: string }[];
  audience: "joint" | "participant";
}) {
  const [c, setC] = useState<ReportContent>(p.initial);
  const [version, setVersion] = useState(p.version);
  const [approved, setApproved] = useState(p.approvedVersion);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "alert"; text: string } | null>(null);
  const [preview, setPreview] = useState(false);
  const [share, setShare] = useState<{ url: string; code: string } | null>(null);
  const [shareTo, setShareTo] = useState(p.recipients[0]?.id ?? "");
  const [confirmJoint, setConfirmJoint] = useState(false);
  const [pending, start] = useTransition();
  const upd = (f: (x: ReportContent) => void) => {
    setC((prev) => {
      const n = structuredClone(prev);
      f(n);
      return n;
    });
    setDirty(true);
  };
  const missing = useMemo(() => missingMarkers(c), [c]);
  const T_ = sectionTitles(c);
  const html = useMemo(() => (preview ? renderReportHtml(c, { helplines: p.helplines } as Settings, { draft: approved !== version || dirty }) : ""), [preview, c, p.helplines, approved, version, dirty]);
  const isApproved = approved === version && !dirty;

  const save = () =>
    start(async () => {
      const r = await saveReportAction(p.reportId, c);
      if ("error" in r) setMsg({ tone: "alert", text: r.error });
      else {
        setVersion(r.version);
        setDirty(false);
        setMsg({ tone: "ok", text: `Zapisano wersję ${r.version}.` });
      }
    });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {c.riskFlag && (
          <Alert tone="alert" title="W sprawie wystąpiły sygnały zagrożenia">
            Przy przemocy lub zagrożeniu nie rekomenduje się terapii par, programu dla par ani mediacji. Te opcje są zablokowane w tym raporcie.
          </Alert>
        )}
        {c.caseKind === "individual" && (
          <Alert tone="info">Konsultacja indywidualna: opisuj zachowania i intencje partnera/partnerki wyłącznie jako perspektywę uczestnika. Nie uzupełniaj brakujących danych o osobie nieobecnej.</Alert>
        )}
        <Alert tone="info">
          {c.sourcesNote} Oznaczenia w treści: <em>Deklaracja</em> – słowa klienta, <em>Obserwacja psychologa</em> – Twoje notatki. Fragmenty <code className="rounded bg-clay-soft px-1">{MISSING}</code> wymagają uzupełnienia przed zatwierdzeniem.
        </Alert>

        <Card className="space-y-4 p-6">
          <h2 className="font-display text-xl text-ink">Metadane</h2>
          {c.meta.participants.map((x, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <T label={`Imię i nazwisko (osoba ${i + 1})`} value={x.name} rows={1} onChange={(v) => upd((n) => void (n.meta.participants[i].name = v))} />
              <T label="Wiek" value={x.age} rows={1} onChange={(v) => upd((n) => void (n.meta.participants[i].age = v))} />
            </div>
          ))}
          <div className="grid gap-3 sm:grid-cols-2">
            <T label="Data sesji" value={c.meta.sessionDate} rows={1} onChange={(v) => upd((n) => void (n.meta.sessionDate = v))} />
            <T label="Psycholog prowadzący" value={c.meta.therapist} rows={1} onChange={(v) => upd((n) => void (n.meta.therapist = v))} />
          </div>
          <p className="text-sm text-muted">Rodzaj: {c.caseKind === "couple" ? "konsultacja dla pary, 90 minut" : "konsultacja indywidualna, 60 minut"} (z danych sprawy)</p>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-display text-xl text-ink">{T_.summary}</h2>
          <T label="Podsumowanie (3-5 zdań, język opisowy, bez ocen i diagnoz)" value={c.summary.text} rows={6} onChange={(v) => upd((n) => void (n.summary.text = v))} />
          <T label="Powód zgłoszenia" value={c.summary.reason} rows={2} onChange={(v) => upd((n) => void (n.summary.reason = v))} />
          <T label="Etap decyzji" value={c.summary.decisionStage} rows={2} onChange={(v) => upd((n) => void (n.summary.decisionStage = v))} />
        </Card>

        <ListCard title={T_.strengths} items={c.strengths} onChange={(items) => upd((n) => void (n.strengths = items))} />

        <Card className="space-y-4 p-6">
          <h2 className="font-display text-xl text-ink">{T_.tensions}</h2>
          {c.tensions.map((t, i) => (
            <div key={t.area} className="space-y-2 rounded-xl bg-ivory p-4 ring-1 ring-sand">
              <T label={`${t.label} – co zauważam`} value={t.text} onChange={(v) => upd((n) => void (n.tensions[i].text = v))} />
              <fieldset className="flex flex-wrap items-center gap-2 text-sm">
                <legend className="sr-only">Nasilenie: {t.label}</legend>
                <span className="text-muted">Nasilenie (wybiera specjalista):</span>
                {(["low", "moderate", "high"] as const).map((sv) => (
                  <label key={sv} className={clsx("cursor-pointer rounded-full px-3 py-1 ring-1", t.severity === sv ? "bg-forest text-white ring-forest" : "bg-white ring-sand-dark")}>
                    <input type="radio" className="sr-only" name={`sev-${t.area}`} checked={t.severity === sv} onChange={() => upd((n) => void (n.tensions[i].severity = sv as Severity))} />
                    {{ low: "niskie", moderate: "umiarkowane", high: "wysokie" }[sv]}
                  </label>
                ))}
              </fieldset>
            </div>
          ))}
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-display text-xl text-ink">{T_.mechanism}</h2>
          <T label={c.caseKind === "couple" ? "Wasz cykl w jednym zdaniu" : "Cykl w jednym zdaniu"} value={c.mechanism.oneLiner} rows={2} onChange={(v) => upd((n) => void (n.mechanism.oneLiner = v))} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr><th className="p-2 text-left text-xs text-muted">Element cyklu</th>{c.mechanism.columns.map((h) => <th key={h} className="p-2 text-left text-xs text-muted">{h}</th>)}</tr></thead>
              <tbody>
                {c.mechanism.rows.map((r, ri) => (
                  <tr key={r.key}>
                    <td className="p-2 align-top text-ink">{r.label}</td>
                    {r.values.map((v, ci) => (
                      <td key={ci} className="p-1.5"><textarea aria-label={`${r.label} – ${c.mechanism.columns[ci]}`} rows={2} className={clsx(area, "text-sm", hl(v))} value={v} onChange={(e) => upd((n) => void (n.mechanism.rows[ri].values[ci] = e.target.value))} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <fieldset className="flex flex-wrap gap-3 text-sm">
            <legend className="mb-1 font-medium text-ink">Zaobserwowane wzorce komunikacyjne</legend>
            {(
              [
                ["criticism", "krytyka"],
                ["contempt", "pogarda"],
                ["defensiveness", "defensywność"],
                ["stonewalling", "wycofanie (stonewalling)"],
              ] as const
            ).map(([k, l]) => (
              <label key={k} className="flex items-center gap-1.5"><input type="checkbox" className="accent-forest" checked={c.mechanism.patterns[k]} onChange={(e) => upd((n) => void (n.mechanism.patterns[k] = e.target.checked))} /> {l}</label>
            ))}
          </fieldset>
          <T label="Komentarz do wzorców" value={c.mechanism.patternsComment} rows={2} onChange={(v) => upd((n) => void (n.mechanism.patternsComment = v))} />
          <T label="Próby naprawy: co już działa, co nie dociera" value={c.mechanism.repair} rows={2} onChange={(v) => upd((n) => void (n.mechanism.repair = v))} />
        </Card>

        <ListCard title={T_.recommendations} items={c.recommendations} ordered onChange={(items) => upd((n) => void (n.recommendations = items))} />

        <Card className="space-y-4 p-6">
          <h2 className="font-display text-xl text-ink">Możliwa dalsza droga (rekomendowana ścieżka)</h2>
          <p className="text-sm text-muted">Wybór należy do psychologa. Rekomendacja jest propozycją – decyzja należy do klientów.</p>
          <div className="space-y-3">
            {(Object.keys(PATH_OPTIONS) as Exclude<PathKey, null | "none">[]).map((k) => (
              <div key={k} className={clsx("rounded-xl p-4 ring-1", c.path.main === k ? "bg-sage-soft/50 ring-forest" : "bg-ivory ring-sand")}>
                <label className="flex items-center gap-2 font-medium text-ink">
                  <input type="radio" name="path" className="accent-forest" checked={c.path.main === k} onChange={() => upd((n) => { n.path.main = k; n.path.options = []; })} /> {PATH_OPTIONS[k].label}
                  {roadFor(k) && <RoadGlyph road={roadFor(k)!} id={`ed-${k}`} className="ml-auto h-5 w-5" />}
                </label>
                {c.path.main === k && (
                  <div className="mt-2 flex flex-wrap gap-3 pl-6 text-sm">
                    {PATH_OPTIONS[k].options.map(([o, l]) => {
                      const blocked = c.riskFlag && UNSAFE_WITH_RISK.includes(o);
                      return (
                        <label key={o} className={clsx("flex items-center gap-1.5", blocked && "text-muted line-through")}>
                          <input type="checkbox" className="accent-forest" disabled={blocked} checked={c.path.options.includes(o)} onChange={(e) => upd((n) => void (n.path.options = e.target.checked ? [...n.path.options, o] : n.path.options.filter((x) => x !== o)))} /> {l}
                        </label>
                      );
                    })}
                  </div>
                )}
                {k === "safety" && <p className="mt-1 pl-6 text-xs text-muted">Przy przemocy nie rekomenduje się terapii par ani mediacji.</p>}
              </div>
            ))}
            <label className="flex items-center gap-2 rounded-xl bg-ivory p-4 font-medium text-ink ring-1 ring-sand">
              <input type="radio" name="path" className="accent-forest" checked={c.path.main === "none"} onChange={() => upd((n) => { n.path.main = "none"; n.path.options = []; })} /> na razie bez dalszej pracy
            </label>
          </div>
          <T label="Uzasadnienie wyboru ścieżki (bezpieczeństwo, gotowość, wzorce komunikacji, zgodność wizji życia, wcześniejsze próby pomocy)" value={c.path.rationale} rows={3} onChange={(v) => upd((n) => void (n.path.rationale = v))} />
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="font-display text-xl text-ink">{T_.nextSteps}</h2>
          {c.nextSteps.map((st, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_160px_140px_auto]">
              <input aria-label={`Krok ${i + 1}`} className={clsx(area, hl(st.what))} value={st.what} placeholder="Krok" onChange={(e) => upd((n) => void (n.nextSteps[i].what = e.target.value))} />
              <input aria-label={`Kto (krok ${i + 1})`} className={area} value={st.who} placeholder="Kto" onChange={(e) => upd((n) => void (n.nextSteps[i].who = e.target.value))} />
              <input aria-label={`Kiedy (krok ${i + 1})`} className={area} value={st.when} placeholder="Kiedy" onChange={(e) => upd((n) => void (n.nextSteps[i].when = e.target.value))} />
              <Button size="sm" variant="ghost" aria-label="Usuń krok" onClick={() => upd((n) => void n.nextSteps.splice(i, 1))}><Trash2 size={14} aria-hidden /></Button>
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={() => upd((n) => void n.nextSteps.push({ what: "", who: "", when: "" }))}><Plus size={14} aria-hidden /> Dodaj krok</Button>
        </Card>
        <p className="text-sm text-muted">Sekcja „Pamiętaj” (zastrzeżenia i numery pomocy) oraz powitanie i podpis są dodawane automatycznie zgodnie z szablonem i nie podlega edycji.</p>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <Card className="space-y-3 p-5">
          <p className="text-sm text-ink">Wersja {version}{dirty && " + niezapisane zmiany"}</p>
          <p>{isApproved ? <Badge tone="ok"><CheckCircle2 size={12} aria-hidden /> zatwierdzona</Badge> : <Badge tone="clay">szkic</Badge>}</p>
          <Button className="w-full" onClick={save} disabled={pending || !dirty}><Save size={16} aria-hidden /> Zapisz wersję</Button>
          <Button className="w-full" variant="secondary" onClick={() => setPreview((x) => !x)}><Eye size={16} aria-hidden /> {preview ? "Ukryj podgląd" : "Podgląd podsumowania"}</Button>
          <a className={clsx("inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-[15px] font-medium ring-1 ring-sand-dark", dirty ? "pointer-events-none opacity-50" : "bg-white text-forest hover:bg-linen")} href={`/api/reports/${p.reportId}/pdf`}>
            <Download size={16} aria-hidden /> Pobierz PDF (wersja {version})
          </a>
          <div className="border-t border-sand pt-3">
            <p className="text-xs text-muted">Do uzupełnienia przed zatwierdzeniem: {missing.length}</p>
            {missing.length > 0 && <ul className="mt-1 max-h-40 overflow-auto text-xs text-clay">{missing.map((m) => <li key={m}>• {m}</li>)}</ul>}
            <Button
              className="mt-3 w-full"
              variant="clay"
              disabled={pending || dirty || missing.length > 0 || isApproved}
              onClick={() => start(async () => {
                const r = await approveReportAction(p.reportId);
                if ("error" in r) setMsg({ tone: "alert", text: r.error });
                else {
                  setApproved(version);
                  setMsg({ tone: "ok", text: "Podsumowanie zatwierdzone. Możesz je teraz udostępnić." });
                }
              })}
            >
              <CheckCircle2 size={16} aria-hidden /> Zatwierdź podsumowanie
            </Button>
          </div>
        </Card>
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <Card className="space-y-3 p-5">
          <h3 className="flex items-center gap-2 font-display text-lg text-ink"><Share2 size={17} aria-hidden /> Udostępnij</h3>
          <p className="text-xs text-muted">Nic nie jest wysyłane automatycznie. Generujesz bezpieczny link i kod dla jednej osoby i przekazujesz je samodzielnie.</p>
          <label className="block text-sm">
            Odbiorca
            <select className={clsx(area, "mt-1")} value={shareTo} onChange={(e) => setShareTo(e.target.value)} disabled={!isApproved}>
              {p.recipients.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          {p.audience === "joint" && (
            <label className="flex items-start gap-2 text-xs text-ink">
              <input type="checkbox" className="mt-0.5 accent-forest" checked={confirmJoint} onChange={(e) => setConfirmJoint(e.target.checked)} />
              Potwierdzam, że podsumowanie wspólne zawiera wyłącznie treści zatwierdzone do wspólnego przekazania i nie ujawnia poufnych odpowiedzi ani rozmów indywidualnych bez odnotowanej zgody.
            </label>
          )}
          <Button className="w-full" size="sm" disabled={!isApproved || pending || (p.audience === "joint" && !confirmJoint)} onClick={() => start(async () => {
            const r = await shareReportAction(p.reportId, shareTo, confirmJoint);
            if ("error" in r) setMsg({ tone: "alert", text: r.error });
            else setShare(r);
          })}>Wygeneruj link do podsumowania</Button>
          {share && (
            <div className="space-y-2 rounded-xl bg-sage-soft/50 p-3 text-sm" role="status">
              <p className="text-xs font-medium text-forest">Widoczne tylko teraz:</p>
              <code className="block break-all rounded bg-white p-2 text-xs" data-testid="share-url">{share.url}</code>
              <code className="block rounded bg-white p-2 font-mono tracking-[0.3em]" data-testid="share-code">{share.code}</code>
              <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(share.url)}><Copy size={13} aria-hidden /> Kopiuj link</Button>
            </div>
          )}
          {!isApproved && <p className="text-xs text-muted">Udostępnić można tylko zatwierdzoną, zapisaną wersję.</p>}
        </Card>
      </aside>

      {preview && (
        <div className="xl:col-span-2">
          <iframe title="Podgląd podsumowania" srcDoc={html} sandbox="" className="h-[1100px] w-full rounded-2xl bg-white shadow-soft ring-1 ring-sand" />
        </div>
      )}
    </div>
  );
}

function ListCard({ title, items, onChange, ordered }: { title: string; items: string[]; onChange: (i: string[]) => void; ordered?: boolean }) {
  return (
    <Card className="space-y-3 p-6">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <span className="mt-2 w-5 text-sm text-muted">{ordered ? `${i + 1}.` : "•"}</span>
          <textarea aria-label={`${title} – pozycja ${i + 1}`} rows={2} className={clsx(area, hl(it))} value={it} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <Button size="sm" variant="ghost" aria-label="Usuń pozycję" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 size={14} aria-hidden /></Button>
        </div>
      ))}
      <Button size="sm" variant="secondary" onClick={() => onChange([...items, ""])}><Plus size={14} aria-hidden /> Dodaj</Button>
    </Card>
  );
}
