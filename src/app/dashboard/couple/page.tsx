import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { CheckSquare, DollarSign, Users, Heart } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Wedding Dashboard" };

export default async function CoupleDashboardPage() {
  const session = await requireRole("COUPLE");

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      checklist: { include: { tasks: true } },
      budgets: { include: { items: true } },
      guests: true,
      favorites: true,
    },
  });

  if (!couple) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Welcome! Let&apos;s set up your wedding planner.</h2>
        <p className="text-gray-500 mb-4">Tell us about your wedding so we can personalize your experience.</p>
        <Link href="/dashboard/couple/checklist" className="text-pink-600 hover:underline">
          Get started →
        </Link>
      </div>
    );
  }

  const completedTasks = couple.checklist?.tasks.filter((t) => t.isCompleted).length ?? 0;
  const totalTasks = couple.checklist?.tasks.length ?? 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalBudget = couple.totalBudget ?? 0;
  const spentBudget = couple.budgets.reduce(
    (sum, cat) => sum + cat.items.reduce((s, item) => s + (item.actualCost ?? 0), 0),
    0
  );

  const confirmedGuests = couple.guests.filter((g) => g.rsvpStatus === "ATTENDING").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {couple.weddingDate
            ? `${Math.ceil((new Date(couple.weddingDate).getTime() - Date.now()) / 86400000)} days to go!`
            : "Your Wedding Dashboard"}
        </h1>
        {couple.weddingDate && (
          <p className="text-gray-500 mt-1">{formatDate(couple.weddingDate)} • {couple.weddingCity ?? ""}</p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-pink-400" />
              <div>
                <p className="text-xs text-gray-500">Tasks Done</p>
                <p className="text-xl font-bold">{completedTasks}/{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-xs text-gray-500">Budget Used</p>
                <p className="text-xl font-bold">{formatPrice(spentBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-xs text-gray-500">Guests Confirmed</p>
                <p className="text-xl font-bold">{confirmedGuests}/{couple.guests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-xs text-gray-500">Saved Vendors</p>
                <p className="text-xl font-bold">{couple.favorites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Checklist Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-3">
              <Progress value={taskProgress} className="flex-1" />
              <span className="text-sm font-medium">{taskProgress}%</span>
            </div>
            {couple.checklist?.tasks
              .filter((t) => !t.isCompleted)
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="flex items-center gap-2 py-1.5 text-sm text-gray-700">
                  <div className="h-4 w-4 rounded border border-gray-300" />
                  {task.title}
                  {task.dueDate && (
                    <span className="ml-auto text-xs text-gray-400">{formatDate(task.dueDate)}</span>
                  )}
                </div>
              ))}
            <Link href="/dashboard/couple/checklist" className="text-xs text-pink-600 hover:underline mt-2 block">
              View all tasks →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Budget Overview</CardTitle></CardHeader>
          <CardContent>
            {totalBudget > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Spent</span>
                  <span className="font-medium">{formatPrice(spentBudget)} / {formatPrice(totalBudget)}</span>
                </div>
                <Progress value={(spentBudget / totalBudget) * 100} />
              </div>
            )}
            {couple.budgets.slice(0, 4).map((cat) => {
              const spent = cat.items.reduce((s, i) => s + (i.actualCost ?? 0), 0);
              return (
                <div key={cat.id} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-700">{cat.name}</span>
                  <span className="font-medium">{formatPrice(spent)}</span>
                </div>
              );
            })}
            <Link href="/dashboard/couple/budget" className="text-xs text-pink-600 hover:underline mt-2 block">
              View full budget →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
