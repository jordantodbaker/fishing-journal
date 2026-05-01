import { z } from "zod";

export const catchInputSchema = z.object({
  species: z.string().trim().min(1, "Species is required").max(80),
  weight: z.coerce.number().min(0, "Weight must be ≥ 0").max(2000),
  length: z.coerce.number().min(0, "Length must be ≥ 0").max(500),
  location: z.string().trim().min(1, "Location is required").max(120),
  method: z.string().trim().min(1, "Method is required").max(80),
  dateCaught: z.coerce.date(),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  photoUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CatchInput = z.infer<typeof catchInputSchema>;

export const catchUpdateSchema = catchInputSchema.extend({
  id: z.string().min(1),
});

export const catchFilterSchema = z.object({
  species: z.string().trim().min(1).max(80).optional(),
  location: z.string().trim().min(1).max(120).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CatchFilter = z.infer<typeof catchFilterSchema>;
