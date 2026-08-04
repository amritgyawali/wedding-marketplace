import { z } from "zod";
import { ReviewStatus } from "@prisma/client";

export const CreateReviewSchema = z.object({
  vendorId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(120),
  body: z.string().min(20).max(2000),
  weddingDate: z.string().optional(),
});

export const VendorReplySchema = z.object({
  reply: z.string().min(10).max(1000),
});

export const ModerateReviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
  reason: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type VendorReplyInput = z.infer<typeof VendorReplySchema>;
export type ModerateReviewInput = z.infer<typeof ModerateReviewSchema>;
