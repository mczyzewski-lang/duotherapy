// Okładka jako mały folder / książka: grzbiet, krawędź kartek, lekki obrót 3D i cień na podłożu.
import clsx from "clsx";

export function CoverBook({ children, className, size = "md" }: { children: React.ReactNode; className?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <div className={clsx("group/book relative [perspective:1400px]", lg ? "px-4 pb-8 pt-2" : "px-2 pb-5 pt-1", className)}>
      {/* cień na podłożu */}
      <div className={clsx("absolute inset-x-[10%] rounded-[50%] bg-[rgba(40,28,20,.35)] blur-xl", lg ? "bottom-3 h-8" : "bottom-2 h-5")} aria-hidden />
      <div
        className={clsx(
          "relative transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:transition-none",
          "[transform:rotateY(-16deg)_rotateX(3deg)] group-hover/book:[transform:rotateY(-7deg)_rotateX(1deg)] group-hover:[transform:rotateY(-7deg)_rotateX(1deg)]",
          // sama okładka: grzbiet po lewej mniej zaokrąglony, cień rzucany w prawo
          "[&>section]:rounded-l-[5px] [&>section]:rounded-r-[14px] [&>section]:shadow-[16px_22px_34px_-14px_rgba(40,28,20,.55),2px_2px_6px_-2px_rgba(40,28,20,.35)]",
        )}
      >
        {/* blok kartek wystający zza okładki */}
        <div
          className={clsx("absolute inset-y-[1.2%] -right-[7px] w-[12px] rounded-r-[8px]", lg && "-right-[10px] w-[16px]")}
          style={{
            transform: "translateZ(-8px)",
            background: "repeating-linear-gradient(to right, #fbf8f3 0 1.5px, #e6dccf 1.5px 2.5px)",
            boxShadow: "inset -2px 0 4px rgba(0,0,0,.12)",
          }}
          aria-hidden
        />
        {children}
        {/* grzbiet: zagięcie i odblask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[9%] rounded-l-[5px] bg-[linear-gradient(to_right,rgba(0,0,0,.32),rgba(255,255,255,.18)_45%,rgba(0,0,0,.08)_70%,transparent)]" aria-hidden />
        {/* połysk okładki */}
        <div className="pointer-events-none absolute inset-0 rounded-l-[5px] rounded-r-[14px] bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,.14)_55%,transparent_70%)]" aria-hidden />
      </div>
    </div>
  );
}
