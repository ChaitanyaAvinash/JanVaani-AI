import { CategoryIcon } from "@/components/ui/category-icon";
import { CATEGORY_META, STATUS_COLORS, urgencyStatus } from "@/lib/categories";
import type { Category } from "@/generated/prisma/enums";

export function CategoryBadge({
  category,
  lang = "en",
}: {
  category: Category;
  lang?: "en" | "hi" | "te";
}) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{
        color: meta.cssVar,
        backgroundColor: `color-mix(in srgb, ${meta.cssVar} 14%, var(--surface-1))`,
        border: `1px solid color-mix(in srgb, ${meta.cssVar} 35%, transparent)`,
      }}
    >
      <CategoryIcon icon={meta.icon} size={13} strokeWidth={2.25} />
      {meta.label[lang]}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: number }) {
  const status = urgencyStatus(urgency);
  const color = STATUS_COLORS[status.key];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, var(--surface-1))`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status.label} urgency
    </span>
  );
}

export function SourceBadge({ kind }: { kind: "citizen_demand" | "development_plan" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap border"
      style={{
        color: "var(--text-secondary)",
        borderColor: "var(--border)",
        backgroundColor: "var(--surface-2)",
      }}
    >
      {kind === "citizen_demand" ? "Citizen-driven" : "Development plan"}
    </span>
  );
}
