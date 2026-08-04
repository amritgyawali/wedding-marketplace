import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { CreateBudgetCategorySchema } from "@/schemas/planning";

export async function GET() {
  const session = await requireRole("COUPLE");
  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      budgets: {
        include: { items: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(couple?.budgets ?? []);
}

export async function POST(req: NextRequest) {
  const session = await requireRole("COUPLE");
  const body = await req.json();
  const parsed = CreateBudgetCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!couple) return NextResponse.json({ error: "Profile required" }, { status: 400 });

  const count = await prisma.budgetCategory.count({
    where: { coupleProfileId: couple.id },
  });

  const category = await prisma.budgetCategory.create({
    data: { coupleProfileId: couple.id, ...parsed.data, sortOrder: count },
  });

  return NextResponse.json(category, { status: 201 });
}
