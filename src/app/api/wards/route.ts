import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const wards = await prisma.ward.findMany({
    select: { id: true, name: true, nameHi: true, nameTe: true, lat: true, lng: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ wards });
}
