// Daty kalendarza terminów (strefa Europe/Warsaw) – wspólne dla serwera i przeglądarki, na napisach „YYYY-MM-DD” i „HH:MM”.
const TZ = "Europe/Warsaw";

export const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n, 12)).toISOString().slice(0, 10);
};
/** 0 = poniedziałek … 6 = niedziela */
export const weekday = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay() + 6) % 7;
};
export const mondayOf = (date: string) => addDays(date, -weekday(date));

/** Lokalna (warszawska) data i godzina chwili w czasie. */
export function warsawParts(at: Date): { date: string; time: string } {
  const s = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
  const [date, time] = s.split(" ");
  return { date, time };
}
export const todayWarsaw = () => warsawParts(new Date()).date;

export const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const fromMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

export const DAY_SHORT = ["pon", "wt", "śr", "czw", "pt", "sob", "nd"];
export const DAY_LONG = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"];
const MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
export const dayLabel = (date: string) => `${Number(date.slice(8))} ${MONTHS[Number(date.slice(5, 7)) - 1]}`;
