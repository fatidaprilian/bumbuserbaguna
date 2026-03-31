import "dotenv/config";
import { loadAppConfig } from "./shared/config/app-config.ts";
import { createBackendRuntime } from "./composition-root.ts";
import { createFastifyServer } from "./http/fastify-server.ts";

async function main(): Promise<void> {
  // Phase 1: Validate environment — hard fails with clear message if missing vars
  const appConfig = loadAppConfig();

  // Phase 2: Wire all dependencies
  const backendRuntime = createBackendRuntime(appConfig.DATABASE_URL);

  // Phase 3: Create and start HTTP server
  const fastifyServer = await createFastifyServer(appConfig, backendRuntime);

  await fastifyServer.listen({ port: appConfig.APP_PORT, host: "0.0.0.0" });
}

main().catch((startupError: unknown) => {
  console.error("[Startup] Fatal error during bootstrap:", startupError);
  process.exit(1);
});
