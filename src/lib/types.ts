import type { Category, Channel, Sentiment } from "@/generated/prisma/enums";

export interface WardDTO {
  id: string;
  name: string;
  nameHi: string | null;
  nameTe: string | null;
  lat: number;
  lng: number;
}

export interface PriorityItemDTO {
  id: string;
  kind: "citizen_demand" | "development_plan";
  title: string;
  description: string | null;
  category: Category;
  ward: WardDTO | null;

  demandRaw: number;
  demandScore: number;
  urgencyRaw: number | null;
  urgencyScore: number;
  needGapScore: number;
  finalScore: number;

  submissionCount: number;
  avgUrgency: number | null;
  sentiment: Record<Sentiment, number>;
  quotes: { text: string; language: string; channel: string; urgency: number | null }[];

  estCostLakh: number | null;
  source: "citizen" | "development_plan";
}

export interface DashboardStats {
  totalSubmissions: number;
  activeHotspots: number;
  avgUrgency: number | null;
  topCategory: Category | null;
}

export interface SubmissionDTO {
  id: string;
  channel: Channel;
  rawText: string | null;
  language: string | null;
  translatedText: string | null;
  photoDataUrl: string | null;
  photoDescription: string | null;
  audioDataUrl: string | null;
  category: Category | null;
  urgency: number | null;
  sentiment: Sentiment | null;
  summary: string | null;
  status: string;
  citizenName: string | null;
  lat: number | null;
  lng: number | null;
  wardId: string | null;
  ward: WardDTO | null;
  createdAt: string;
}
