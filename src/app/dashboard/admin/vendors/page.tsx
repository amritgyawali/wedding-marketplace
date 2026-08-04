import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminVendorActions from "./actions";

export const metadata = { title: "Manage Vendors" };

export default async function AdminVendorsPage() {
  await requireRole("ADMIN");

  const vendors = await prisma.vendorProfile.findMany({
    include: {
      category: { select: { name: true } },
      subscription: { select: { tier: true } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const STATUS_COLOR: Record<string, string> = {
    PENDING: "warning",
    VERIFIED: "success",
    REJECTED: "destructive",
    SUSPENDED: "outline",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Vendors ({vendors.length})</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{vendor.businessName}</p>
                      <p className="text-xs text-gray-400">{vendor.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{vendor.category.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{vendor.subscription?.tier ?? "FREE"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_COLOR[vendor.verificationStatus] as never}>
                        {vendor.verificationStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <AdminVendorActions
                        vendorId={vendor.id}
                        currentStatus={vendor.verificationStatus}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
