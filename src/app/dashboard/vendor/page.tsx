import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Eye, Inbox, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Vendor Dashboard" };

export default async function VendorDashboardPage() {
  const session = await requireRole("VENDOR");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      subscription: true,
      inquiries: { where: { status: "NEW" }, take: 5 },
      reviews: { where: { status: "APPROVED" }, take: 3, orderBy: { createdAt: "desc" } },
    },
  });

  if (!vendor) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Complete your profile to get started</h2>
        <Link href="/dashboard/vendor/profile" className="text-pink-600 hover:underline">
          Set up your profile →
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "Profile Views", value: vendor.profileViews, icon: Eye, color: "text-blue-600" },
    { label: "New Leads", value: vendor.inquiries.length, icon: Inbox, color: "text-pink-600" },
    { label: "Avg Rating", value: vendor.avgRating.toFixed(1), icon: Star, color: "text-yellow-600" },
    { label: "Reviews", value: vendor.reviewCount, icon: TrendingUp, color: "text-green-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {vendor.subscription?.tier ?? "FREE"} plan •{" "}
            <Badge variant={vendor.verificationStatus === "VERIFIED" ? "success" : "secondary"}>
              {vendor.verificationStatus}
            </Badge>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile completeness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={vendor.completenessScore} className="flex-1" />
            <span className="text-sm font-medium w-12">{vendor.completenessScore}%</span>
          </div>
          {vendor.completenessScore < 80 && (
            <p className="text-sm text-gray-500 mt-2">
              Complete your profile to attract more couples.{" "}
              <Link href="/dashboard/vendor/profile" className="text-pink-600 hover:underline">
                Update profile →
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent leads */}
      {vendor.inquiries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendor.inquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">New inquiry</p>
                    <p className="text-xs text-gray-500">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Link href="/dashboard/vendor/leads" className="text-xs text-pink-600 hover:underline">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
