import Link from "next/link";
import { Heart } from "lucide-react";

const VENDOR_CATEGORIES = [
  { name: "Photographers", slug: "photographers" },
  { name: "Wedding Venues", slug: "venues" },
  { name: "Caterers", slug: "caterers" },
  { name: "Florists", slug: "florists" },
  { name: "Musicians & DJs", slug: "musicians" },
  { name: "Wedding Planners", slug: "planners" },
];

const CITIES = [
  { name: "Melbourne", slug: "melbourne" },
  { name: "Sydney", slug: "sydney" },
  { name: "Brisbane", slug: "brisbane" },
  { name: "Kathmandu", slug: "kathmandu" },
  { name: "Perth", slug: "perth" },
  { name: "Adelaide", slug: "adelaide" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
              <span className="text-white font-bold text-lg">WedMarket</span>
            </Link>
            <p className="text-sm text-gray-400">
              Find and book the best wedding vendors in Australia and Nepal.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">For Couples</h3>
            <ul className="space-y-2 text-sm">
              {VENDOR_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/vendors/${c.slug}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Popular Cities</h3>
            <ul className="space-y-2 text-sm">
              {CITIES.map((city) => (
                <li key={city.slug}>
                  <Link href={`/vendors/photographers/${city.slug}`} className="hover:text-white transition-colors">
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/vendors/register" className="hover:text-white transition-colors">List your business</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} WedMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
