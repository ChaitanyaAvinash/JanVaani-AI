import type { Category } from "@/generated/prisma/enums";

export interface CategoryMeta {
  category: Category;
  label: { en: string; hi: string; te: string };
  icon:
    | "school"
    | "stethoscope"
    | "road"
    | "droplet"
    | "zap"
    | "hammer"
    | "home"
    | "wheat"
    | "shield"
    | "circle-ellipsis";
  cssVar: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  education: {
    category: "education",
    label: { en: "Education", hi: "शिक्षा", te: "విద్య" },
    icon: "school",
    cssVar: "var(--cat-education)",
  },
  healthcare: {
    category: "healthcare",
    label: { en: "Healthcare", hi: "स्वास्थ्य", te: "ఆరోగ్యం" },
    icon: "stethoscope",
    cssVar: "var(--cat-healthcare)",
  },
  roads_transport: {
    category: "roads_transport",
    label: { en: "Roads & Transport", hi: "सड़क व परिवहन", te: "రోడ్లు & రవాణా" },
    icon: "road",
    cssVar: "var(--cat-roads)",
  },
  water_sanitation: {
    category: "water_sanitation",
    label: { en: "Water & Sanitation", hi: "जल व स्वच्छता", te: "నీరు & పారిశుద్ధ్యం" },
    icon: "droplet",
    cssVar: "var(--cat-water)",
  },
  electricity: {
    category: "electricity",
    label: { en: "Electricity", hi: "बिजली", te: "విద్యుత్" },
    icon: "zap",
    cssVar: "var(--cat-electricity)",
  },
  employment_vocational: {
    category: "employment_vocational",
    label: { en: "Employment & Vocational", hi: "रोजगार व कौशल", te: "ఉపాధి & నైపుణ్యం" },
    icon: "hammer",
    cssVar: "var(--cat-employment)",
  },
  housing: {
    category: "housing",
    label: { en: "Housing", hi: "आवास", te: "గృహనిర్మాణం" },
    icon: "home",
    cssVar: "var(--cat-housing)",
  },
  agriculture: {
    category: "agriculture",
    label: { en: "Agriculture", hi: "कृषि", te: "వ్యవసాయం" },
    icon: "wheat",
    cssVar: "var(--cat-agriculture)",
  },
  public_safety: {
    category: "public_safety",
    label: { en: "Public Safety", hi: "सार्वजनिक सुरक्षा", te: "ప్రజా భద్రత" },
    icon: "shield",
    cssVar: "var(--cat-neutral)",
  },
  other: {
    category: "other",
    label: { en: "Other", hi: "अन्य", te: "ఇతర" },
    icon: "circle-ellipsis",
    cssVar: "var(--cat-neutral)",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORY_META);

export const STATUS_COLORS = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  serious: "var(--status-serious)",
  critical: "var(--status-critical)",
} as const;

export function urgencyStatus(
  urgency: number
): { key: keyof typeof STATUS_COLORS; label: string } {
  if (urgency >= 5) return { key: "critical", label: "Critical" };
  if (urgency >= 4) return { key: "serious", label: "High" };
  if (urgency >= 2) return { key: "warning", label: "Moderate" };
  return { key: "good", label: "Low" };
}
