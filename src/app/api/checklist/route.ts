import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { CreateChecklistTaskSchema } from "@/schemas/planning";

export async function GET() {
  const session = await requireRole("COUPLE");
  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      checklist: {
        include: { tasks: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
      },
    },
  });
  return NextResponse.json(couple?.checklist ?? null);
}

export async function POST(req: NextRequest) {
  const session = await requireRole("COUPLE");
  const body = await req.json();
  const parsed = CreateChecklistTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: session.user.id },
    include: { checklist: true },
  });
  if (!couple) return NextResponse.json({ error: "Profile required" }, { status: 400 });

  let checklist = couple.checklist;
  if (!checklist) {
    checklist = await prisma.weddingChecklist.create({
      data: { coupleProfileId: couple.id },
    });
  }

  const task = await prisma.checklistTask.create({
    data: { checklistId: checklist.id, ...parsed.data, isDefault: false },
  });

  return NextResponse.json(task, { status: 201 });
}
