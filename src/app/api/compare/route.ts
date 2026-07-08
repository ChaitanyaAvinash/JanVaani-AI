import { NextResponse } from "next/server";
import { computePriorities } from "@/lib/ranking";
import { generateComparisonNote } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { a?: string; b?: string } | null;
  if (!body?.a || !body?.b) {
    return NextResponse.json({ error: "Provide item ids 'a' and 'b'." }, { status: 400 });
  }

  const items = await computePriorities();
  const a = items.find((i) => i.id === body.a);
  const b = items.find((i) => i.id === body.b);
  if (!a || !b) {
    return NextResponse.json({ error: "Unknown item id(s)." }, { status: 404 });
  }

  const note = await generateComparisonNote(
    { title: a.title, category: a.category, ward: a.ward?.name, score: a.finalScore, demand: a.demandScore, urgency: a.urgencyScore, needGap: a.needGapScore, submissionCount: a.submissionCount, estCostLakh: a.estCostLakh },
    { title: b.title, category: b.category, ward: b.ward?.name, score: b.finalScore, demand: b.demandScore, urgency: b.urgencyScore, needGap: b.needGapScore, submissionCount: b.submissionCount, estCostLakh: b.estCostLakh }
  );

  return NextResponse.json({ a, b, note });
}
