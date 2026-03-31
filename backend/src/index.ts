// Public API barrel — intentionally minimal.
// Consumers should import directly from module paths to avoid circular dependencies.
export { createBackendRuntime, type BackendRuntime } from "./composition-root.ts";
export { loadAppConfig, type AppConfig } from "./shared/config/app-config.ts";
export { createFastifyServer } from "./http/fastify-server.ts";
