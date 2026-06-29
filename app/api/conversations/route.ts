import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true, sellerProfile: { select: { fullName: true, jobType: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sellerId } = await req.json();
  if (session.user.id === sellerId) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  const existing = await prisma.conversation.findUnique({
    where: { buyerId_sellerId: { buyerId: session.user.id, sellerId } },
  });
  if (existing) return NextResponse.json(existing);

  const conversation = await prisma.conversation.create({
    data: { buyerId: session.user.id, sellerId },
  });

  return NextResponse.json(conversation, { status: 201 });
}
