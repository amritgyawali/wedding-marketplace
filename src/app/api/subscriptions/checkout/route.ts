import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const Schema = z.object({
  tier: z.enum(["PRO", "PREMIUM", "FEATURED_BOOST"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor) return NextResponse.json({ error: "No vendor profile" }, { status: 400 });

  let customerId = vendor.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: session.user.name ?? undefined,
      metadata: { vendorId: vendor.id },
    });
    customerId = customer.id;
    await prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (parsed.data.tier === "FEATURED_BOOST") {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_FEATURED_BOOST_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/vendor/subscription?success=1`,
      cancel_url: `${appUrl}/dashboard/vendor/subscription`,
      metadata: { vendorId: vendor.id, type: "FEATURED_BOOST" },
    });
    return NextResponse.json({ url: checkoutSession.url });
  }

  const priceId =
    parsed.data.tier === "PRO"
      ? process.env.STRIPE_PRO_PRICE_ID!
      : process.env.STRIPE_PREMIUM_PRICE_ID!;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/vendor/subscription?success=1`,
    cancel_url: `${appUrl}/dashboard/vendor/subscription`,
    metadata: { vendorId: vendor.id, tier: parsed.data.tier },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
