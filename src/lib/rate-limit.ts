// Prosty limiter w bazie (okno stałe). Zwraca false, gdy limit został przekroczony.
import { system } from "./db";

export async function hit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  return system(async (tx) => {
    const [r] = await tx<{ count: number }[]>`
      insert into rate_limits (key, window_start, count) values (${key}, now(), 1)
      on conflict (key) do update set
        count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}) then 1 else rate_limits.count + 1 end,
        window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}) then now() else rate_limits.window_start end
      returning count`;
    return r.count <= limit;
  });
}
