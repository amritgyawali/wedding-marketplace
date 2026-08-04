import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const vendorId = session.metadata?.vendorId;
        if (!vendorId) break;

        if (session.metadata?.type === "FEATURED_BOOST") {
          const until = new Date();
          until.setDate(until.getDate() + 30);
          await prisma.vendorProfile.update({
            where: { id: vendorId },
            data: { isFeatured: true, featuredUntil: until },
          });
          break;
        }

        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const tier = session.metadata?.tier as "PRO" | "PREMIUM";
          await prisma.subscription.upsert({
            where: { vendorId },
            update: {
              tier,
              status: "ACTIVE",
              stripeSubscriptionId: sub.id,
              stripePriceId: sub.items.data[0].price.id,
              currentPeriodStart: new Date((sub as never as { current_period_start: number }).current_period_start * 1000),
              currentPeriodEnd: new Date((sub as never as { current_period_end: number }).current_period_end * 1000),
            },
            create: {
              vendorId,
              tier,
              status: "ACTIVE",
              stripeSubscriptionId: sub.id,
              stripePriceId: sub.items.data[0].price.id,
              currentPeriodStart: new Date((sub as never as { current_period_start: number }).current_period_start * 1000),
              currentPeriodEnd: new Date((sub as never as { current_period_end: number }).current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status.toUpperCase() as never,
            currentPeriodStart: new Date((sub as never as { current_period_start: number }).current_period_start * 1000),
            currentPeriodEnd: new Date((sub as never as { current_period_end: number }).current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { tier: "FREE", status: "CANCELED" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
