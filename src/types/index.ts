import type {
  VendorProfile,
  Category,
  MediaAsset,
  Review,
  User,
  CoupleProfile,
  Subscription,
  Inquiry,
  Conversation,
  Message,
  ServiceArea,
} from "@prisma/client";

export type VendorWithRelations = VendorProfile & {
  category: Category;
  media: MediaAsset[];
  reviews: (Review & { user: Pick<User, "name" | "image"> })[];
  subscription: Subscription | null;
  serviceAreas: ServiceArea[];
};

export type ReviewWithCouple = Review & {
  user: Pick<User, "name" | "image">;
  couple: Pick<CoupleProfile, "id">;
};

export type InquiryWithDetails = Inquiry & {
  vendor: Pick<VendorProfile, "id" | "businessName" | "slug">;
  couple: CoupleProfile & { user: Pick<User, "name" | "email" | "image"> };
};

export type ConversationWithDetails = Conversation & {
  messages: Message[];
  inquiry: InquiryWithDetails;
};

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export { UserRole, SubscriptionTier, PriceTier, ReviewStatus } from "@prisma/client";
