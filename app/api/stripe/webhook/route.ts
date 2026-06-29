import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const { buyerId, sellerId, serviceType, amount } = checkoutSession.metadata!;

    const order = await prisma.order.create({
      data: { buyerId, sellerId, serviceType, amount: parseFloat(amount), status: "PAID", stripeSessionId: checkoutSession.id },
    });

    await prisma.sellerProfile.update({
      where: { userId: sellerId },
      data: { totalEarned: { increment: parseFloat(amount) } },
    });

    console.log("Order created:", order.id);
  }

  return NextResponse.json({ received: true });
}
