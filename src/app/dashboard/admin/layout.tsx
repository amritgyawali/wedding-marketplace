import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { LayoutDashboard, Star, Store, Users, LogOut } from "lucide-react";

const NAV = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/admin/vendors", label: "Vendors", icon: Store },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 text-slate-300">
        <div className="p-5 border-b border-slate-800">
          <Link href="/" className="text-white font-bold text-lg">WedMarket</Link>
          <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm">
            <LogOut className="h-4 w-4" /> Sign out
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
