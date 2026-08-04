import { z } from "zod";
import { InquiryStatus } from "@prisma/client";

export const CreateInquirySchema = z.object({
  vendorId: z.string(),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().int().positive().optional(),
  budget: z.coerce.number().positive().optional(),
  message: z.string().min(20, "Message must be at least 20 characters").max(2000),
});

export const SendMessageSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const UpdateInquiryStatusSchema = z.object({
  status: z.nativeEnum(InquiryStatus),
});

export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type UpdateInquiryStatusInput = z.infer<typeof UpdateInquiryStatusSchema>;
