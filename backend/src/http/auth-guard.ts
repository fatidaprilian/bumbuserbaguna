import type { FastifyRequest, FastifyReply } from "fastify";
import type { RequestContext } from "../shared/transport-context.ts";
import type { JwtTokenPayload } from "../modules/identity-access/transport/identity-access.controller.ts";

// ---------------------------------------------------------------------------
// Augment FastifyRequest to carry a typed requestContext.
// Populated by the requireAuthenticatedUser preHandler hook.
// ---------------------------------------------------------------------------

declare module "fastify" {
  interface FastifyRequest {
    requestContext: RequestContext;
  }
}

/**
 * Fastify preHandler hook that enforces JWT authentication.
 * Extracts and verifies the Bearer token, then stamps a typed
 * RequestContext onto the request object for downstream controllers.
 */
export async function requireAuthenticatedUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
    const jwtPayload = request.user as JwtTokenPayload;

    request.requestContext = {
      traceId: request.id,
      userId: jwtPayload.sub,
      tenantId: jwtPayload.tenantId,
    };
  } catch {
    await reply.status(401).send({
      success: false,
      traceId: request.id,
      error: {
        code: "UNAUTHORIZED",
        message: "A valid Bearer token is required to access this resource.",
      },
    });
  }
}
