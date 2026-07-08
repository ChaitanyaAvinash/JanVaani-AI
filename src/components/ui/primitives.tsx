import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
      {sub ? (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {sub}
        </span>
      ) : null}
    </Card>
  );
}

/** A compact labeled meter — fill carries magnitude, track is a lighter step of the same hue. */
export function Meter({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-[84px] shrink-0 text-xs"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <div
        className="h-2 flex-1 rounded-full"
        style={{ backgroundColor: "color-mix(in srgb, var(--brand) 16%, var(--surface-1))" }}
      >
        <div
          className="h-2 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: "var(--brand)" }}
        />
      </div>
      <span
        className="w-7 shrink-0 text-right text-xs font-medium tabular-nums"
        style={{ color: "var(--text-primary)" }}
      >
        {Math.round(pct)}
      </span>
    </div>
  );
}

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}
