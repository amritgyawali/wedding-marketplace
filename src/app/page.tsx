import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

const CATEGORIES = [
  { name: "Photographers", slug: "photographers", emoji: "📷", count: null },
  { name: "Venues", slug: "venues", emoji: "🏛️", count: null },
  { name: "Caterers", slug: "caterers", emoji: "🍽️", count: null },
  { name: "Florists", slug: "florists", emoji: "💐", count: null },
  { name: "Musicians", slug: "musicians", emoji: "🎵", count: null },
  { name: "Planners", slug: "planners", emoji: "📋", count: null },
  { name: "Hair & Makeup", slug: "beauty", emoji: "💄", count: null },
  { name: "Officiants", slug: "officiants", emoji: "💍", count: null },
];

const CITIES = [
  { name: "Melbourne", country: "Australia", image: null },
  { name: "Sydney", country: "Australia", image: null },
  { name: "Kathmandu", country: "Nepal", image: null },
  { name: "Brisbane", country: "Australia", image: null },
];

async function getStats() {
  try {
    const [vendorCount, coupleCount] = await Promise.all([
      prisma.vendorProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.coupleProfile.count(),
    ]);
    return { vendorCount, coupleCount };
  } catch {
    return { vendorCount: 500, coupleCount: 2000 };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-pink-50 via-white to-rose-50 py-20 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Find Your Perfect{" "}
              <span className="text-pink-600">Wedding Vendors</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover and book trusted wedding professionals across Australia, Nepal and worldwide.
              Real reviews, transparent pricing, instant contact.
            </p>
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-4 max-w-2xl mx-auto">
              <SearchBar size="lg" />
            </div>
            <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-500">
              <span>{stats.vendorCount.toLocaleString()}+ verified vendors</span>
              <span>•</span>
              <span>{stats.coupleCount.toLocaleString()}+ happy couples</span>
              <span>•</span>
              <span>Free to use</span>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4 bg-white">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Browse by Category
            </h2>
            <p className="text-center text-gray-500 mb-10">Everything you need for your perfect day</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/vendors/${cat.slug}`}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all group"
                >
                  <span className="text-4xl">{cat.emoji}</span>
                  <span className="font-medium text-gray-800 group-hover:text-pink-700 text-center">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Popular Cities</h2>
            <p className="text-center text-gray-500 mb-10">Find vendors near you</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CITIES.map((city) => (
                <Link
                  key={city.name}
                  href={`/vendors/photographers/${city.name.toLowerCase()}`}
                  className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-pink-400 to-rose-600 flex flex-col items-center justify-center text-white hover:shadow-lg transition-shadow"
                >
                  <span className="text-xl font-bold">{city.name}</span>
                  <span className="text-sm opacity-80">{city.country}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA for vendors */}
        <section className="py-16 px-4 bg-pink-600">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Are you a wedding professional?</h2>
            <p className="text-pink-100 mb-8 text-lg">
              Join thousands of vendors growing their business on WedMarket.
              Start free, upgrade when you&apos;re ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=VENDOR">
                <Button variant="secondary" size="lg">
                  List your business — Free
                </Button>
              </Link>
              <Link href="/vendors">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-pink-700">
                  Browse vendors
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
