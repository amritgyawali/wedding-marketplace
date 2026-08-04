import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { CreateGuestSchema } from "@/schemas/planning";

export async function GET() {
  const session = await requireRole("COUPLE");
  const couple = await prisma.coupleProfile.findUnique({ where: { userId: session.user.id } });
  if (!couple) return NextResponse.json([]);

  const guests = await prisma.guest.findMany({
    where: { coupleProfileId: couple.id },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return NextResponse.json(guests);
}

export async function POST(req: NextRequest) {
  const session = await requireRole("COUPLE");
  const body = await req.json();
  const parsed = CreateGuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const couple = await prisma.coupleProfile.findUnique({ where: { userId: session.user.id } });
  if (!couple) return NextResponse.json({ error: "Profile required" }, { status: 400 });

  const guest = await prisma.guest.create({
    data: { coupleProfileId: couple.id, ...parsed.data },
  });

  return NextResponse.json(guest, { status: 201 });
}
