"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const PLANS = [
  {
    tier: "FREE",
    name: "Free",
    price: 0,
    features: ["5 photos", "10 leads/month", "Basic listing"],
  },
  {
    tier: "PRO",
    name: "Pro",
    price: 49,
    features: ["30 photos", "50 leads/month", "Analytics access", "Verified badge", "10 real weddings"],
  },
  {
    tier: "PREMIUM",
    name: "Premium",
    price: 149,
    features: ["100 photos", "Unlimited leads", "Analytics access", "Priority support", "Featured in search", "50 real weddings"],
  },
];

export default function SubscriptionPage() {
  const [currentTier, setCurrentTier] = useState("FREE");
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("success")) setSuccess(true);
    }
  }, []);

  const checkout = async (tier: string) => {
    setLoading(tier);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription</h1>
      <p className="text-gray-500 mb-6">Choose the right plan to grow your wedding business.</p>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">
          Payment successful! Your subscription has been activated.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const isPopular = plan.tier === "PRO";
          return (
            <Card key={plan.tier} className={`relative ${isPopular ? "border-pink-500 border-2" : ""}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-pink-600 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isCurrent && <Badge variant="success">Current</Badge>}
                </CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && plan.tier !== "FREE" && (
                  <Button
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => checkout(plan.tier)}
                    disabled={loading === plan.tier}
                  >
                    {loading === plan.tier ? "Loading..." : `Upgrade to ${plan.name}`}
                  </Button>
                )}
                {isCurrent && <p className="text-center text-sm text-gray-400">Your current plan</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Featured Listing Boost</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Get featured at the top of search results for 30 days — $99 one-time payment.</p>
          <Button variant="outline" onClick={() => checkout("FEATURED_BOOST")} disabled={loading === "FEATURED_BOOST"}>
            {loading === "FEATURED_BOOST" ? "Loading..." : "Boost for $99"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
