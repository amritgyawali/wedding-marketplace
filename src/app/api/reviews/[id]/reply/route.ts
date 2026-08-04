import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { VendorReplySchema } from "@/schemas/review";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: { vendor: { select: { userId: true } } },
  });

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.vendor.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (review.vendorReply) {
    return NextResponse.json({ error: "Already replied" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = VendorReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { vendorReply: parsed.data.reply, repliedAt: new Date() },
  });

  return NextResponse.json(updated);
}
