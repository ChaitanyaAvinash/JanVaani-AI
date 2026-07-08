import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computePriorities, RANKING_WEIGHTS } from "@/lib/ranking";
import type { Category } from "@/generated/prisma/enums";

export async function GET() {
  const [items, totalSubmissions, urgencyAgg] = await Promise.all([
    computePriorities(),
    prisma.submission.count({ where: { status: "analyzed" } }),
    prisma.submission.aggregate({
      where: { status: "analyzed", urgency: { not: null } },
      _avg: { urgency: true },
    }),
  ]);

  const activeHotspots = items.filter(
    (i) => i.kind === "citizen_demand" && i.submissionCount >= 2
  ).length;

  const byCategory = new Map<Category, number>();
  for (const i of items) {
    if (i.kind !== "citizen_demand") continue;
    byCategory.set(i.category, (byCategory.get(i.category) ?? 0) + i.submissionCount);
  }
  let topCategory: Category | null = null;
  let topCount = 0;
  for (const [cat, count] of byCategory) {
    if (count > topCount) {
      topCategory = cat;
      topCount = count;
    }
  }

  return NextResponse.json({
    items,
    weights: RANKING_WEIGHTS,
    stats: {
      totalSubmissions,
      activeHotspots,
      avgUrgency: urgencyAgg._avg.urgency,
      topCategory,
    },
  });
}
