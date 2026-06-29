import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sellerId, serviceType, amount } = await req.json();

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: sellerId },
    include: { user: { select: { name: true } } },
  });
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: `${serviceType} by ${seller.fullName}`, description: `${seller.availability} • ${seller.duration}` },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/seller/${sellerId}`,
    metadata: { buyerId: session.user.id, sellerId, serviceType, amount: amount.toString() },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
