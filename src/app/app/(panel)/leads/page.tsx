import { LeadRoad } from "@/components/brand";
import Link from "next/link";
import { leadStageAction } from "@/actions/leads";
import { Badge, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { CONCERN_LABEL, LEAD_STAGES, leadSummary } from "@/lib/leads";
import { callStatus, orderLabel } from "@/lib/orders";
import { readSettings } from "@/lib/settings";

export const metadata = { title: "Zgłoszenia" };

export default async function LeadsPage() {
  const s = await requireStaff();
  const { leads, settings } = await asStaff(s, async (tx) => ({
    settings: await readSettings(tx),
    leads: await tx`
      select l.*, t.display_name as therapist,
        coalesce((select json_agg(json_build_object('status', o.status, 'created_at', o.created_at, 'updated_at', o.updated_at, 'returned_cancel_at', o.returned_cancel_at) order by o.created_at)
                  from orders o where o.lead_id = l.id), '[]') as orders
      from leads l left join therapists t on t.id = l.assigned_therapist_id
      where l.created_at > now() - interval '180 days' or l.stage not in ('converted', 'lost') order by l.created_at desc`,
  }));
  const now = new Date();
  return (
    <>
      <PageTitle title="Zgłoszenia" sub="Pipeline: quiz → rozmowa telefoniczna → płatność → sprawa. Przeciągnij etap, wybierając go z listy na karcie." />
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
        <div className="grid min-w-[1400px] grid-cols-8 gap-3">
          {LEAD_STAGES.map(([stage, label]) => {
            const col = leads.filter((l) => l.stage === stage);
            return (
              <section key={stage} aria-labelledby={`col-${stage}`} className="rounded-2xl bg-linen/60 p-2.5">
                <h2 id={`col-${stage}`} className="flex items-center justify-between px-1.5 py-1 text-xs font-semibold text-ink-soft">
                  {label} <span className="rounded-full bg-white px-2 text-muted">{col.length}</span>
                </h2>
                <ul className="mt-2 space-y-2">
                  {col.map((l) => (
                    <li key={l.id} className="rounded-xl bg-white p-3 text-sm shadow-soft ring-1 ring-sand">
                      <Link href={`/app/leads/${l.id}`} className="font-medium text-forest hover:underline">{l.name}</Link>
                      {l.phone && <a href={`tel:${l.phone}`} className="block text-xs text-ink">{l.phone}</a>}
                      {l.attribution?.utm_source && <Badge className="mt-1">{l.attribution.utm_source}{l.attribution.utm_campaign ? ` · ${l.attribution.utm_campaign}` : ""}</Badge>}
                      <p className="mt-0.5 text-xs text-muted">{l.mode === "couple" ? "razem" : l.mode === "individual" ? "samodzielnie" : "forma nieustalona"} · {new Date(l.created_at).toLocaleDateString("pl-PL")}</p>
                      {(() => {
                        const orders = (l.orders ?? []) as { status: string; created_at: string; updated_at: string; returned_cancel_at: string | null }[];
                        const last = orders[orders.length - 1];
                        const cs = callStatus(l as never, orders.map((o) => ({ ...o, created_at: new Date(o.created_at), updated_at: new Date(o.updated_at) })), settings.offer, now);
                        return (
                          <>
                            {last && <Badge tone={last.status === "paid" ? "forest" : last.status === "failed" ? "alert" : "clay"} className="mt-1.5">{orderLabel({ status: last.status, returned_cancel_at: last.returned_cancel_at ? new Date(last.returned_cancel_at) : null })}</Badge>}
                            {cs.label && cs.kind !== "paid" && (
                              <p className={`mt-1 text-[11px] font-medium ${cs.kind === "call" ? "text-forest" : "text-clay"}`} data-call={cs.kind}>{cs.label}</p>
                            )}
                          </>
                        );
                      })()}
                      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-soft"><LeadRoad lead={l} className="mt-px h-3.5 w-3.5 shrink-0" />{leadSummary(l)}</p>
                      {(l.quiz?.concerns ?? []).length > 0 && <p className="mt-1 text-xs text-muted">{l.quiz.concerns.map((c: string) => CONCERN_LABEL[c]).join(", ")}</p>}
                      {l.call_at && <Badge tone="forest" className="mt-2">📞 {new Date(l.call_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}</Badge>}
                      {l.quiz?.discreet && <Badge tone="clay" className="mt-2">dyskretny kontakt</Badge>}
                      {stage !== "converted" && (
                        <form action={leadStageAction} className="mt-2 flex gap-1">
                          <input type="hidden" name="lead_id" value={l.id} />
                          <label className="sr-only" htmlFor={`st-${l.id}`}>Etap</label>
                          <select id={`st-${l.id}`} name="stage" defaultValue={l.stage} className="min-w-0 flex-1 rounded-lg bg-ivory px-2 py-1 text-xs ring-1 ring-sand">
                            {LEAD_STAGES.filter(([k]) => k !== "converted").map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}
                          </select>
                          <button className="rounded-lg bg-forest px-2 text-xs text-white">OK</button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
