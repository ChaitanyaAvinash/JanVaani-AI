import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Category, Sentiment } from "@/generated/prisma/enums";

const CATEGORIES: Category[] = [
  "education",
  "healthcare",
  "roads_transport",
  "water_sanitation",
  "electricity",
  "employment_vocational",
  "housing",
  "agriculture",
  "public_safety",
  "other",
];

export interface AnalysisInput {
  text?: string | null;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  audioBase64?: string | null;
  audioMimeType?: string | null;
  wardName?: string | null;
}

export interface AnalysisResult {
  language: string;
  translatedText: string;
  category: Category;
  urgency: number;
  sentiment: Sentiment;
  summary: string;
  photoDescription: string | null;
  usedFallback: boolean;
}

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    language: {
      type: SchemaType.STRING,
      description:
        "ISO-ish language code of the citizen's original message: en, hi, te, or other",
    },
    translatedText: {
      type: SchemaType.STRING,
      description:
        "The citizen's message (transcribed if audio, described if only a photo) translated into clear English",
    },
    category: {
      type: SchemaType.STRING,
      format: "enum",
      enum: CATEGORIES,
    },
    urgency: {
      type: SchemaType.INTEGER,
      description:
        "1 (minor/cosmetic) to 5 (severe, safety-critical, or blocking access to a basic service)",
    },
    sentiment: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["positive", "neutral", "negative"],
    },
    summary: {
      type: SchemaType.STRING,
      description:
        "One concise sentence in English summarizing the issue, suitable for an MP's dashboard",
    },
    photoDescription: {
      type: SchemaType.STRING,
      description:
        "If a photo was provided, a short factual description of the civic issue visible in it. Empty string if no photo.",
    },
  },
  required: [
    "language",
    "translatedText",
    "category",
    "urgency",
    "sentiment",
    "summary",
    "photoDescription",
  ],
};

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

const SYSTEM_INSTRUCTION = `You are the intake AI for JanVaani, a civic-development platform that helps an Indian Member of Parliament triage development requests from citizens. Citizens submit issues by text, voice recording, or photo, in English, Hindi, or Telugu (sometimes mixed/code-switched). For each submission:
1. If audio is present, transcribe it faithfully in its original language, then work from that transcript.
2. If a photo is present, describe the civic issue it shows factually (e.g. "large pothole across the full width of a paved road", "overflowing open drain next to houses").
3. Detect the primary language and translate the substance of the message into clear, concise English.
4. Classify it into exactly one category.
5. Rate urgency 1-5: 5 = safety-critical or completely blocks access to a basic service (e.g. collapsed bridge, no drinking water), 3 = clear ongoing hardship, 1 = minor/cosmetic.
6. Rate the citizen's tone as positive, neutral, or negative.
7. Write one factual, concrete sentence summarizing the issue for an MP's dashboard — avoid vague phrasing.
Respond ONLY with the JSON object described by the schema. Do not invent details that are not present in the input.`;

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Free-tier Gemini quotas are tight (a handful of requests/minute). On a
 * 429 the API tells us exactly how long to back off — honor that instead of
 * guessing, and only fall back to the offline analyzer once retries are
 * exhausted. */
function retryDelayMs(err: unknown): number | null {
  const e = err as { status?: number; errorDetails?: Array<{ "@type"?: string; retryDelay?: string }> };
  if (e?.status !== 429) return null;
  const info = e.errorDetails?.find((d) => d["@type"]?.includes("RetryInfo"));
  const match = info?.retryDelay ? /^([\d.]+)s$/.exec(info.retryDelay) : null;
  return match ? Math.ceil(parseFloat(match[1]) * 1000) + 1000 : 20_000;
}

export async function analyzeSubmission(
  input: AnalysisInput,
  options?: { patient?: boolean }
): Promise<AnalysisResult> {
  const client = getClient();
  if (!client) {
    return fallbackAnalyze(input);
  }

  // Interactive requests (a citizen waiting on the Send button) must not
  // hang for minutes on a rate limit — fail straight to the offline
  // fallback. Only batch callers (the seed script) opt into patient
  // retry-with-backoff, where waiting is fine.
  const MAX_ATTEMPTS = options?.patient ? 3 : 1;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await analyzeSubmissionOnce(client, input);
    } catch (err) {
      const delay = retryDelayMs(err);
      if (delay != null && attempt < MAX_ATTEMPTS) {
        console.warn(
          `Gemini rate-limited, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt}/${MAX_ATTEMPTS})…`
        );
        await sleep(delay);
        continue;
      }
      console.error("Gemini analysis failed, using fallback:", err);
      return fallbackAnalyze(input);
    }
  }
  return fallbackAnalyze(input);
}

