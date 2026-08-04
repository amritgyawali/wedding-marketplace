import { z } from "zod";
import { RsvpStatus } from "@prisma/client";

export const CreateChecklistTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const UpdateChecklistTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(500).optional(),
  dueDate: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const CreateBudgetCategorySchema = z.object({
  name: z.string().min(1).max(100),
  allocatedAmount: z.coerce.number().min(0).default(0),
  color: z.string().optional(),
});

export const CreateBudgetItemSchema = z.object({
  budgetCategoryId: z.string(),
  vendorName: z.string().optional(),
  description: z.string().min(1).max(200),
  estimatedCost: z.coerce.number().min(0).default(0),
  actualCost: z.coerce.number().min(0).optional(),
  isPaid: z.boolean().default(false),
  dueDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateBudgetItemSchema = CreateBudgetItemSchema.partial().omit({
  budgetCategoryId: true,
});

export const CreateGuestSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  rsvpStatus: z.nativeEnum(RsvpStatus).default(RsvpStatus.PENDING),
  dietaryNeeds: z.string().optional(),
  plusOne: z.boolean().default(false),
  tableNumber: z.coerce.number().int().positive().optional(),
  side: z.enum(["BRIDE", "GROOM", "BOTH"]).optional(),
  notes: z.string().max(300).optional(),
});

export const UpdateGuestRsvpSchema = z.object({
  rsvpStatus: z.nativeEnum(RsvpStatus),
  dietaryNeeds: z.string().optional(),
  tableNumber: z.coerce.number().int().positive().optional(),
});

export type CreateChecklistTaskInput = z.infer<typeof CreateChecklistTaskSchema>;
export type UpdateChecklistTaskInput = z.infer<typeof UpdateChecklistTaskSchema>;
export type CreateBudgetCategoryInput = z.infer<typeof CreateBudgetCategorySchema>;
export type CreateBudgetItemInput = z.infer<typeof CreateBudgetItemSchema>;
export type CreateGuestInput = z.infer<typeof CreateGuestSchema>;
