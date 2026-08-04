import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SearchFilters } from "@/components/search/search-filters";
import { VendorCard } from "@/components/vendor/vendor-card";
import { VendorCardSkeleton } from "@/components/vendor/vendor-card-skeleton";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/structured-data";
import { searchService } from "@/lib/search/service";
import { slugToTitle } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const title = slugToTitle(category);
  return {
    title: `Wedding ${title} — Find & Book Online`,
    description: `Browse verified wedding ${title.toLowerCase()} with real reviews and transparent pricing.`,
  };
}

async function VendorGrid({ category, searchParams }: { category: string; searchParams: Record<string, string | string[] | undefined> }) {
  const priceTier = Array.isArray(searchParams.priceTier)
    ? searchParams.priceTier
    : searchParams.priceTier
    ? [searchParams.priceTier]
    : [];

  const results = await searchService.search({
    category,
    city: typeof searchParams.city === "string" ? searchParams.city : undefined,
    priceTier: priceTier as never[],
    minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined,
    sort: (searchParams.sort as never) ?? "featured",
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 12,
  });

  if (results.results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No vendors found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{results.total} vendors found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.results.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
      {results.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: results.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}`}
              className={`px-3 py-1.5 rounded text-sm ${
                p === results.page
                  ? "bg-pink-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;
  const title = slugToTitle(category);

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: process.env.NEXT_PUBLIC_APP_URL! },
    { name: "Vendors", url: `${process.env.NEXT_PUBLIC_APP_URL}/vendors` },
    { name: title, url: `${process.env.NEXT_PUBLIC_APP_URL}/vendors/${category}` },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbs} />
      <Navbar />
      <main className="flex-1">
        <div className="bg-pink-50 py-10 px-4">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-gray-900">Wedding {title}</h1>
            <p className="mt-2 text-gray-600">
              Find the best wedding {title.toLowerCase()} with verified reviews and competitive pricing
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>
                <Suspense>
                  <SearchFilters />
                </Suspense>
              </div>
            </aside>
            <div className="flex-1">
              <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <VendorCardSkeleton key={i} />)}
                </div>
              }>
                <VendorGrid category={category} searchParams={sp} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
