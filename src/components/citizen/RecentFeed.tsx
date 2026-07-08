import { CategoryBadge } from "@/components/ui/badges";
import { t, type Lang } from "@/lib/i18n";
import type { SubmissionDTO } from "@/lib/types";

export function RecentFeed({ items, lang }: { items: SubmissionDTO[]; lang: Lang }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {t(lang, "recentInArea")}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {t(lang, "noRecent")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((s) => (
            <li key={s.id} className="flex flex-col gap-1.5">
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                {s.summary || s.translatedText || s.rawText}
              </p>
              {s.category && <CategoryBadge category={s.category} lang={lang} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
