"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, X, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const CATEGORIES = [
  { name: "Photographers", slug: "photographers" },
  { name: "Venues", slug: "venues" },
  { name: "Caterers", slug: "caterers" },
  { name: "Florists", slug: "florists" },
  { name: "Musicians", slug: "musicians" },
];

export function Navbar() {
  const { user, isAuthenticated, isLoading, isVendor, isCouple, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboardHref = isVendor
    ? "/dashboard/vendor"
    : isCouple
    ? "/dashboard/couple"
    : isAdmin
    ? "/dashboard/admin"
    : "/";

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 fill-pink-500 text-pink-500" />
              <span className="text-xl font-bold text-pink-600">WedMarket</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/vendors/${c.slug}`}
                  className="text-sm text-gray-600 hover:text-pink-600 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
              <Link href="/real-weddings" className="text-sm text-gray-600 hover:text-pink-600 transition-colors">
                Real Weddings
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoading ? null : isAuthenticated ? (
              <>
                <Link href={dashboardHref}>
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user?.image ?? ""} />
                  <AvatarFallback>{getInitials(user?.name ?? "U")}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link href="/register"><Button size="sm">Get started</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/vendors/${c.slug}`} className="block py-2 text-gray-700" onClick={() => setOpen(false)}>
              {c.name}
            </Link>
          ))}
          <Link href="/real-weddings" className="block py-2 text-gray-700" onClick={() => setOpen(false)}>Real Weddings</Link>
          <hr className="my-2" />
          {isAuthenticated ? (
            <>
              <Link href={dashboardHref} className="block py-2 text-gray-700" onClick={() => setOpen(false)}>Dashboard</Link>
              <button className="block py-2 text-gray-700 w-full text-left" onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-gray-700" onClick={() => setOpen(false)}>Log in</Link>
              <Link href="/register" className="block py-2 text-pink-600 font-medium" onClick={() => setOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
