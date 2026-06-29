import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (![ "APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const request = await prisma.sellerRequest.update({
    where: { id },
    data: { status, reviewedAt: new Date() },
  });

  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: request.userId },
      data: { role: "SELLER" },
    });

    await prisma.sellerProfile.upsert({
      where: { userId: request.userId },
      create: {
        userId: request.userId,
        fullName: request.fullName,
        jobType: request.jobType,
        price: request.price,
        priceUnit: request.priceUnit,
        availability: request.availability,
        duration: request.duration,
        bio: request.bio,
      },
      update: {
        fullName: request.fullName,
        jobType: request.jobType,
        price: request.price,
        priceUnit: request.priceUnit,
        availability: request.availability,
        duration: request.duration,
        bio: request.bio,
      },
    });
  }

  return NextResponse.json(request);
}
