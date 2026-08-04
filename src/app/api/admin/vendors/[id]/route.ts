import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { z } from "zod";

const Schema = z.object({
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"]),
  reason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("ADMIN");
  const { id } = await params;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const vendor = await prisma.vendorProfile.update({
    where: { id },
    data: { verificationStatus: parsed.data.verificationStatus },
  });

  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: `VENDOR_${parsed.data.verificationStatus}`,
      targetType: "VendorProfile",
      targetId: id,
      details: { reason: parsed.data.reason },
    },
  });

  return NextResponse.json(vendor);
}
