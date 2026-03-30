import { z } from "zod";

export const validateReportStructureSchema = z.object({
  documentId: z.string().min(3),
  templateType: z.enum(["praktikum", "makalah", "proposal", "skripsi"]),
  detectedSectionCodes: z.array(z.string().min(1)).max(100),
});

export type ValidateReportStructureInput = z.infer<typeof validateReportStructureSchema>;
