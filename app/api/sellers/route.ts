import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobType = searchParams.get("jobType");

  const sellers = await prisma.sellerProfile.findMany({
    where: jobType ? { jobType } : undefined,
    include: { user: { select: { id: true, name: true, email: true, image: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sellers);
}
