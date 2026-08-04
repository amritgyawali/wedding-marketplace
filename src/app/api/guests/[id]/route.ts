import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { UpdateGuestRsvpSchema, CreateGuestSchema } from "@/schemas/planning";

async function getGuestAndVerify(id: string, userId: string) {
  const couple = await prisma.coupleProfile.findUnique({ where: { userId } });
  const guest = await prisma.guest.findFirst({
    where: { id, coupleProfileId: couple?.id },
  });
  return { couple, guest };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("COUPLE");
  const { id } = await params;
  const { guest } = await getGuestAndVerify(id, session.user.id);
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = CreateGuestSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.guest.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("COUPLE");
  const { id } = await params;
  const { guest } = await getGuestAndVerify(id, session.user.id);
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.guest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
