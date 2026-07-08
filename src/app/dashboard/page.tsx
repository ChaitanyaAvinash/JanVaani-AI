"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { StatTile, compactNumber } from "@/components/ui/primitives";
import { PriorityCard } from "@/components/dashboard/PriorityCard";
import { CompareModal } from "@/components/dashboard/CompareModal";
import { CATEGORY_META, CATEGORY_LIST } from "@/lib/categories";
import type { DashboardStats, PriorityItemDTO, WardDTO } from "@/lib/types";
import type { Category } from "@/generated/prisma/enums";

const HotspotMap = dynamic(
  () => import("@/components/dashboard/HotspotMap").then((m) => m.HotspotMap),
  { ssr: false, loading: () => <MapPlaceholder /> }
);

function MapPlaceholder() {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-2xl border text-sm"
      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
    >
      Loading map…
    </div>
  );
}

type SourceFilter = "all" | "citizen_demand" | "development_plan";

export default function DashboardPage() {
  const [items, setItems] = useState<PriorityItemDTO[] | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [wards, setWards] = useState<WardDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [selectedWardFromMap, setSelectedWardFromMap] = useState<string | null>(null);

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  function fetchAll() {
    return Promise.all([
      fetch("/api/priorities").then((r) => r.json()),
      fetch("/api/wards").then((r) => r.json()),
    ]).then(([p, w]) => {
      setItems(p.items);
      setStats(p.stats);
      setWards(w.wards);
    });
  }

  function load() {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const effectiveWard = selectedWardFromMap ?? (wardFilter !== "all" ? wardFilter : null);
    return items.filter((i) => {
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
      if (effectiveWard && i.ward?.id !== effectiveWard) return false;
      if (sourceFilter !== "all" && i.kind !== sourceFilter) return false;
      return true;
    });
  }, [items, categoryFilter, wardFilter, sourceFilter, selectedWardFromMap]);

  const compareItems = useMemo(
    () => (items ?? []).filter((i) => compareIds.includes(i.id)),
    [items, compareIds]
  );

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      <header
        className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            JanVaani
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            MP dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={load}
            className="text-xs font-medium"
            style={{ color: "var(--brand)" }}
          >
            Refresh
          </button>
          <Link href="/" className="text-xs font-medium" style={{ color: "var(--brand)" }}>
            ← Citizen portal
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 lg:min-h-0">
        <div className="shrink-0 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Total submissions" value={stats ? compactNumber(stats.totalSubmissions) : "—"} />
          <StatTile label="Active hotspots" value={stats ? String(stats.activeHotspots) : "—"} sub="2+ submissions, same theme & ward" />
          <StatTile
            label="Avg urgency"
            value={stats?.avgUrgency != null ? `${stats.avgUrgency.toFixed(1)}/5` : "—"}
          />
          <StatTile
            label="Most-reported theme"
            value={stats?.topCategory ? CATEGORY_META[stats.topCategory].label.en : "—"}
          />
        </div>

        <div className="shrink-0 flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | "all")}
            className="rounded-lg border bg-transparent px-2.5 py-1.5 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <option value="all">All themes</option>
            {CATEGORY_LIST.map((c) => (
              <option key={c.category} value={c.category}>
                {c.label.en}
              </option>
            ))}
          </select>
          <select
            value={selectedWardFromMap ?? wardFilter}
            onChange={(e) => {
              setSelectedWardFromMap(null);
              setWardFilter(e.target.value);
            }}
            className="rounded-lg border bg-transparent px-2.5 py-1.5 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <option value="all">All wards</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
            className="rounded-lg border bg-transparent px-2.5 py-1.5 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <option value="all">Citizen + development plan</option>
            <option value="citizen_demand">Citizen-driven only</option>
            <option value="development_plan">Development plan only</option>
          </select>
          {selectedWardFromMap && (
            <button
              onClick={() => setSelectedWardFromMap(null)}
              className="text-xs font-medium"
              style={{ color: "var(--brand)" }}
            >
              Clear map selection
            </button>
          )}
          <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
            {compareIds.length}/2 selected to compare
            {compareIds.length === 2 && (
              <button
                onClick={() => setShowCompare(true)}
                className="ml-2 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: "var(--brand)", color: "#fff" }}
              >
                Compare
              </button>
            )}
          </span>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 lg:min-h-0 lg:grid-cols-5">
          <div className="h-[420px] lg:col-span-2 lg:h-full">
            <HotspotMap items={filtered} onSelectWard={setSelectedWardFromMap} />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-3 lg:h-full lg:overflow-y-auto lg:pr-1">
            {loading && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Loading priorities…
              </p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No items match these filters yet.
              </p>
            )}
            {filtered.map((item, idx) => (
              <PriorityCard
                key={item.id}
                item={item}
                rank={idx + 1}
                selected={compareIds.includes(item.id)}
                selectDisabled={compareIds.length >= 2}
                onToggleSelect={() => toggleCompare(item.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {showCompare && compareItems.length === 2 && (
        <CompareModal
          a={compareItems[0]}
          b={compareItems[1]}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
