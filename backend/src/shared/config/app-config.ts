import { z } from "zod";

// ---------------------------------------------------------------------------
// Environment schema — hard fail at startup if any variable is missing or
// malformed. This is the single source of truth for ALL configuration.
// ---------------------------------------------------------------------------

const appEnvironmentSchema = z.object({
  // Application
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.coerce.number().int().min(1024).max(65535).default(3000),
  APP_NAME: z.string().min(1).default("bumbuserbaguna"),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis (optional in Phase 1 — will be required in Phase 3)
  REDIS_URL: z.string().url().optional(),

  // Object Storage
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_BUCKET: z.string().min(1).optional(),
  STORAGE_ACCESS_KEY: z.string().min(1).optional(),
  STORAGE_SECRET_KEY: z.string().min(1).optional(),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().min(1).default("15m"),
  JWT_REFRESH_TTL: z.string().min(1).default("30d"),

  // AI Gateway (optional in Phase 1)
  AI_GATEWAY_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  AI_MONTHLY_BUDGET_USD: z.coerce.number().positive().default(200),
  AI_PRIMARY_PROVIDER: z.enum(["selfhost", "external"]).default("selfhost"),
  AI_FALLBACK_PROVIDER: z.enum(["selfhost", "external", "none"]).default("none"),
  EXTERNAL_AI_API_KEY: z.string().optional(),
  EXTERNAL_AI_BASE_URL: z.string().url().optional(),
});

export type AppConfig = z.infer<typeof appEnvironmentSchema>;

/**
 * Validates and returns typed application configuration from process.env.
 * Throws a descriptive error and terminates the process if validation fails —
 * intentional fail-fast behaviour at startup to avoid silent misconfigurations.
 */
export function loadAppConfig(): AppConfig {
  const parseResult = appEnvironmentSchema.safeParse(process.env);

  if (!parseResult.success) {
    const formattedErrors = parseResult.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `[Config] Environment validation failed:\n${formattedErrors}\n\nCopy .env.example to .env and fill in the required values.`,
    );
  }

  return parseResult.data;
}