async function analyzeSubmissionOnce(
  client: GoogleGenerativeAI,
  input: AnalysisInput
): Promise<AnalysisResult> {
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema as never,
    },
  });

  const parts: Array<
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  > = [];

  const contextLines = [
    input.wardName ? `Ward: ${input.wardName}` : null,
    input.text ? `Citizen text: ${input.text}` : null,
    !input.text && !input.audioBase64
      ? "Citizen text: (none provided — analyze the photo only)"
      : null,
  ].filter(Boolean);
  parts.push({ text: contextLines.join("\n") || "Citizen submission." });

  if (input.audioBase64 && input.audioMimeType) {
    parts.push({
      inlineData: { data: input.audioBase64, mimeType: input.audioMimeType },
    });
  }
  if (input.imageBase64 && input.imageMimeType) {
    parts.push({
      inlineData: { data: input.imageBase64, mimeType: input.imageMimeType },
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
  });

  const raw = result.response.text();
  const parsed = JSON.parse(raw) as {
    language: string;
    translatedText: string;
    category: string;
    urgency: number;
    sentiment: string;
    summary: string;
    photoDescription: string;
  };

  return {
    language: parsed.language || "other",
    translatedText: parsed.translatedText || input.text || "",
    category: CATEGORIES.includes(parsed.category as Category)
      ? (parsed.category as Category)
      : "other",
    urgency: clamp(Math.round(parsed.urgency ?? 3), 1, 5),
    sentiment: (["positive", "neutral", "negative"].includes(parsed.sentiment)
      ? parsed.sentiment
      : "neutral") as Sentiment,
    summary: parsed.summary || input.text || "Citizen submission received.",
    photoDescription: parsed.photoDescription || null,
    usedFallback: false,
  };
}

/** A short, AI-written MP-facing paragraph comparing two priority items. */
export async function generateComparisonNote(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const model = client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction:
        "You are a policy analyst briefing an Indian MP. Given two structured development-priority items (JSON), write one short, neutral, evidence-based paragraph (max 90 words) comparing them and noting what data would most change the recommendation. No markdown, plain prose.",
    });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Item A: ${JSON.stringify(a)}\n\nItem B: ${JSON.stringify(
                b
              )}`,
            },
          ],
        },
      ],
    });
    return result.response.text().trim();
  } catch (err) {
    console.error("Gemini comparison note failed:", err);
    return null;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const KEYWORD_MAP: Array<{ category: Category; keywords: string[] }> = [
  {
    category: "education",
    keywords: ["school", "college", "teacher", "student", "classroom", "स्कूल", "పాఠశాల", "విద్య"],
  },
  {
    category: "healthcare",
    keywords: ["hospital", "clinic", "doctor", "medicine", "अस्पताल", "ఆసుపత్రి"],
  },
  {
    category: "roads_transport",
    keywords: ["road", "pothole", "bus", "bridge", "सड़क", "రోడ్డు"],
  },
  {
    category: "water_sanitation",
    keywords: ["water", "drain", "sewage", "toilet", "पानी", "నీరు"],
  },
  {
    category: "electricity",
    keywords: ["power", "electricity", "transformer", "बिजली", "కరెంట్"],
  },
  {
    category: "employment_vocational",
    keywords: ["job", "employment", "vocational", "training", "skill", "रोजगार", "ఉద్యోగం"],
  },
  {
    category: "housing",
    keywords: ["house", "housing", "roof", "मकान", "ఇల్లు"],
  },
  {
    category: "agriculture",
    keywords: ["crop", "farm", "irrigation", "fertilizer", "किसान", "వ్యవసాయం"],
  },
  {
    category: "public_safety",
    keywords: ["safety", "crime", "police", "streetlight", "सुरक्षा", "భద్రత"],
  },
];

/** Deterministic keyword-based analysis used when GEMINI_API_KEY is not set, so the app and seed script still work offline. */
function fallbackAnalyze(input: AnalysisInput): AnalysisResult {
  const haystack = (input.text || "").toLowerCase();
  const match = KEYWORD_MAP.find(({ keywords }) =>
    keywords.some((k) => haystack.includes(k.toLowerCase()))
  );

  return {
    language: "unknown",
    translatedText: input.text || (input.imageBase64 ? "(photo submission)" : ""),
    category: match?.category ?? "other",
    urgency: 3,
    sentiment: "neutral",
    summary:
      input.text?.slice(0, 140) ||
      "Citizen submission awaiting AI analysis (set GEMINI_API_KEY for full analysis).",
    photoDescription: input.imageBase64 ? "Photo attached (AI description unavailable — set GEMINI_API_KEY)." : null,
    usedFallback: true,
  };
}
