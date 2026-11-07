// Ocena w Google: logo „G”, gwiazdki wypełnione wg oceny i liczba opinii. Wartości z Ustawień (puste = nic nie pokazujemy).
import clsx from "clsx";

const plural = (n: number) => (n === 1 ? "opinia" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "opinie" : "opinii");

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z" />
    </svg>
  );
}

function Stars({ value, size }: { value: number; size: number }) {
  return (
    <span className="relative inline-flex" aria-hidden>
      <span className="flex text-[#e6dccf]">{"★★★★★".split("").map((s, i) => <span key={i} style={{ fontSize: size, lineHeight: 1 }}>{s}</span>)}</span>
      <span className="absolute inset-y-0 left-0 flex overflow-hidden text-[#f5b301]" style={{ width: `${(value / 5) * 100}%` }}>
        {"★★★★★".split("").map((s, i) => <span key={i} style={{ fontSize: size, lineHeight: 1 }}>{s}</span>)}
      </span>
    </span>
  );
}

export function GoogleRating({ rating, reviews, url, tone = "light", size = "md", className }: { rating: string; reviews: string; url?: string; tone?: "light" | "dark"; size?: "sm" | "md"; className?: string }) {
  const value = Number(rating.replace(",", "."));
  const count = Number(reviews);
  if (!value || !count) return null;
  const sm = size === "sm";
  const body = (
    <>
      <GoogleG className={sm ? "h-4 w-4" : "h-5 w-5"} />
      <Stars value={value} size={sm ? 13 : 16} />
      <span className={clsx("font-semibold", tone === "dark" ? "text-white" : "text-ink")}>{rating.replace(".", ",")}/5</span>
      <span className={tone === "dark" ? "text-white/75" : "text-muted"}>w Google · {count} {plural(count)}</span>
    </>
  );
  const cls = clsx(
    "inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-full",
    sm ? "text-[12.5px]" : "text-[14px]",
    tone === "dark" ? "bg-white/10 px-3 py-1.5 ring-1 ring-white/20" : "bg-white px-3 py-1.5 shadow-soft ring-1 ring-sand",
    className,
  );
  const label = `Ocena ${rating.replace(".", ",")} na 5 w Google na podstawie ${count} ${plural(count)}`;
  return url ? (
    <a href={url} target="_blank" rel="noopener" className={clsx(cls, "hover:ring-forest/40")} aria-label={label} data-testid="google-rating">{body}</a>
  ) : (
    <span className={cls} role="img" aria-label={label} data-testid="google-rating">{body}</span>
  );
}
