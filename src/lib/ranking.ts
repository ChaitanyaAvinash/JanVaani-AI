import { prisma } from "@/lib/prisma";
import { CATEGORY_META } from "@/lib/categories";
import type { Category, Sentiment } from "@/generated/prisma/enums";

export const RANKING_WEIGHTS = {
  demand: 0.4,
  urgency: 0.25,
  needGap: 0.35,
} as const;

export interface WardLite {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface WardGapFields {
  schoolEnrollment: number;
  schoolCapacity: number;
  nearestSchoolKm: number;
  nearestHospitalKm: number;
  householdsNoPipedWater: number;
  households: number;
  electricityGapPct: number;
  roadGapScore: number;
  unemploymentRate: number;
  housingGapPct: number;
}

export interface Quote {
  text: string;
  language: string;
  channel: string;
  urgency: number | null;
}

export interface PriorityItem {
  id: string;
  kind: "citizen_demand" | "development_plan";
  title: string;
  description: string | null;
  category: Category;
  ward: WardLite | null;

  demandRaw: number;
  demandScore: number;
  urgencyRaw: number | null;
  urgencyScore: number;
  needGapScore: number;
  finalScore: number;

  submissionCount: number;
  avgUrgency: number | null;
  sentiment: Record<Sentiment, number>;
  quotes: Quote[];

