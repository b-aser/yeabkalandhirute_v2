import { useEffect, useMemo, useState } from "react";

const calc = (target: Date) => {
  const diff = target.getTime() - Date.now();
  const safe = Math.max(0, diff);
  const days = Math.floor(safe / 86400000);
  const hours = Math.floor((safe % 86400000) / 3600000);
  const minutes = Math.floor((safe % 3600000) / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  return { days, hours, minutes, seconds };
};

interface CountdownProps {
  dbDate?: Date | string | null;
  eyebrow?: string;
  title?: string;
}

export const Countdown = ({ dbDate, eyebrow, title }: CountdownProps) => {
  // Use database date if available, otherwise fallback to the manual static date
  const targetDate = useMemo(() => new Date(dbDate ?? Date.now()), [dbDate]);

  const [t, setT] = useState(() => calc(targetDate));

  useEffect(() => {
    setT(calc(targetDate)); // sync immediately if dbDate changes
    const id = setInterval(() => setT(calc(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]); // stable now — effect only re-runs if dbDate changes

  const items = [
    { label: "Days", value: t.days },
    { label: "Hours", value: t.hours },
    { label: "Minutes", value: t.minutes },
    { label: "Seconds", value: t.seconds },
  ];


  // debug
  function calc(target: Date) {
    const now = Date.now();
    const diff = target.getTime() - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
    };
  }



  return (
    <section id="countdown" className="relative z-[2] bg-warm-dark text-center px-6 md:px-10 py-24 md:py-28">
      <p className="eyebrow mb-5" style={{ color: "hsl(var(--warm-soft))" }}>
        {eyebrow}
      </p>
      <h2 className="font-display font-light leading-tight text-cream"
        style={{ fontSize: "clamp(34px, 5vw, 56px)" }}>
        {title}
      </h2>

      <div className="mt-10 flex justify-center flex-wrap gap-4 md:gap-10">
        {items.map((it, i) => (
          <div key={it.label} className="flex flex-col items-center gap-2">
            <span
              className="font-display font-light text-gold leading-none min-w-[80px] text-center tabular-nums"
              style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
            >
              {String(it.value).padStart(2, "0")}
            </span>
            <span className="text-[12px] tracking-[0.5em] uppercase text-warm-soft">
              {it.label}
            </span>
            {i < items.length - 1 && (
              <span className="hidden md:block absolute font-display text-warm-mid text-5xl pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
