import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { fullName, jobType, price, priceUnit, availability, duration, bio } = body;

  if (!fullName || !jobType || !price || !availability || !duration) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.sellerRequest.findUnique({ where: { userId: session.user.id } });
  if (existing) return NextResponse.json({ error: "You already have a pending or reviewed request" }, { status: 400 });

  const request = await prisma.sellerRequest.create({
    data: {
      userId: session.user.id,
      fullName, jobType,
      price: parseFloat(price),
      priceUnit: priceUnit || "per job",
      availability, duration, bio,
    },
  });

  return NextResponse.json(request, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const requests = await prisma.sellerRequest.findMany({
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
