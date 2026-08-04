import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { generateVendorSlug } from "@/lib/utils";
import { VendorProfileSchema } from "@/schemas/vendor";

function computeCompleteness(data: Record<string, unknown>): number {
  const fields = [
    "businessName", "tagline", "description", "phone", "email",
    "city", "website", "priceTier",
  ];
  const filled = fields.filter((f) => data[f]).length;
  return Math.round((filled / fields.length) * 100);
}

export async function POST(req: NextRequest) {
  const session = await requireRole("VENDOR");
  const body = await req.json();
  const parsed = VendorProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { categoryId, ...rest } = parsed.data;

  const existing = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  let vendor;
  if (existing) {
    vendor = await prisma.vendorProfile.update({
      where: { id: existing.id },
      data: { ...rest, completenessScore: computeCompleteness(rest) },
    });
  } else {
    if (!categoryId) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const slug = generateVendorSlug(rest.businessName, id);

    vendor = await prisma.vendorProfile.create({
      data: {
        id,
        userId: session.user.id,
        categoryId,
        slug,
        ...rest,
        completenessScore: computeCompleteness(rest),
        subscription: {
          create: { tier: "FREE", status: "ACTIVE" },
        },
      },
    });
  }

  return NextResponse.json({ vendor });
}
