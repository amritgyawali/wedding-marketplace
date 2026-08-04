import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [
    totalVendors,
    pendingVendors,
    totalCouples,
    pendingReviews,
    totalInquiries,
    activeSubscriptions,
  ] = await Promise.all([
    prisma.vendorProfile.count(),
    prisma.vendorProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.coupleProfile.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.inquiry.count(),
    prisma.subscription.count({ where: { status: "ACTIVE", tier: { not: "FREE" } } }),
  ]);

  const stats = [
    { label: "Total Vendors", value: totalVendors, href: "/dashboard/admin/vendors", alert: pendingVendors > 0 ? `${pendingVendors} pending` : null },
    { label: "Total Couples", value: totalCouples, href: null },
    { label: "Pending Reviews", value: pendingReviews, href: "/dashboard/admin/reviews", alert: pendingReviews > 0 ? "Needs attention" : null },
    { label: "Total Inquiries", value: totalInquiries, href: null },
    { label: "Active Subscriptions", value: activeSubscriptions, href: null },
  ];

  const recentAuditLogs = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true } } },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const content = (
            <Card className={stat.alert ? "border-orange-300" : ""}>
              <CardContent className="pt-5">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                {stat.alert && <p className="text-xs text-orange-600 mt-1">{stat.alert}</p>}
              </CardContent>
            </Card>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>{content}</Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Admin Actions</h2>
        <Card>
          <CardContent className="p-0">
            {recentAuditLogs.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No actions yet.</p>
            ) : (
              <div className="divide-y">
                {recentAuditLogs.map((log) => (
                  <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.targetType} #{log.targetId.slice(-6)} • by {log.admin.name}</p>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
