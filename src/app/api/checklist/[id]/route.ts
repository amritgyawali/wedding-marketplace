import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { UpdateChecklistTaskSchema } from "@/schemas/planning";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("COUPLE");
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateChecklistTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await prisma.checklistTask.findUnique({
    where: { id },
    include: {
      checklist: { include: { couple: { select: { userId: true } } } },
    },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (task.checklist.couple.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.checklistTask.update({
    where: { id },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("COUPLE");
  const { id } = await params;

  const task = await prisma.checklistTask.findUnique({
    where: { id },
    include: {
      checklist: { include: { couple: { select: { userId: true } } } },
    },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (task.checklist.couple.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (task.isDefault) {
    return NextResponse.json({ error: "Cannot delete default tasks" }, { status: 400 });
  }

  await prisma.checklistTask.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
