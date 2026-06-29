import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalSellers, totalOrders, pendingRequests, sellers, orders] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.sellerRequest.count({ where: { status: "PENDING" } }),
      prisma.sellerProfile.findMany({
        include: { user: { select: { id: true, name: true, email: true, image: true, role: true, createdAt: true } } },
        orderBy: { totalEarned: "desc" },
      }),
      prisma.order.findMany({
        where: { status: "PAID" },
        include: { buyer: { select: { name: true } }, seller: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const totalRevenue = await prisma.order.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  });

  return NextResponse.json({
    totalUsers, totalSellers, totalOrders, pendingRequests,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    sellers, recentOrders: orders,
  });
}
