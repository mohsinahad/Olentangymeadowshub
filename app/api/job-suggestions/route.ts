import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { suggestion, description } = await req.json();
  if (!suggestion?.trim()) return NextResponse.json({ error: "Suggestion is required" }, { status: 400 });

  const record = await prisma.jobSuggestion.create({
    data: { userId: session.user.id, suggestion: suggestion.trim(), description: description?.trim() || null },
  });

  return NextResponse.json(record);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const suggestions = await prisma.jobSuggestion.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(suggestions);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json();
  const record = await prisma.jobSuggestion.update({ where: { id }, data: { status } });
  return NextResponse.json(record);
}
