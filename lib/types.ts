export type ShopStatus = "draft" | "published" | "suspended";
export type ShopPlan = "free" | "starter" | "pro";
export type ShopLabelGroupName = "Shop Type" | "Amenities" | "Best For" | "Vibe";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type DayHours = {
  isClosed: boolean;
  open: string;
  close: string;
};

export type WeeklyHours = {
  sun: DayHours;
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
};

export type MenuItem = {
  id: string;
  shopId: string;
  category: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  tags: string[];
  isAvailable: boolean;
  imageUrl?: string;
};

export type Promo = {
  id: string;
  shopId: string;
  title: string;
  description: string;
  code?: string;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  isFeatured: boolean;
};

export type Review = {
  id: string;
  shopId: string;
  reviewerId?: string;
  reviewerName: string;
  rating: number;
  comment: string;
  visitTags?: string[];
  photoUrl?: string;
  isVerifiedVisit?: boolean;
  isPublished: boolean;
  createdAt: string;
};

export type ShopLabel = {
  label: string;
  groupName: ShopLabelGroupName;
};

export type ShopPhoto = {
  id: string;
  shopId: string;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
};

export type CoffeeShop = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  status: ShopStatus;
  plan: ShopPlan;
  createdAt?: string;
  updatedAt?: string;
  phone: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  coverImageUrl: string;
  address: string;
  city: string;
  coordinates: Coordinates;
  openingHours: string;
  weeklyHours: WeeklyHours;
  promos: Promo[];
  reviews: Review[];
  labels: ShopLabel[];
  photos: ShopPhoto[];
  menu: MenuItem[];
};

export type SearchFilters = {
  query: string;
  radiusKm: number;
  maxPriceCents?: number;
  onlyAvailable: boolean;
  openNow: boolean;
  userLocation?: Coordinates;
  manualArea?: string;
  selectedLabels?: string[];
};

export type SearchResult = CoffeeShop & {
  distanceKm?: number;
  matchingDrinkCount: number;
};

export type FeedReactionType = "like" | "love" | "helpful";

export type FeedComment = {
  id: string;
  postId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type FeedPost = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  topic: string;
  createdAt: string;
  comments: FeedComment[];
  reactionCounts: Record<FeedReactionType, number>;
  viewerReaction?: FeedReactionType;
};
