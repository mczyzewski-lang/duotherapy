// Dostęp do bazy. Każde zapytanie działa w transakcji z ustawionym kontekstem aktora,
// dzięki czemu polityki RLS w PostgreSQL egzekwują uprawnienia niezależnie od kodu aplikacji.
import postgres from "postgres";
import { env } from "./env";

export type Actor =
  | { kind: "admin"; userId: string; therapistId: string | null }
  | { kind: "therapist"; userId: string; therapistId: string }
  | { kind: "participant"; participantId: string }
  | { kind: "report_viewer"; shareId: string }
  | { kind: "public" }
  | { kind: "system" };

type Sql = postgres.Sql;
export type Tx = postgres.TransactionSql;

const g = globalThis as unknown as { __duoSql?: Sql };

export function sql(): Sql {
  if (!g.__duoSql) {
    g.__duoSql = postgres(env.databaseUrl, {
      max: 10,
      idle_timeout: 30,
      // nie loguj parametrów zapytań (mogą zawierać dane wrażliwe)
      debug: false,
      onnotice: () => {},
    });
  }
  return g.__duoSql;
}

export async function withActor<T>(actor: Actor, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return sql().begin(async (tx) => {
    const userId = "userId" in actor ? actor.userId : "";
    const therapistId = "therapistId" in actor ? actor.therapistId ?? "" : "";
    const participantId = actor.kind === "participant" ? actor.participantId : "";
    const shareId = actor.kind === "report_viewer" ? actor.shareId : "";
    await tx`select set_config('app.kind', ${actor.kind}, true), set_config('app.user_id', ${userId}, true),
                    set_config('app.therapist_id', ${therapistId}, true), set_config('app.participant_id', ${participantId}, true),
                    set_config('app.share_id', ${shareId}, true)`;
    return fn(tx);
  }) as Promise<T>;
}

export const system = <T>(fn: (tx: Tx) => Promise<T>) => withActor({ kind: "system" }, fn);
