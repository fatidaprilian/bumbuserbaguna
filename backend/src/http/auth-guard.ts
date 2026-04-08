import type { FastifyRequest, FastifyReply } from "fastify";
import type { RequestContext } from "../shared/transport-context.ts";
import type { JwtTokenPayload } from "../modules/identity-access/transport/identity-access.controller.ts";
import type { FeatureVisibilityService } from "../modules/feature-visibility/service/feature-visibility.service.ts";

// Re-export for convenience
export type UserRole = "student" | "teacher" | "admin";

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

/**
 * Fastify preHandler hook that enforces role-based access control.
 * Must be chained after requireAuthenticatedUser.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await requireAuthenticatedUser(request, reply);

    const jwtPayload = request.user as JwtTokenPayload;
    if (!allowedRoles.includes(jwtPayload.role as UserRole)) {
      await reply.status(403).send({
        success: false,
        traceId: request.id,
        error: {
          code: "FORBIDDEN",
          message: `This resource requires one of these roles: ${allowedRoles.join(", ")}.`,
        },
      });
    }
  };
}

/**
 * Fastify preHandler hook that enforces feature-based access control.
 * Checks if feature is visible for the user's role in their institution.
 * Must be chained after requireAuthenticatedUser.
 */
export function requireFeatureAccess(
  featureCode: string,
  featureVisibilityService: FeatureVisibilityService,
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await requireAuthenticatedUser(request, reply);

    const jwtPayload = request.user as JwtTokenPayload;
    const isVisible = await featureVisibilityService.isFeatureVisibleForRole(
      jwtPayload.tenantId,
      jwtPayload.role,
      featureCode,
    );

    if (!isVisible) {
      await reply.status(403).send({
        success: false,
        traceId: request.id,
        error: {
          code: "FORBIDDEN",
          message: `Feature '${featureCode}' is not available for your role or institution.`,
        },
      });
    }
  };
}
