import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CreateReviewSchema } from "@/schemas/review";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const vendorId = searchParams.get("vendorId");

  const reviews = await prisma.review.findMany({
    where: {
      ...(vendorId ? { vendorId } : {}),
      status: "APPROVED",
    },
    include: {
      user: { select: { name: true, image: true } },
      couple: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COUPLE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!couple) {
    return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });
  }

  const existing = await prisma.review.findFirst({
    where: { vendorId: parsed.data.vendorId, coupleProfileId: couple.id },
  });
  if (existing) {
    return NextResponse.json({ error: "You already reviewed this vendor" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      vendorId: parsed.data.vendorId,
      coupleProfileId: couple.id,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      weddingDate: parsed.data.weddingDate ? new Date(parsed.data.weddingDate) : undefined,
      status: "PENDING",
    },
  });

  return NextResponse.json(review, { status: 201 });
}
