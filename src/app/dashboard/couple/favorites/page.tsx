import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { VendorCard } from "@/components/vendor/vendor-card";

export const metadata = { title: "Saved Vendors" };

export default async function FavoritesPage() {
  const session = await requireRole("COUPLE");

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      favorites: {
        include: {
          couple: false,
        },
      },
    },
  });

  const vendorIds = couple?.favorites.map((f) => f.vendorId) ?? [];
  const vendors = await prisma.vendorProfile.findMany({
    where: { id: { in: vendorIds } },
    include: {
      category: { select: { name: true, slug: true } },
      media: { where: { isCover: true }, take: 1 },
      subscription: { select: { tier: true } },
    },
  });

  const vendorResults = vendors.map((v) => ({
    id: v.id,
    businessName: v.businessName,
    slug: v.slug,
    tagline: v.tagline,
    city: v.city,
    country: v.country,
    priceTier: v.priceTier,
    priceFrom: v.priceFrom,
    avgRating: v.avgRating,
    reviewCount: v.reviewCount,
    isFeatured: v.isFeatured,
    coverImage: v.media[0]?.url ?? null,
    categorySlug: v.category.slug,
    categoryName: v.category.name,
    tier: v.subscription?.tier ?? "FREE" as const,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Vendors</h1>

      {vendorResults.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No saved vendors yet.</p>
          <a href="/vendors/photographers" className="text-pink-600 hover:underline mt-2 inline-block">
            Browse vendors →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendorResults.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} isFavorite={true} />
          ))}
        </div>
      )}
    </div>
  );
}
