import type { CoffeeShop } from "@/lib/types";
import { defaultWeeklyHours } from "@/lib/hours";

export const demoShops: CoffeeShop[] = [
  {
    id: "ember-lane",
    ownerId: "owner-1",
    name: "Ember Lane Coffee",
    description: "Neighborhood espresso bar with single-origin pour overs and quiet morning seating.",
    status: "published",
    plan: "pro",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    phone: "+63 917 111 2040",
    website: "https://example.com",
    facebookUrl: "https://www.facebook.com/emberlanecoffee",
    instagramUrl: "https://www.instagram.com/emberlanecoffee",
    coverImageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    address: "72 Scout Rallos Street",
    city: "Quezon City",
    coordinates: { latitude: 14.6335, longitude: 121.0389 },
    openingHours: "7:00 AM - 9:00 PM",
    weeklyHours: defaultWeeklyHours,
    labels: [
      { groupName: "Shop Type", label: "Specialty Coffee" },
      { groupName: "Amenities", label: "Free WiFi" },
      { groupName: "Amenities", label: "Charging Ports" },
      { groupName: "Best For", label: "Work Friendly" },
      { groupName: "Vibe", label: "Cozy" }
    ],
    photos: [
      {
        id: "photo-ember-1",
        shopId: "ember-lane",
        imageUrl: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=900&q=80",
        caption: "Slow bar and espresso counter",
        sortOrder: 0
      },
      {
        id: "photo-ember-2",
        shopId: "ember-lane",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
        caption: "Signature drinks",
        sortOrder: 1
      }
    ],
    promos: [
      {
        id: "promo-ember-1",
        shopId: "ember-lane",
        title: "Free pastry with any signature latte",
        description: "A bright morning favorite with gentle sweetness.",
        code: "PASTRYAM",
        startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isFeatured: true
      }
    ],
    reviews: [
      {
        id: "review-ember-1",
        shopId: "ember-lane",
        reviewerName: "Ari",
        rating: 5,
        comment: "The ube latte is balanced and the staff is quick in the morning.",
        visitTags: ["Great coffee", "Fast service", "Friendly staff"],
        photoUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
        isVerifiedVisit: true,
        isPublished: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "review-ember-2",
        shopId: "ember-lane",
        reviewerName: "Bea",
        rating: 4,
        comment: "Cozy spot, good espresso, and easy to find from maps.",
        visitTags: ["Great coffee", "Friendly staff"],
        isVerifiedVisit: false,
        isPublished: true,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    menu: [
      {
        id: "flat-white",
        shopId: "ember-lane",
        category: "Espresso",
        name: "Flat White",
        description: "Double ristretto with steamed milk.",
        priceCents: 17500,
        currency: "PHP",
        tags: ["espresso", "milk", "hot"],
        isAvailable: true
      },
      {
        id: "ube-latte",
        shopId: "ember-lane",
        category: "Signature",
        name: "Ube Latte",
        description: "Espresso, milk, and house ube cream.",
        priceCents: 21000,
        currency: "PHP",
        tags: ["signature", "iced", "sweet"],
        isAvailable: true
      }
    ]
  },
  {
    id: "north-star",
    ownerId: "owner-2",
    name: "North Star Roasters",
    description: "Small-batch roaster with filter coffee flights and beans for home brewing.",
    status: "published",
    plan: "starter",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    phone: "+63 917 222 2040",
    coverImageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    address: "5 Jupiter Street",
    city: "Makati",
    coordinates: { latitude: 14.5607, longitude: 121.0297 },
    openingHours: "8:00 AM - 8:00 PM",
    weeklyHours: {
      ...defaultWeeklyHours,
      sun: { isClosed: true, open: "08:00", close: "18:00" },
      mon: { isClosed: false, open: "08:00", close: "20:00" },
      tue: { isClosed: false, open: "08:00", close: "20:00" },
      wed: { isClosed: false, open: "08:00", close: "20:00" },
      thu: { isClosed: false, open: "08:00", close: "20:00" },
      fri: { isClosed: false, open: "08:00", close: "20:00" },
      sat: { isClosed: false, open: "08:00", close: "18:00" }
    },
    labels: [
      { groupName: "Shop Type", label: "Roastery" },
      { groupName: "Best For", label: "Study Spot" },
      { groupName: "Best For", label: "Quiet" },
      { groupName: "Vibe", label: "Minimalist" }
    ],
    photos: [
      {
        id: "photo-north-1",
        shopId: "north-star",
        imageUrl: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=900&q=80",
        caption: "Roastery seating",
        sortOrder: 0
      }
    ],
    promos: [
      {
        id: "promo-north-1",
        shopId: "north-star",
        title: "10% off filter coffee flights",
        description: "Try three current origins and take home beans.",
        startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isFeatured: false
      }
    ],
    reviews: [
      {
        id: "review-north-1",
        shopId: "north-star",
        reviewerName: "Marco",
        rating: 5,
        comment: "Great filter flights and the staff explained each origin clearly.",
        visitTags: ["Great coffee", "Quiet", "Worth the price"],
        isVerifiedVisit: true,
        isPublished: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    menu: [
      {
        id: "v60-flight",
        shopId: "north-star",
        category: "Filter",
        name: "V60 Tasting Flight",
        description: "Three 120ml brews from current roasted origins.",
        priceCents: 28000,
        currency: "PHP",
        tags: ["filter", "single origin", "hot"],
        isAvailable: true
      },
      {
        id: "cold-brew",
        shopId: "north-star",
        category: "Cold Coffee",
        name: "Citrus Cold Brew",
        description: "Cold brew with orange peel and tonic.",
        priceCents: 19500,
        currency: "PHP",
        tags: ["cold brew", "iced"],
        isAvailable: true
      }
    ]
  },
  {
    id: "harbor-cup",
    ownerId: "owner-3",
    name: "Harbor Cup",
    description: "Compact cafe near the bay with iced drinks, pastries, and relaxed service.",
    status: "published",
    plan: "free",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    phone: "+63 917 333 2040",
    coverImageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
    address: "Roxas Boulevard",
    city: "Manila",
    coordinates: { latitude: 14.5736, longitude: 120.9847 },
    openingHours: "6:30 AM - 7:00 PM",
    weeklyHours: {
      ...defaultWeeklyHours,
      sun: { isClosed: false, open: "06:30", close: "19:00" },
      mon: { isClosed: false, open: "06:30", close: "19:00" },
      tue: { isClosed: false, open: "06:30", close: "19:00" },
      wed: { isClosed: false, open: "06:30", close: "19:00" },
      thu: { isClosed: false, open: "06:30", close: "19:00" },
      fri: { isClosed: false, open: "06:30", close: "19:00" },
      sat: { isClosed: false, open: "06:30", close: "19:00" }
    },
    promos: [],
    labels: [
      { groupName: "Shop Type", label: "Neighborhood Cafe" },
      { groupName: "Amenities", label: "Pet Friendly" },
      { groupName: "Best For", label: "Takeout" },
      { groupName: "Vibe", label: "Chill" }
    ],
    photos: [],
    reviews: [],
    menu: [
      {
        id: "spanish-latte",
        shopId: "harbor-cup",
        category: "Signature",
        name: "Spanish Latte",
        description: "Iced espresso with condensed milk.",
        priceCents: 18500,
        currency: "PHP",
        tags: ["iced", "sweet", "espresso"],
        isAvailable: true
      }
    ]
  }
];
