import { z } from "zod";

export const uploadDocumentSchema = z.object({
  assignmentType: z.enum(["report", "paper", "presentation"]),
  fileName: z.string().min(3).max(255),
  mimeType: z.string().min(3).max(120),
  fileSizeBytes: z.number().int().min(1).max(50 * 1024 * 1024),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
