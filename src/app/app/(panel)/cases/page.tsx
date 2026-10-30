import { Plus } from "lucide-react";
import { CasesTable } from "@/components/panel/cases-table";
import { Button, Input, LinkButton, PageTitle, Select } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { CASE_STATUSES } from "@/lib/cases";
import { listCases } from "@/lib/queries";

export const metadata = { title: "Sprawy" };

export default async function CasesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const s = await requireStaff();
  const { rows, therapists } = await asStaff(s, async (tx) => ({
    rows: await listCases(tx, { q: sp.q, status: sp.status || undefined, kind: sp.kind || undefined, therapist: sp.therapist || undefined, risk: sp.risk === "1" }),
    therapists: await tx`select id, display_name from therapists order by display_name`,
  }));
  return (
    <>
      <PageTitle title="Sprawy" actions={<LinkButton href="/app/cases/new"><Plus size={17} aria-hidden /> Nowa sprawa</LinkButton>} />
      <form className="mb-5 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-sand sm:grid-cols-2 lg:grid-cols-[1fr_200px_160px_200px_auto]" role="search">
        <label className="sr-only" htmlFor="f-q">Szukaj</label>
        <Input id="f-q" name="q" defaultValue={sp.q} placeholder="Szukaj: numer, imię, e-mail" />
        <Select name="status" defaultValue={sp.status ?? ""} aria-label="Status"><option value="">Wszystkie statusy</option>{CASE_STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>
        <Select name="kind" defaultValue={sp.kind ?? ""} aria-label="Rodzaj"><option value="">Każdy rodzaj</option><option value="couple">Para</option><option value="individual">Indywidualny</option></Select>
        <Select name="therapist" defaultValue={sp.therapist ?? ""} aria-label="Prowadzący"><option value="">Każdy prowadzący</option>{therapists.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}</Select>
        <Button type="submit" variant="secondary">Filtruj</Button>
      </form>
      <CasesTable rows={rows} />
    </>
  );
}
