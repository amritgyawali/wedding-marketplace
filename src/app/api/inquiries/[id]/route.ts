import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UpdateInquiryStatusSchema } from "@/schemas/inquiry";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { vendor: { select: { userId: true } } },
  });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (inquiry.vendor.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateInquiryStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.inquiry.update({
    where: { id },
    data: {
      status: parsed.data.status,
      firstRepliedAt:
        parsed.data.status === "REPLIED" && !inquiry.firstRepliedAt
          ? new Date()
          : undefined,
    },
  });

  return NextResponse.json(updated);
}
