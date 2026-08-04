import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { LayoutDashboard, User, Inbox, BarChart3, CreditCard, LogOut } from "lucide-react";

const NAV = [
  { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/vendor/profile", label: "Profile", icon: User },
  { href: "/dashboard/vendor/leads", label: "Leads", icon: Inbox },
  { href: "/dashboard/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/vendor/subscription", label: "Subscription", icon: CreditCard },
];

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  await requireRole("VENDOR");

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-56 bg-gray-900 text-gray-300">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="text-white font-bold text-lg">WedMarket</Link>
          <p className="text-xs text-gray-500 mt-1">Vendor Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors text-sm"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors text-sm">
            <LogOut className="h-4 w-4" /> Sign out
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
