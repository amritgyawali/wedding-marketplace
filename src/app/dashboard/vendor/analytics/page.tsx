import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Inbox, Star, MessageCircle } from "lucide-react";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const session = await requireRole("VENDOR");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      subscription: true,
      inquiries: { select: { id: true, status: true, createdAt: true } },
      reviews: { where: { status: "APPROVED" }, select: { rating: true, createdAt: true } },
    },
  });

  if (!vendor) {
    return <div className="p-8 text-center text-gray-500">Complete your vendor profile first.</div>;
  }

  const tier = vendor.subscription?.tier ?? "FREE";
  const hasAnalytics = tier === "PRO" || tier === "PREMIUM";

  if (!hasAnalytics) {
    return (
      <div className="p-8 text-center">
        <Badge variant="secondary" className="mb-4">PRO Feature</Badge>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Unlock Analytics</h2>
        <p className="text-gray-600 mb-6">Upgrade to PRO or PREMIUM to access detailed analytics.</p>
        <a href="/dashboard/vendor/subscription" className="text-pink-600 hover:underline">
          Upgrade now →
        </a>
      </div>
    );
  }

  const bookingRate = vendor.inquiries.length > 0
    ? Math.round((vendor.inquiries.filter((i) => i.status === "BOOKED").length / vendor.inquiries.length) * 100)
    : 0;

  const avgRating = vendor.reviews.length > 0
    ? vendor.reviews.reduce((sum, r) => sum + r.rating, 0) / vendor.reviews.length
    : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Profile Views</p>
                <p className="text-2xl font-bold mt-1">{vendor.profileViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold mt-1">{vendor.inquiryCount}</p>
              </div>
              <Inbox className="h-8 w-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Booking Rate</p>
                <p className="text-2xl font-bold mt-1">{bookingRate}%</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-2xl font-bold mt-1">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Inquiries</CardTitle></CardHeader>
        <CardContent>
          {vendor.inquiries.length === 0 ? (
            <p className="text-gray-500 text-sm">No inquiries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendor.inquiries.slice(0, 10).map((inq) => (
                    <tr key={inq.id} className="border-b last:border-0">
                      <td className="py-2">{new Date(inq.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        <Badge variant="secondary" className="text-xs">{inq.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
