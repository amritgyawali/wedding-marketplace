import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function getCouple(userId: string) {
  return prisma.coupleProfile.findUnique({ where: { userId } });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COUPLE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const couple = await getCouple(session.user.id);
  if (!couple) return NextResponse.json([]);

  const favorites = await prisma.favorite.findMany({
    where: { coupleProfileId: couple.id },
    include: {
      couple: false,
    },
  });

  const vendorIds = favorites.map((f) => f.vendorId);
  const vendors = await prisma.vendorProfile.findMany({
    where: { id: { in: vendorIds } },
    include: {
      category: { select: { name: true, slug: true } },
      media: { where: { isCover: true }, take: 1 },
    },
  });

  return NextResponse.json(vendors);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COUPLE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId } = await req.json();
  const couple = await getCouple(session.user.id);
  if (!couple) return NextResponse.json({ error: "Profile required" }, { status: 400 });

  const favorite = await prisma.favorite.upsert({
    where: { coupleProfileId_vendorId: { coupleProfileId: couple.id, vendorId } },
    update: {},
    create: { coupleProfileId: couple.id, vendorId },
  });

  return NextResponse.json(favorite, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COUPLE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId } = await req.json();
  const couple = await getCouple(session.user.id);
  if (!couple) return NextResponse.json({ error: "Profile required" }, { status: 400 });

  await prisma.favorite.deleteMany({
    where: { coupleProfileId: couple.id, vendorId },
  });

  return NextResponse.json({ ok: true });
}
