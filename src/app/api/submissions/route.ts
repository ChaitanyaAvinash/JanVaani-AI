import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeSubmission } from "@/lib/gemini";
import type { Channel } from "@/generated/prisma/enums";

const MAX_BASE64_LEN = 3_000_000;

const VALID_CHANNELS: Channel[] = ["text", "voice", "photo", "whatsapp"];

interface SubmitBody {
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
  audioBase64?: string;
  audioMimeType?: string;
  wardId?: string;
  citizenName?: string;
  channel?: string;
}

export async function POST(request: Request) {
  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text?.trim() || undefined;
  const hasImage = Boolean(body.imageBase64 && body.imageMimeType);
  const hasAudio = Boolean(body.audioBase64 && body.audioMimeType);

  if (!text && !hasImage && !hasAudio) {
    return NextResponse.json(
      { error: "Provide at least one of: text, photo, or voice recording." },
      { status: 400 }
    );
  }
  if (
    (body.imageBase64 && body.imageBase64.length > MAX_BASE64_LEN) ||
    (body.audioBase64 && body.audioBase64.length > MAX_BASE64_LEN)
  ) {
    return NextResponse.json(
      { error: "Attachment is too large for the demo. Please use a smaller file." },
      { status: 413 }
    );
  }
  if (!body.wardId) {
    return NextResponse.json({ error: "wardId is required." }, { status: 400 });
  }

  const ward = await prisma.ward.findUnique({ where: { id: body.wardId } });
  if (!ward) {
    return NextResponse.json({ error: "Unknown ward." }, { status: 400 });
  }

  const channel: Channel = VALID_CHANNELS.includes(body.channel as Channel)
    ? (body.channel as Channel)
    : "text";

  const analysis = await analyzeSubmission({
    text,
    imageBase64: body.imageBase64,
    imageMimeType: body.imageMimeType,
    audioBase64: body.audioBase64,
    audioMimeType: body.audioMimeType,
    wardName: ward.name,
  });

  const submission = await prisma.submission.create({
    data: {
      channel,
      rawText: text,
      language: analysis.language,
      translatedText: analysis.translatedText,
      photoDataUrl: hasImage ? `data:${body.imageMimeType};base64,${body.imageBase64}` : null,
      photoDescription: analysis.photoDescription,
      audioDataUrl: hasAudio ? `data:${body.audioMimeType};base64,${body.audioBase64}` : null,
      category: analysis.category,
      urgency: analysis.urgency,
      sentiment: analysis.sentiment,
      summary: analysis.summary,
      status: "analyzed",
      citizenName: body.citizenName?.trim() || null,
      wardId: ward.id,
      lat: ward.lat,
      lng: ward.lng,
    },
    include: { ward: true },
  });

  return NextResponse.json({
    submission,
    usedFallback: analysis.usedFallback,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const wardId = searchParams.get("wardId") || undefined;

  const submissions = await prisma.submission.findMany({
    where: { status: "analyzed", ...(wardId ? { wardId } : {}) },
    include: { ward: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ submissions });
}
