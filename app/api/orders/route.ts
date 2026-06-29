import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] },
    include: {
      buyer: { select: { name: true, email: true, image: true } },
      seller: { select: { name: true, sellerProfile: { select: { fullName: true, jobType: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sellerId, serviceType, amount, paymentMethod } = await req.json();

  const order = await prisma.order.create({
    data: {
      buyerId: session.user.id,
      sellerId,
      serviceType,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod === "IN_PERSON" ? "IN_PERSON" : "STRIPE",
    },
  });

  return NextResponse.json(order, { status: 201 });
}
