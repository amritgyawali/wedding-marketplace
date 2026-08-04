import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CreateInquirySchema } from "@/schemas/inquiry";
import { sendEmail, newInquiryEmail } from "@/lib/resend";
import { getLeadQuota } from "@/lib/features";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const role = session.user.role;

  if (role === "COUPLE") {
    const couple = await prisma.coupleProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!couple) return NextResponse.json([]);

    const inquiries = await prisma.inquiry.findMany({
      where: { coupleProfileId: couple.id },
      include: {
        vendor: { select: { id: true, businessName: true, slug: true } },
        conversations: { orderBy: { lastMessageAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inquiries);
  }

  if (role === "VENDOR") {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!vendor) return NextResponse.json([]);

    const status = searchParams.get("status");
    const inquiries = await prisma.inquiry.findMany({
      where: { vendorId: vendor.id, ...(status ? { status: status as never } : {}) },
      include: {
        couple: {
          include: { user: { select: { name: true, email: true, image: true } } },
        },
        conversations: { orderBy: { lastMessageAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inquiries);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COUPLE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!couple) return NextResponse.json({ error: "Complete your couple profile first" }, { status: 400 });

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: parsed.data.vendorId },
    include: {
      subscription: true,
      user: { select: { email: true, name: true } },
    },
  });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthlyCount = await prisma.inquiry.count({
    where: { vendorId: vendor.id, createdAt: { gte: monthStart } },
  });

  const quota = getLeadQuota(vendor.subscription?.tier ?? "FREE");
  if (monthlyCount >= quota) {
    return NextResponse.json({ error: "Vendor has reached their monthly lead quota" }, { status: 429 });
  }

  const inquiry = await prisma.$transaction(async (tx) => {
    const inq = await tx.inquiry.create({
      data: {
        vendorId: vendor.id,
        coupleProfileId: couple.id,
        eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : undefined,
        guestCount: parsed.data.guestCount,
        budget: parsed.data.budget,
        message: parsed.data.message,
      },
    });

    const conv = await tx.conversation.create({
      data: { inquiryId: inq.id },
    });

    await tx.message.create({
      data: {
        conversationId: conv.id,
        senderId: session.user.id,
        body: parsed.data.message,
      },
    });

    await tx.vendorProfile.update({
      where: { id: vendor.id },
      data: { inquiryCount: { increment: 1 } },
    });

    return inq;
  });

  if (vendor.user.email) {
    await sendEmail({
      to: vendor.user.email,
      subject: `New inquiry from ${session.user.name ?? "a couple"}`,
      html: newInquiryEmail({
        vendorName: vendor.businessName,
        coupleName: session.user.name ?? "A couple",
        message: parsed.data.message,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/vendor/leads`,
      }),
    });
  }

  return NextResponse.json(inquiry, { status: 201 });
}