  estCostLakh: number | null;
  source: "citizen" | "development_plan";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function recencyWeight(createdAt: Date, now: number) {
  const ageDays = (now - createdAt.getTime()) / 86_400_000;
  return Math.max(0.25, Math.exp(-ageDays / 45));
}

function needGapScore(category: Category, ward: WardGapFields | null): number {
  if (!ward) return 50;
  switch (category) {
    case "education": {
      const overCapacity =
        ward.schoolCapacity > 0
          ? Math.max(
              0,
              (ward.schoolEnrollment - ward.schoolCapacity) / ward.schoolCapacity
            )
          : 0;
      const distance = clamp(ward.nearestSchoolKm / 5, 0, 1);
      return clamp(0.6 * overCapacity + 0.4 * distance, 0, 1) * 100;
    }
    case "healthcare":
      return clamp(ward.nearestHospitalKm / 10, 0, 1) * 100;
    case "water_sanitation":
      return ward.households > 0
        ? clamp(ward.householdsNoPipedWater / ward.households, 0, 1) * 100
        : 50;
    case "electricity":
      return clamp(ward.electricityGapPct, 0, 100);
    case "roads_transport":
      return clamp(ward.roadGapScore, 0, 100);
    case "employment_vocational":
      return clamp(ward.unemploymentRate, 0, 100);
    case "housing":
      return clamp(ward.housingGapPct, 0, 100);
    default:
      return 50;
  }
}

function normalize(values: number[]): (v: number) => number {
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const range = max - min;
  if (range <= 0) return () => 0;
  return (v: number) => clamp(((v - min) / range) * 100, 0, 100);
}

interface Cluster {
  category: Category;
  wardId: string | null;
  ward: WardLite | null;
  demandRaw: number;
  count: number;
  urgencySum: number;
  urgencyCount: number;
  sentiment: Record<Sentiment, number>;
  quotes: Quote[];
}

export async function computePriorities(): Promise<PriorityItem[]> {
  const now = Date.now();

  const [submissions, proposals, wards] = await Promise.all([
    prisma.submission.findMany({
      where: { status: "analyzed", category: { not: null } },
      include: { ward: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.proposal.findMany({ include: { ward: true } }),
    prisma.ward.findMany(),
  ]);

  const wardsById = new Map(wards.map((w) => [w.id, w]));

  const clusters = new Map<string, Cluster>();

  for (const s of submissions) {
    if (!s.category) continue;
    const key = `${s.category}::${s.wardId ?? "none"}`;
    let c = clusters.get(key);
    if (!c) {
      c = {
        category: s.category,
        wardId: s.wardId,
        ward: s.ward
          ? { id: s.ward.id, name: s.ward.name, lat: s.ward.lat, lng: s.ward.lng }
          : null,
        demandRaw: 0,
        count: 0,
        urgencySum: 0,
        urgencyCount: 0,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        quotes: [],
      };
      clusters.set(key, c);
    }
    c.demandRaw += recencyWeight(s.createdAt, now);
    c.count += 1;
    if (s.urgency != null) {
      c.urgencySum += s.urgency;
      c.urgencyCount += 1;
    }
    if (s.sentiment) c.sentiment[s.sentiment] += 1;
    if (c.quotes.length < 3 && (s.translatedText || s.summary)) {
      c.quotes.push({
        text: s.summary || s.translatedText || "",
        language: s.language || "unknown",
        channel: s.channel,
        urgency: s.urgency,
      });
    }
  }

  interface Draft {
    key: string;
    kind: PriorityItem["kind"];
    category: Category;
    ward: WardLite | null;
    demandRaw: number;
    urgencyRaw: number | null;
    needGap: number;
    submissionCount: number;
    avgUrgency: number | null;
    sentiment: Record<Sentiment, number>;
    quotes: Quote[];
    title: string;
    description: string | null;
    estCostLakh: number | null;
  }

  const drafts: Draft[] = [];

  for (const [, c] of clusters) {
    const avgUrgency = c.urgencyCount > 0 ? c.urgencySum / c.urgencyCount : null;
    drafts.push({
      key: `cluster:${c.category}::${c.wardId ?? "none"}`,
      kind: "citizen_demand",
      category: c.category,
      ward: c.ward,
      demandRaw: c.demandRaw,
      urgencyRaw: avgUrgency,
      needGap: needGapScore(c.category, c.wardId ? wardsById.get(c.wardId) ?? null : null),
      submissionCount: c.count,
      avgUrgency,
      sentiment: c.sentiment,
      quotes: c.quotes,
      title: `${CATEGORY_META[c.category].label.en} — ${c.ward?.name ?? "Constituency-wide"}`,
      description: null,
      estCostLakh: null,
    });
  }

  for (const p of proposals) {
    const key = `${p.category}::${p.wardId ?? "none"}`;
    const matched = clusters.get(key);
    const avgUrgency =
      matched && matched.urgencyCount > 0
        ? matched.urgencySum / matched.urgencyCount
        : null;
    drafts.push({
      key: `proposal:${p.id}`,
      kind: "development_plan",
      category: p.category,
      ward: p.ward
        ? { id: p.ward.id, name: p.ward.name, lat: p.ward.lat, lng: p.ward.lng }
        : null,
      demandRaw: matched?.demandRaw ?? 0,
      urgencyRaw: avgUrgency,
      needGap: needGapScore(p.category, p.wardId ? wardsById.get(p.wardId) ?? null : null),
      submissionCount: matched?.count ?? 0,
      avgUrgency,
      sentiment: matched?.sentiment ?? { positive: 0, neutral: 0, negative: 0 },
      quotes: matched?.quotes ?? [],
      title: p.title,
      description: p.description,
      estCostLakh: p.estCostLakh,
    });
  }

  const demandNorm = normalize(drafts.map((d) => d.demandRaw));
  const urgencyNorm = (u: number | null) => (u == null ? 0 : ((u - 1) / 4) * 100);

  const items: PriorityItem[] = drafts.map((d) => {
    const demandScore = demandNorm(d.demandRaw);
    const urgencyScore = urgencyNorm(d.urgencyRaw);
    const finalScore =
      RANKING_WEIGHTS.demand * demandScore +
      RANKING_WEIGHTS.urgency * urgencyScore +
      RANKING_WEIGHTS.needGap * d.needGap;

    return {
      id: d.key,
      kind: d.kind,
      title: d.title,
      description: d.description,
      category: d.category,
      ward: d.ward,
      demandRaw: d.demandRaw,
      demandScore: Math.round(demandScore),
      urgencyRaw: d.urgencyRaw,
      urgencyScore: Math.round(urgencyScore),
      needGapScore: Math.round(d.needGap),
      finalScore: Math.round(finalScore),
      submissionCount: d.submissionCount,
      avgUrgency: d.avgUrgency,
      sentiment: d.sentiment,
      quotes: d.quotes,
      estCostLakh: d.estCostLakh,
      source: d.kind === "citizen_demand" ? "citizen" : "development_plan",
    };
  });

  return items.sort((a, b) => b.finalScore - a.finalScore);
}
