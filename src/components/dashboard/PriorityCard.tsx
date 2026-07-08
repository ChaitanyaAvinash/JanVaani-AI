import { CategoryBadge, SourceBadge, UrgencyBadge } from "@/components/ui/badges";
import { Card, Meter } from "@/components/ui/primitives";
import type { PriorityItemDTO } from "@/lib/types";

function formatCost(estCostLakh: number) {
  if (estCostLakh >= 100) return `₹${(estCostLakh / 100).toFixed(2)} Cr`;
  return `₹${estCostLakh.toFixed(0)} L`;
}

const LANG_LABEL: Record<string, string> = {
  en: "EN",
  hi: "HI",
  te: "TE",
  unknown: "—",
  other: "—",
};

export function PriorityCard({
  item,
  rank,
  selected,
  onToggleSelect,
  selectDisabled,
}: {
  item: PriorityItemDTO;
  rank: number;
  selected: boolean;
  onToggleSelect: () => void;
  selectDisabled: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--text-secondary)" }}
          >
            {rank}
          </span>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {item.title}
            </h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <CategoryBadge category={item.category} />
              <SourceBadge kind={item.kind} />
              {item.avgUrgency != null && <UrgencyBadge urgency={item.avgUrgency} />}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums" style={{ color: "var(--brand)" }}>
            {item.finalScore}
          </div>
          <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            priority score
          </div>
        </div>
      </div>

      {item.description && (
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {item.description}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Meter label="Demand" value={item.demandScore} />
        <Meter label="Urgency" value={item.urgencyScore} />
        <Meter label="Need gap" value={item.needGapScore} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        <span>
          <strong style={{ color: "var(--text-primary)" }}>{item.submissionCount}</strong> citizen submission
          {item.submissionCount === 1 ? "" : "s"}
        </span>
        {item.avgUrgency != null && <span>avg urgency {item.avgUrgency.toFixed(1)}/5</span>}
        {item.estCostLakh != null && <span>est. cost {formatCost(item.estCostLakh)}</span>}
        {item.ward && <span>{item.ward.name}</span>}
      </div>

      {item.quotes.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t pt-2" style={{ borderColor: "var(--border)" }}>
          {item.quotes.slice(0, 2).map((q, idx) => (
            <p key={idx} className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
              <span
                className="mr-1.5 rounded px-1 py-0.5 text-[10px] font-medium not-italic"
                style={{ backgroundColor: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                {LANG_LABEL[q.language] ?? q.language.toUpperCase()}
              </span>
              &ldquo;{q.text}&rdquo;
            </p>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 self-end text-xs" style={{ color: "var(--text-secondary)" }}>
        <input
          type="checkbox"
          checked={selected}
          disabled={selectDisabled && !selected}
          onChange={onToggleSelect}
        />
        Compare
      </label>
    </Card>
  );
}
