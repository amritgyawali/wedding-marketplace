import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { VendorProfileSchema } from "@/schemas/vendor";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const vendor = await prisma.vendorProfile.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      category: true,
      media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      subscription: true,
      serviceAreas: true,
    },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  return NextResponse.json(vendor);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const vendor = await prisma.vendorProfile.findUnique({ where: { id } });
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (vendor.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = VendorProfileSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const fields = parsed.data;
  const completenessFields = [
    "businessName", "tagline", "description", "phone", "email",
    "city", "website", "priceTier",
  ];

  const current = { ...vendor, ...fields };
  const completenessScore = Math.round(
    (completenessFields.filter((f) => current[f as keyof typeof current]).length /
      completenessFields.length) *
      100
  );

  const updated = await prisma.vendorProfile.update({
    where: { id },
    data: { ...fields, completenessScore },
  });

  return NextResponse.json(updated);
}
