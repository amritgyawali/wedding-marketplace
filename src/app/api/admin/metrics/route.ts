import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  await requireRole("ADMIN");

  const [
    totalVendors,
    verifiedVendors,
    totalCouples,
    totalReviews,
    pendingReviews,
    totalInquiries,
    activeSubscriptions,
  ] = await Promise.all([
    prisma.vendorProfile.count(),
    prisma.vendorProfile.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.coupleProfile.count(),
    prisma.review.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.inquiry.count(),
    prisma.subscription.count({
      where: { status: "ACTIVE", tier: { not: "FREE" } },
    }),
  ]);

  return NextResponse.json({
    totalVendors,
    verifiedVendors,
    totalCouples,
    totalReviews,
    pendingReviews,
    totalInquiries,
    activeSubscriptions,
  });
}
