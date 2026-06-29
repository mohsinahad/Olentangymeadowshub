import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { sellerNote } = await req.json();

  await prisma.sellerProfile.update({
    where: { userId: session.user.id },
    data: { adminNote: sellerNote ?? null },
  });

  return NextResponse.json({ ok: true });
}
