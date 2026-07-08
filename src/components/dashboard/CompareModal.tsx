"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { CategoryBadge, SourceBadge } from "@/components/ui/badges";
import { Meter } from "@/components/ui/primitives";
import type { PriorityItemDTO } from "@/lib/types";

function Column({ item }: { item: PriorityItemDTO }) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {item.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <CategoryBadge category={item.category} />
          <SourceBadge kind={item.kind} />
        </div>
      </div>
      <div className="text-3xl font-semibold tabular-nums" style={{ color: "var(--brand)" }}>
        {item.finalScore}
      </div>
      <div className="flex flex-col gap-1.5">
        <Meter label="Demand" value={item.demandScore} />
        <Meter label="Urgency" value={item.urgencyScore} />
        <Meter label="Need gap" value={item.needGapScore} />
      </div>
      <ul className="text-xs" style={{ color: "var(--text-secondary)" }}>
        <li>{item.submissionCount} citizen submissions</li>
        {item.avgUrgency != null && <li>avg urgency {item.avgUrgency.toFixed(1)}/5</li>}
        {item.estCostLakh != null && <li>est. cost ₹{item.estCostLakh.toFixed(0)} L</li>}
        {item.ward && <li>{item.ward.name}</li>}
      </ul>
    </div>
  );
}

export function CompareModal({
  a,
  b,
  onClose,
}: {
  a: PriorityItemDTO;
  b: PriorityItemDTO;
  onClose: () => void;
}) {
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: a.id, b: b.id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setNote(d.note || null);
      })
      .catch(() => {
        if (!cancelled) setError("Could not generate an AI comparison right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [a.id, b.id]);

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-5"
        style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Compare priorities
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="flex gap-6">
          <Column item={a} />
          <div className="w-px shrink-0" style={{ backgroundColor: "var(--border)" }} />
          <Column item={b} />
        </div>

        <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--brand)" }}>
            <Sparkles size={13} /> AI-generated briefing note
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Loader2 size={14} className="animate-spin" /> Generating…
            </div>
          )}
          {error && !loading && (
            <p className="text-sm" style={{ color: "var(--status-critical)" }}>
              {error}
            </p>
          )}
          {note && !loading && (
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              {note}
            </p>
          )}
          {!note && !loading && !error && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Set GEMINI_API_KEY to enable AI-generated comparison notes. The score breakdown above is still fully computed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
