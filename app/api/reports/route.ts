import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reportedId, reason, note } = await req.json();
  if (!reportedId || !reason) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (reportedId === session.user.id) return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });

  const report = await prisma.report.create({
    data: { reporterId: session.user.id, reportedId, reason, note: note || null },
  });

  return NextResponse.json(report);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { name: true, email: true } },
      reported: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(reports);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json();
  const report = await prisma.report.update({ where: { id }, data: { status } });
  return NextResponse.json(report);
}
