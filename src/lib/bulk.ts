// Generowanie hurtowe w tle (OpenAI): po kilka naraz, z ponowieniem przy limitach, przerwanie po 3 błędach z rzędu.
// Stan żyje w procesie serwera (jedna instancja) – po restarcie wystarczy uruchomić ponownie.
export interface BulkStatus {
  running: boolean;
  total: number;
  done: number;
  failed: { key: string; error: string }[];
  current: string[];
  startedAt: number;
  finishedAt: number | null;
  stoppedReason: string | null;
}
type Result = { ok: true } | { ok: false; error: string };
const g = globalThis as unknown as { __duoBulks?: Record<string, BulkStatus> };
const store = () => (g.__duoBulks ??= {});

export const bulkStatus = (name: string): BulkStatus | null => store()[name] ?? null;
export function stopBulk(name: string) {
  const st = store()[name];
  if (st?.running) { st.running = false; st.stoppedReason = "Zatrzymano ręcznie."; }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const retryable = (e: string) => /429|rate|limit|timeout|ECONNRESET|5\d\d|overloaded|temporarily/i.test(e);

/** Uruchamia zadania w tle; zwraca false, gdy coś już trwa albo lista jest pusta. */
export function runBulk(name: string, jobs: { key: string; run: () => Promise<Result> }[], opts: { concurrency?: number; onDone?: () => void } = {}): boolean {
  if (store()[name]?.running) return false;
  const st: BulkStatus = { running: jobs.length > 0, total: jobs.length, done: 0, failed: [], current: [], startedAt: Date.now(), finishedAt: jobs.length ? null : Date.now(), stoppedReason: null };
  store()[name] = st;
  if (!jobs.length) return false;
  let next = 0;
  let fails = 0;
  const worker = async () => {
    while (st.running && next < jobs.length) {
      const job = jobs[next++];
      st.current.push(job.key);
      let r: Result = { ok: false, error: "" };
      for (let attempt = 0; attempt < 4; attempt++) {
        r = await job.run().catch((e) => ({ ok: false as const, error: String(e?.message ?? e) }));
        if (r.ok || !retryable(r.error)) break;
        await sleep(15_000 * (attempt + 1));
      }
      st.current = st.current.filter((k) => k !== job.key);
      if (r.ok) { st.done++; fails = 0; }
      else {
        st.failed.push({ key: job.key, error: r.error.slice(0, 300) });
        // ten sam błąd kilka razy z rzędu (brak klucza, model, limit konta) – przerywamy, żeby nie mnożyć kosztów
        if (++fails >= 3) { st.running = false; st.stoppedReason = `Przerwano po 3 błędach z rzędu: ${r.error.slice(0, 200)}`; }
      }
    }
  };
  void Promise.all(Array.from({ length: Math.min(opts.concurrency ?? 2, jobs.length) }, worker)).finally(() => {
    st.running = false;
    st.finishedAt = Date.now();
    opts.onDone?.();
  });
  return true;
}
