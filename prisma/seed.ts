import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Photographers", slug: "photographers", icon: "📷", description: "Capture your special moments" },
  { name: "Wedding Venues", slug: "venues", icon: "🏛️", description: "Find the perfect setting" },
  { name: "Caterers", slug: "caterers", icon: "🍽️", description: "Exceptional food and service" },
  { name: "Florists", slug: "florists", icon: "💐", description: "Beautiful floral arrangements" },
  { name: "Musicians & DJs", slug: "musicians", icon: "🎵", description: "Set the perfect mood" },
  { name: "Wedding Planners", slug: "planners", icon: "📋", description: "Expert planning and coordination" },
  { name: "Hair & Makeup", slug: "beauty", icon: "💄", description: "Look and feel amazing" },
  { name: "Officiants", slug: "officiants", icon: "💍", description: "Meaningful ceremonies" },
];

function slug(name: string, id: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").slice(0, 40) + "-" + id.slice(-6);
}

async function main() {
  console.log("Seeding database...");

  // Categories
  const categories: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = c.id;
  }
  console.log("Categories created");

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@wedmarket.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@wedmarket.com",
      password: await bcrypt.hash("Admin123!", 12),
      role: "ADMIN",
    },
  });
  console.log("Admin created");

  // Couple users
  const couples = [];
  const coupleData = [
    { name: "Emma & James", email: "emma.james@example.com", city: "Melbourne", country: "AU", date: "2025-06-15", budget: 25000 },
    { name: "Sophie & Liam", email: "sophie.liam@example.com", city: "Sydney", country: "AU", date: "2025-09-20", budget: 35000 },
    { name: "Priya & Rohan", email: "priya.rohan@example.com", city: "Kathmandu", country: "NP", date: "2025-12-10", budget: 15000 },
    { name: "Mia & Noah", email: "mia.noah@example.com", city: "Brisbane", country: "AU", date: "2026-03-08", budget: 30000 },
    { name: "Aarav & Sneha", email: "aarav.sneha@example.com", city: "Kathmandu", country: "NP", date: "2025-11-14", budget: 12000 },
  ];

  for (const cp of coupleData) {
    const user = await prisma.user.upsert({
      where: { email: cp.email },
      update: {},
      create: {
        name: cp.name,
        email: cp.email,
        password: await bcrypt.hash("Couple123!", 12),
        role: "COUPLE",
      },
    });
    const profile = await prisma.coupleProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        weddingDate: new Date(cp.date),
        weddingCity: cp.city,
        weddingCountry: cp.country,
        guestCount: 100 + Math.floor(Math.random() * 100),
        totalBudget: cp.budget,
      },
    });
    couples.push({ user, profile });
  }
  console.log("Couples created");

  // Vendor data
  const vendorData = [
    // Melbourne photographers
    { name: "Melbourne Moments Photography", cat: "photographers", city: "Melbourne", country: "AU", priceTier: "LUXURY", priceFrom: 3500, rating: 4.8, reviews: 42, description: "Award-winning wedding photography capturing love stories across Melbourne.", verified: true },
    { name: "Golden Hour Studios", cat: "photographers", city: "Melbourne", country: "AU", priceTier: "MID_RANGE", priceFrom: 2200, rating: 4.6, reviews: 28, description: "Timeless and romantic wedding photography.", verified: true },
    { name: "Frame & Story Co.", cat: "photographers", city: "Melbourne", country: "AU", priceTier: "LUXURY", priceFrom: 4500, rating: 4.9, reviews: 65, description: "Premium wedding photography and videography.", verified: true, featured: true },
    // Melbourne venues
    { name: "The Grand Ballroom Melbourne", cat: "venues", city: "Melbourne", country: "AU", priceTier: "ULTRA_LUXURY", priceFrom: 15000, rating: 4.7, reviews: 30, description: "Elegant city venue with stunning views.", verified: true },
    { name: "Ripponlea Estate", cat: "venues", city: "Melbourne", country: "AU", priceTier: "LUXURY", priceFrom: 8000, rating: 4.8, reviews: 20, description: "Historic estate with beautiful gardens.", verified: true },
    // Melbourne caterers
    { name: "Epicure Melbourne", cat: "caterers", city: "Melbourne", country: "AU", priceTier: "LUXURY", priceFrom: 120, rating: 4.7, reviews: 35, description: "Fine dining catering for discerning couples.", verified: true },
    { name: "The Social Plate", cat: "caterers", city: "Melbourne", country: "AU", priceTier: "MID_RANGE", priceFrom: 75, rating: 4.5, reviews: 19, description: "Modern Australian cuisine for weddings.", verified: true },
    // Melbourne florists
    { name: "Bloom & Wild Melbourne", cat: "florists", city: "Melbourne", country: "AU", priceTier: "LUXURY", priceFrom: 2500, rating: 4.9, reviews: 47, description: "Luxurious floral designs that tell your story.", verified: true, featured: true },
    { name: "Petal and Stem", cat: "florists", city: "Melbourne", country: "AU", priceTier: "MID_RANGE", priceFrom: 1200, rating: 4.6, reviews: 22, description: "Beautiful, natural floral arrangements.", verified: true },
    // Sydney
    { name: "Sydney Lens Photography", cat: "photographers", city: "Sydney", country: "AU", priceTier: "LUXURY", priceFrom: 4000, rating: 4.8, reviews: 56, description: "Capturing Sydney weddings with elegance.", verified: true },
    { name: "Harbour View Weddings", cat: "venues", city: "Sydney", country: "AU", priceTier: "ULTRA_LUXURY", priceFrom: 20000, rating: 4.9, reviews: 18, description: "Iconic harbour views for your perfect wedding.", verified: true, featured: true },
    { name: "Sydney Blooms Floral Design", cat: "florists", city: "Sydney", country: "AU", priceTier: "MID_RANGE", priceFrom: 1500, rating: 4.5, reviews: 28, description: "Stunning floral creations for every style.", verified: true },
    // Kathmandu
    { name: "Himalayan Clicks Photography", cat: "photographers", city: "Kathmandu", country: "NP", priceTier: "MID_RANGE", priceFrom: 800, rating: 4.7, reviews: 34, description: "Capturing your love against Nepal's stunning landscapes.", verified: true, featured: true },
    { name: "Pashupatinath Wedding Photography", cat: "photographers", city: "Kathmandu", country: "NP", priceTier: "BUDGET", priceFrom: 400, rating: 4.4, reviews: 22, description: "Traditional and modern wedding photography.", verified: true },
    { name: "Yak & Yeti Grand Ballroom", cat: "venues", city: "Kathmandu", country: "NP", priceTier: "LUXURY", priceFrom: 3000, rating: 4.8, reviews: 15, description: "Kathmandu's premier wedding venue.", verified: true },
    { name: "Dwarika's Hotel Events", cat: "venues", city: "Kathmandu", country: "NP", priceTier: "LUXURY", priceFrom: 4000, rating: 4.9, reviews: 12, description: "Heritage luxury wedding venue.", verified: true, featured: true },
    { name: "Kathmandu Catering Services", cat: "caterers", city: "Kathmandu", country: "NP", priceTier: "MID_RANGE", priceFrom: 25, rating: 4.6, reviews: 28, description: "Traditional Nepali and international cuisine.", verified: true },
    { name: "Everest Florals", cat: "florists", city: "Kathmandu", country: "NP", priceTier: "BUDGET", priceFrom: 300, rating: 4.5, reviews: 18, description: "Beautiful marigold and exotic flower arrangements.", verified: true },
    { name: "Pokhara Wedding Photographers", cat: "photographers", city: "Pokhara", country: "NP", priceTier: "MID_RANGE", priceFrom: 600, rating: 4.6, reviews: 20, description: "Lake-side wedding photography specialists.", verified: true },
    { name: "Fishtail Lodge Events", cat: "venues", city: "Pokhara", country: "NP", priceTier: "LUXURY", priceFrom: 2500, rating: 4.8, reviews: 10, description: "Breathtaking lakeside wedding venue.", verified: true },
    // Music/planners
    { name: "Melbourne Wedding Orchestra", cat: "musicians", city: "Melbourne", country: "AU", priceTier: "LUXURY", priceFrom: 3000, rating: 4.8, reviews: 25, description: "Live orchestral music for unforgettable ceremonies.", verified: true },
    { name: "DJ Luxe Events", cat: "musicians", city: "Sydney", country: "AU", priceTier: "MID_RANGE", priceFrom: 1200, rating: 4.6, reviews: 38, description: "Premium DJ services for wedding receptions.", verified: true },
    { name: "Perfectly Wed Planning", cat: "planners", city: "Melbourne", country: "AU", priceTier: "LUXURY", priceFrom: 5000, rating: 4.9, reviews: 43, description: "Full-service wedding planning with flawless execution.", verified: true, featured: true },
    { name: "Beautiful Day Wedding Planning", cat: "planners", city: "Kathmandu", country: "NP", priceTier: "MID_RANGE", priceFrom: 1500, rating: 4.7, reviews: 20, description: "Expert wedding coordination in Nepal.", verified: true },
    // Beauty
    { name: "Blush Bridal Beauty", cat: "beauty", city: "Melbourne", country: "AU", priceTier: "MID_RANGE", priceFrom: 800, rating: 4.8, reviews: 62, description: "Bridal hair and makeup artistry.", verified: true, featured: true },
    { name: "Glow Bridal Studio", cat: "beauty", city: "Sydney", country: "AU", priceTier: "LUXURY", priceFrom: 1200, rating: 4.9, reviews: 45, description: "Award-winning bridal beauty team.", verified: true },
    { name: "Nepal Bridal Beauty", cat: "beauty", city: "Kathmandu", country: "NP", priceTier: "BUDGET", priceFrom: 200, rating: 4.5, reviews: 30, description: "Traditional and modern bridal beauty.", verified: true },
    // Officiants
    { name: "Rev. Sarah Williams - Civil Celebrant", cat: "officiants", city: "Melbourne", country: "AU", priceTier: "MID_RANGE", priceFrom: 600, rating: 4.9, reviews: 78, description: "Creating personalised, heartfelt ceremonies.", verified: true },
    { name: "Wedding Words Sydney", cat: "officiants", city: "Sydney", country: "AU", priceTier: "MID_RANGE", priceFrom: 700, rating: 4.8, reviews: 52, description: "Modern ceremonies for modern couples.", verified: true },
    { name: "Nepali Wedding Pundit Services", cat: "officiants", city: "Kathmandu", country: "NP", priceTier: "BUDGET", priceFrom: 150, rating: 4.7, reviews: 40, description: "Traditional Hindu wedding ceremonies.", verified: true },
  ];

  const vendorProfiles = [];
  for (const vd of vendorData) {
    const email = `${vd.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;
    const existing = await prisma.user.findUnique({ where: { email } });
    const user = existing ?? await prisma.user.create({
      data: {
        name: vd.name,
        email,
        password: await bcrypt.hash("Vendor123!", 12),
        role: "VENDOR",
      },
    });

    const existingVendor = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
    if (existingVendor) {
      vendorProfiles.push(existingVendor);
      continue;
    }

    const id = `v${Math.random().toString(36).slice(2, 14)}`;
    const vendorSlug = slug(vd.name, id);
    const categoryId = categories[vd.cat];

    const vendor = await prisma.vendorProfile.create({
      data: {
        id,
        userId: user.id,
        categoryId,
        businessName: vd.name,
        slug: vendorSlug,
        description: vd.description,
        city: vd.city,
        country: vd.country,
        priceTier: vd.priceTier as never,
        priceFrom: vd.priceFrom,
        avgRating: vd.rating,
        reviewCount: vd.reviews,
        isFeatured: (vd as { featured?: boolean }).featured ?? false,
        verificationStatus: vd.verified ? "VERIFIED" : "PENDING",
        completenessScore: 75,
        subscription: {
          create: {
            tier: (vd as { featured?: boolean }).featured ? "PREMIUM" : "PRO",
            status: "ACTIVE",
          },
        },
      },
    });
    vendorProfiles.push(vendor);
  }
  console.log(`${vendorProfiles.length} vendors created`);

  // Reviews
  const reviewTexts = [
    { title: "Absolutely incredible!", body: "We could not have asked for a more talented and professional team. Every single detail was perfect and the photos are breathtaking. Highly recommend to any couple!" },
    { title: "Exceeded all expectations", body: "From our first consultation to the wedding day, the experience was seamless. The quality of work is outstanding and all our guests were impressed." },
    { title: "Worth every penny", body: "We did our research and chose wisely. The attention to detail and level of service was exceptional. Our wedding day was perfect." },
    { title: "Highly professional team", body: "Friendly, creative, and incredibly talented. They made us feel so comfortable and the results speak for themselves." },
    { title: "Best decision we made", body: "After looking at dozens of vendors, we chose this one and are so glad we did. They went above and beyond." },
    { title: "Magical experience", body: "Everything was more beautiful than we imagined. The team was a pleasure to work with throughout the entire process." },
    { title: "True professionals", body: "We had a large wedding and they handled everything flawlessly. Our guests are still talking about how amazing it was." },
    { title: "Creative and talented", body: "They captured the essence of our wedding perfectly. The results were beyond our wildest dreams." },
  ];

  let reviewCount = 0;
  for (let i = 0; i < Math.min(50, vendorProfiles.length * 2); i++) {
    const couple = couples[i % couples.length];
    const vendor = vendorProfiles[Math.floor(i / 2) % vendorProfiles.length];
    const reviewText = reviewTexts[i % reviewTexts.length];

    try {
      await prisma.review.create({
        data: {
          vendorId: vendor.id,
          coupleProfileId: couple.profile.id,
          userId: couple.user.id,
          rating: 4 + Math.random(),
          title: reviewText.title,
          body: reviewText.body,
          status: "APPROVED",
        },
      });
      reviewCount++;
    } catch {
      // skip duplicates
    }
  }
  console.log(`${reviewCount} reviews created`);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
