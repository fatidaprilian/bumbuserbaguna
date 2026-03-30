import { z } from "zod";

export const generatePresentationSchema = z.object({
  documentId: z.string().min(3),
  targetSlideCount: z.number().int().min(8).max(20),
  audienceLevel: z.enum(["smp", "sma-smk", "university"]),
});

export type GeneratePresentationInput = z.infer<typeof generatePresentationSchema>;
