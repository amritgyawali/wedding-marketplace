import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { VendorCard } from "@/components/vendor/vendor-card";
import { JsonLd, buildBreadcrumbSchema, buildItemListSchema } from "@/components/seo/structured-data";
import { searchService } from "@/lib/search/service";
import { slugToTitle } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string; city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, city } = await params;
  const catTitle = slugToTitle(category);
  const cityTitle = slugToTitle(city);
  return {
    title: `Wedding ${catTitle} in ${cityTitle} — Find & Book`,
    description: `Browse the best wedding ${catTitle.toLowerCase()} in ${cityTitle}. Compare packages, read reviews, and contact vendors directly.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/vendors/${category}/${city}`,
    },
  };
}

export default async function CityCategoryPage({ params }: Props) {
  const { category, city } = await params;
  const catTitle = slugToTitle(category);
  const cityTitle = slugToTitle(city);

  const results = await searchService.search({
    category,
    city: cityTitle,
    sort: "featured",
    limit: 24,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: appUrl },
    { name: catTitle, url: `${appUrl}/vendors/${category}` },
    { name: cityTitle, url: `${appUrl}/vendors/${category}/${city}` },
  ]);

  const itemList = buildItemListSchema(
    results.results.map((v, i) => ({
      name: v.businessName,
      url: `${appUrl}/vendors/${v.categorySlug}/${v.slug}`,
      position: i + 1,
    }))
  );

  return (
    <>
      <JsonLd schema={breadcrumbs} />
      <JsonLd schema={itemList} />
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 py-12 px-4">
          <div className="mx-auto max-w-7xl">
            <nav className="text-sm text-gray-500 mb-4">
              <a href={`/vendors/${category}`} className="hover:text-pink-600">{catTitle}</a>
              {" › "}
              <span className="text-gray-900">{cityTitle}</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900">
              Wedding {catTitle} in {cityTitle}
            </h1>
            <p className="mt-2 text-gray-600">
              {results.total} verified wedding {catTitle.toLowerCase()} serving {cityTitle}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10">
          {results.results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No {catTitle.toLowerCase()} found in {cityTitle} yet.
              </p>
              <a href={`/vendors/${category}`} className="mt-4 inline-block text-pink-600 hover:underline">
                View all {catTitle.toLowerCase()}
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.results.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-pink-50 py-10 px-4">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Browse {catTitle} in other cities
            </h2>
            <div className="flex flex-wrap gap-2">
              {["Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide", "Kathmandu", "Pokhara"].map((c) => (
                <a
                  key={c}
                  href={`/vendors/${category}/${c.toLowerCase()}`}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-pink-300 hover:text-pink-700 transition-colors"
                >
                  {c}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
