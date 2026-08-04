import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const DEFAULT_TASKS = [
  { title: "Set your wedding date", category: "Planning", sortOrder: 1 },
  { title: "Create a wedding budget", category: "Budget", sortOrder: 2 },
  { title: "Book your wedding venue", category: "Venue", sortOrder: 3 },
  { title: "Hire a wedding photographer", category: "Photography", sortOrder: 4 },
  { title: "Choose your wedding party", category: "Planning", sortOrder: 5 },
  { title: "Send save-the-dates", category: "Invitations", sortOrder: 6 },
  { title: "Book catering", category: "Catering", sortOrder: 7 },
  { title: "Book entertainment/DJ/band", category: "Entertainment", sortOrder: 8 },
  { title: "Order wedding cake", category: "Catering", sortOrder: 9 },
  { title: "Book florist", category: "Flowers", sortOrder: 10 },
  { title: "Choose wedding dress/attire", category: "Attire", sortOrder: 11 },
  { title: "Book hair and makeup", category: "Beauty", sortOrder: 12 },
  { title: "Plan honeymoon", category: "Travel", sortOrder: 13 },
  { title: "Order wedding invitations", category: "Invitations", sortOrder: 14 },
  { title: "Create wedding registry", category: "Planning", sortOrder: 15 },
  { title: "Book officiant", category: "Ceremony", sortOrder: 16 },
  { title: "Arrange wedding transport", category: "Transport", sortOrder: 17 },
  { title: "Plan ceremony music", category: "Entertainment", sortOrder: 18 },
  { title: "Write vows", category: "Ceremony", sortOrder: 19 },
  { title: "Arrange accommodation for guests", category: "Accommodation", sortOrder: 20 },
  { title: "Final dress fitting", category: "Attire", sortOrder: 21 },
  { title: "Create seating chart", category: "Planning", sortOrder: 22 },
  { title: "Confirm all vendors", category: "Planning", sortOrder: 23 },
  { title: "Pick up wedding rings", category: "Jewelry", sortOrder: 24 },
  { title: "Write thank you notes", category: "Post-Wedding", sortOrder: 25 },
  { title: "Submit marriage certificate", category: "Legal", sortOrder: 26 },
  { title: "Change name (if applicable)", category: "Legal", sortOrder: 27 },
  { title: "Book rehearsal dinner", category: "Planning", sortOrder: 28 },
  { title: "Plan wedding day timeline", category: "Planning", sortOrder: 29 },
  { title: "Pack for honeymoon", category: "Travel", sortOrder: 30 },
];

const DEFAULT_BUDGET_CATEGORIES = [
  { name: "Venue", color: "#ec4899" },
  { name: "Catering & Bar", color: "#f97316" },
  { name: "Photography", color: "#8b5cf6" },
  { name: "Flowers & Décor", color: "#10b981" },
  { name: "Music & Entertainment", color: "#3b82f6" },
  { name: "Wedding Dress & Attire", color: "#f59e0b" },
  { name: "Hair & Makeup", color: "#ef4444" },
  { name: "Wedding Cake", color: "#06b6d4" },
  { name: "Invitations & Stationery", color: "#84cc16" },
  { name: "Transport", color: "#6366f1" },
  { name: "Rings & Jewelry", color: "#e11d48" },
  { name: "Honeymoon", color: "#0ea5e9" },
];

export async function POST(req: NextRequest) {
  const session = await requireRole("COUPLE");
  const body = await req.json();

  const couple = await prisma.coupleProfile.upsert({
    where: { userId: session.user.id },
    update: {
      partnerName: body.partnerName,
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
      weddingCity: body.weddingCity,
      weddingCountry: body.weddingCountry,
      guestCount: body.guestCount,
      totalBudget: body.totalBudget,
    },
    create: {
      userId: session.user.id,
      partnerName: body.partnerName,
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
      weddingCity: body.weddingCity,
      weddingCountry: body.weddingCountry,
      guestCount: body.guestCount,
      totalBudget: body.totalBudget,
    },
  });

  const existingChecklist = await prisma.weddingChecklist.findUnique({
    where: { coupleProfileId: couple.id },
  });

  if (!existingChecklist) {
    await prisma.weddingChecklist.create({
      data: {
        coupleProfileId: couple.id,
        tasks: {
          create: DEFAULT_TASKS.map((t) => ({ ...t, isDefault: true })),
        },
      },
    });

    await prisma.budgetCategory.createMany({
      data: DEFAULT_BUDGET_CATEGORIES.map((c, i) => ({
        coupleProfileId: couple.id,
        name: c.name,
        color: c.color,
        sortOrder: i,
      })),
    });
  }

  return NextResponse.json({ couple });
}
