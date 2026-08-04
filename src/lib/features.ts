import { SubscriptionTier } from "@prisma/client";

interface TierFeatures {
  maxMedia: number;
  maxLeadsPerMonth: number;
  featuredInSearch: boolean;
  analyticsAccess: boolean;
  prioritySupport: boolean;
  realWeddingsAllowed: number;
  verifiedBadge: boolean;
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  FREE: {
    maxMedia: 5,
    maxLeadsPerMonth: 10,
    featuredInSearch: false,
    analyticsAccess: false,
    prioritySupport: false,
    realWeddingsAllowed: 1,
    verifiedBadge: false,
  },
  PRO: {
    maxMedia: 30,
    maxLeadsPerMonth: 50,
    featuredInSearch: false,
    analyticsAccess: true,
    prioritySupport: false,
    realWeddingsAllowed: 10,
    verifiedBadge: true,
  },
  PREMIUM: {
    maxMedia: 100,
    maxLeadsPerMonth: 999,
    featuredInSearch: true,
    analyticsAccess: true,
    prioritySupport: true,
    realWeddingsAllowed: 50,
    verifiedBadge: true,
  },
};

export function canUseFeature(
  tier: SubscriptionTier,
  feature: keyof TierFeatures
): boolean {
  const features = TIER_FEATURES[tier];
  const value = features[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return false;
}

export function getLeadQuota(tier: SubscriptionTier): number {
  return TIER_FEATURES[tier].maxLeadsPerMonth;
}

export function getMediaLimit(tier: SubscriptionTier): number {
  return TIER_FEATURES[tier].maxMedia;
}

export const PLAN_PRICES = {
  PRO: { monthly: 49, priceId: process.env.STRIPE_PRO_PRICE_ID },
  PREMIUM: { monthly: 149, priceId: process.env.STRIPE_PREMIUM_PRICE_ID },
};

export const FEATURED_BOOST_PRICE = {
  amount: 99,
  days: 30,
  priceId: process.env.STRIPE_FEATURED_BOOST_PRICE_ID,
};
