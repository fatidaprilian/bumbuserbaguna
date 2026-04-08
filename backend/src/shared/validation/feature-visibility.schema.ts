import { z } from "zod";

export const featureVisibilitySchema = {
  setFeatureVisibilitySchema: z.object({
    featureCode: z
      .string()
      .min(3, "Feature code must be at least 3 characters")
      .max(100, "Feature code must not exceed 100 characters"),
    roleCode: z
      .enum(["student", "teacher", "admin"] as const)
      .describe("User role"),
    isEnabled: z.boolean().describe("Whether the feature is enabled for this role"),
  }),
};
