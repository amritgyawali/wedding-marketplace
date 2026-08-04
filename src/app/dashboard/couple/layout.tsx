import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { LayoutDashboard, CheckSquare, DollarSign, Users, Heart, LogOut } from "lucide-react";

const NAV = [
  { href: "/dashboard/couple", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/couple/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/dashboard/couple/budget", label: "Budget", icon: DollarSign },
  { href: "/dashboard/couple/guests", label: "Guests", icon: Users },
  { href: "/dashboard/couple/favorites", label: "Favorites", icon: Heart },
];

export default async function CoupleLayout({ children }: { children: React.ReactNode }) {
  await requireRole("COUPLE");

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-56 bg-pink-900 text-pink-100">
        <div className="p-5 border-b border-pink-800">
          <Link href="/" className="text-white font-bold text-lg">WedMarket</Link>
          <p className="text-xs text-pink-400 mt-1">Wedding Planner</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-pink-800 hover:text-white transition-colors text-sm"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-pink-800">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-pink-800 hover:text-white transition-colors text-sm">
            <LogOut className="h-4 w-4" /> Sign out
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
