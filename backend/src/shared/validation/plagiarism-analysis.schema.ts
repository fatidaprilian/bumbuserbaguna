import { z } from "zod";

export const runPlagiarismCheckSchema = z.object({
  documentId: z.string().min(3),
  analysisMode: z.enum(["basic", "advanced"]),
  languageScope: z.enum(["id", "id-en"]),
});

export type RunPlagiarismCheckInput = z.infer<typeof runPlagiarismCheckSchema>;
