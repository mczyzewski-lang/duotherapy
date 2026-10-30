// Odczyt własnych odpowiedzi uczestnika (np. do odtworzenia stanu). Zwraca WYŁĄCZNIE odpowiedzi
// osoby zalogowanej tym linkiem – parametr participantId w zapytaniu jest ignorowany.
import { NextResponse } from "next/server";
import { loadAnswers } from "@/lib/cases";
import { withActor } from "@/lib/db";
import { currentParticipant } from "@/lib/participant-auth";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pid = await currentParticipant(token);
  if (!pid) return NextResponse.json({ error: "Brak dostępu" }, { status: 401, headers: { "cache-control": "no-store" } });
  const answers = await withActor({ kind: "participant", participantId: pid }, (tx) => loadAnswers(tx, pid));
  return NextResponse.json({ answers: answers.map((a) => ({ questionId: a.question_id, state: a.state, value: a.value })) }, { headers: { "cache-control": "no-store" } });
}
