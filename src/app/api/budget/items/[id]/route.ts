import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { CreateBudgetItemSchema, UpdateBudgetItemSchema } from "@/schemas/planning";

export async function POST(req: NextRequest) {
  const session = await requireRole("COUPLE");
  const body = await req.json();
  const parsed = CreateBudgetItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const couple = await prisma.coupleProfile.findUnique({ where: { userId: session.user.id } });
  const category = await prisma.budgetCategory.findFirst({
    where: { id: parsed.data.budgetCategoryId, coupleProfileId: couple?.id },
  });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const item = await prisma.budgetItem.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("COUPLE");
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateBudgetItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const couple = await prisma.coupleProfile.findUnique({ where: { userId: session.user.id } });
  const item = await prisma.budgetItem.findFirst({
    where: { id },
    include: { category: { select: { coupleProfileId: true } } },
  });
  if (!item || item.category.coupleProfileId !== couple?.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.budgetItem.update({
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

  const couple = await prisma.coupleProfile.findUnique({ where: { userId: session.user.id } });
  const item = await prisma.budgetItem.findFirst({
    where: { id },
    include: { category: { select: { coupleProfileId: true } } },
  });
  if (!item || item.category.coupleProfileId !== couple?.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.budgetItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
