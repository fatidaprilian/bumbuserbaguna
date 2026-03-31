import Fastify, {
  type FastifyInstance,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import type { AppConfig } from "../shared/config/app-config.ts";
import type { BackendRuntime } from "../composition-root.ts";
import { requireAuthenticatedUser } from "./auth-guard.ts";
import { ApplicationError } from "../shared/errors/application-error.ts";
import type { ApiErrorEnvelope } from "../shared/contracts/api-envelope.ts";

// ---------------------------------------------------------------------------
// Route registry — mounts all module routes on the Fastify instance
// ---------------------------------------------------------------------------

function registerAllRoutes(
  fastifyInstance: FastifyInstance,
  backendRuntime: BackendRuntime,
): void {
  // Public routes — no auth required
  backendRuntime.identityAccessController.registerRoutes(fastifyInstance);

  // Health check
  fastifyInstance.get(
    "/health",
    async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(200).send({ status: "ok", timestamp: new Date().toISOString() });
    },
  );

  // Protected routes — require valid Bearer token
  fastifyInstance.post(
    "/v1/documents:upload",
    { preHandler: requireAuthenticatedUser },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const result = await backendRuntime.documentIngestionController.uploadDocument(
        request.requestContext,
        request.body,
      );
      return reply.status(202).send(result);
    },
  );

  fastifyInstance.post(
    "/v1/tools/plagiarism:run",
    { preHandler: requireAuthenticatedUser },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const result = await backendRuntime.plagiarismAnalysisController.runPlagiarism(
        request.requestContext,
        request.body,
      );
      return reply.status(200).send(result);
    },
  );

  fastifyInstance.post(
    "/v1/tools/report-structure:validate",
    { preHandler: requireAuthenticatedUser },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const result = await backendRuntime.reportStructuringController.validateStructure(
        request.requestContext,
        request.body,
      );
      return reply.status(200).send(result);
    },
  );

  fastifyInstance.post(
    "/v1/tools/presentation:generate",
    { preHandler: requireAuthenticatedUser },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const result = await backendRuntime.presentationGenerationController.generatePresentation(
        request.requestContext,
        request.body,
      );
      return reply.status(202).send(result);
    },
  );
}

// ---------------------------------------------------------------------------
// Server factory — returns a configured, ready-to-listen Fastify instance
// ---------------------------------------------------------------------------

export async function createFastifyServer(
  appConfig: AppConfig,
  backendRuntime: BackendRuntime,
): Promise<FastifyInstance> {
  const isDevelopmentMode = appConfig.APP_ENV !== "production";

  const fastifyInstance: FastifyInstance = Fastify({
    logger: isDevelopmentMode
      ? {
          level: "debug",
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "HH:MM:ss" },
          },
        }
      : { level: "info" },
    genReqId: () => crypto.randomUUID(),
  });

  // Security headers
  await fastifyInstance.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });

  // Rate limiting — global default, 100 req/minute per IP
  await fastifyInstance.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: (request: FastifyRequest) => ({
      success: false,
      traceId: request.id,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please slow down.",
      },
    }),
  });

  // JWT — access tokens signed with JWT_ACCESS_SECRET
  await fastifyInstance.register(fastifyJwt, {
    secret: appConfig.JWT_ACCESS_SECRET,
  });

  // Global error handler — maps ApplicationError to structured API envelope
  fastifyInstance.setErrorHandler(
    async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
      if (error instanceof ApplicationError) {
        const httpStatusByErrorCode: Record<string, number> = {
          VALIDATION_ERROR: 400,
          UNAUTHORIZED: 401,
          FORBIDDEN: 403,
          NOT_FOUND: 404,
          RATE_LIMITED: 429,
          INTERNAL_ERROR: 500,
        };

        const httpStatusCode = httpStatusByErrorCode[error.errorCode] ?? 500;
        const errorEnvelope: ApiErrorEnvelope = {
          success: false,
          traceId: request.id,
          error: { code: error.errorCode, message: error.message },
        };

        return reply.status(httpStatusCode).send(errorEnvelope);
      }

      fastifyInstance.log.error({ error, traceId: request.id }, "Unhandled error");
      const internalErrorEnvelope: ApiErrorEnvelope = {
        success: false,
        traceId: request.id,
        error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
      };

      return reply.status(500).send(internalErrorEnvelope);
    },
  );

  // Mount all module routes
  registerAllRoutes(fastifyInstance, backendRuntime);

  return fastifyInstance;
}
