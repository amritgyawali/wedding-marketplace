import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { ModerateReviewSchema } from "@/schemas/review";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("ADMIN");
  const { id } = await params;
  const body = await req.json();
  const parsed = ModerateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.review.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    if (parsed.data.status === "APPROVED") {
      const stats = await tx.review.aggregate({
        where: { vendorId: r.vendorId, status: "APPROVED" },
        _avg: { rating: true },
        _count: true,
      });
      await tx.vendorProfile.update({
        where: { id: r.vendorId },
        data: {
          avgRating: stats._avg.rating ?? 0,
          reviewCount: stats._count,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        adminId: session.user.id,
        action: `REVIEW_${parsed.data.status}`,
        targetType: "Review",
        targetId: id,
        details: { reason: parsed.data.reason },
      },
    });

    return r;
  });

  return NextResponse.json(updated);
}
