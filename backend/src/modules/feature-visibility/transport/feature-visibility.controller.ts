import type { FastifyInstance } from "fastify";
import { parseBoundaryInput } from "../../../shared/validation/validate-input.ts";
import { featureVisibilitySchema } from "../../../shared/validation/feature-visibility.schema.ts";
import type { RequestContext } from "../../../shared/transport-context.ts";
import type { ApiSuccessEnvelope } from "../../../shared/contracts/api-envelope.ts";
import type {
  ListFeatureFlagsResponse,
  GetVisibleFeaturesResponse,
  SetFeatureVisibilityResponse,
} from "./feature-visibility.controller-contract.ts";
import type { FeatureVisibilityService } from "../service/feature-visibility.service.ts";

export class FeatureVisibilityController {
  constructor(private readonly featureVisibilityService: FeatureVisibilityService) {}

  public registerRoutes(fastifyInstance: FastifyInstance): void {
    // List all feature flags (public, authenticated)
    fastifyInstance.get<{ Reply: ApiSuccessEnvelope<ListFeatureFlagsResponse> }>(
      "/v1/tools/features",
      { preHandler: fastifyInstance.authenticate },
      async (request, reply) => {
        const featureFlags =
          await this.featureVisibilityService.getAllFeatureFlags();

        return reply.status(200).send({
          success: true,
          traceId: request.id,
          payload: {
            featureFlags: featureFlags.map((ff) => ({
              featureCode: ff.featureCode,
              featureLabel: ff.featureLabel,
              description: ff.description,
            })),
          } as ListFeatureFlagsResponse,
        });
      },
    );

    // Get visible features for current user's role
    fastifyInstance.get<{ Reply: ApiSuccessEnvelope<GetVisibleFeaturesResponse> }>(
      "/v1/tools/features:my-access",
      { preHandler: fastifyInstance.authenticate },
      async (request, reply) => {
        const requestContext = request.requestContext as RequestContext;
        const jwtPayload = request.user as any; // JWT payload injected by auth guard

        const visibleFeatures =
          await this.featureVisibilityService.getVisibleFeaturesForRole(
            requestContext.tenantId,
            jwtPayload.role,
          );

        return reply.status(200).send({
          success: true,
          traceId: request.id,
          payload: {
            visibleFeatures,
          } as GetVisibleFeaturesResponse,
        });
      },
    );

    // Admin: Set feature visibility for a role
    fastifyInstance.post<{
      Body: unknown;
      Reply: ApiSuccessEnvelope<SetFeatureVisibilityResponse>;
    }>(
      "/v1/admin/tools/features:set-visibility",
      { preHandler: fastifyInstance.authenticate },
      async (request, reply) => {
        const requestContext = request.requestContext as RequestContext;
        const jwtPayload = request.user as any;

        // Check if admin (optional: could add requireRole middleware)
        if (jwtPayload.role !== "admin") {
          return reply.status(403).send({
            success: false,
            traceId: request.id,
            error: {
              code: "FORBIDDEN",
              message: "Only admins can modify feature visibility.",
            },
          });
        }

        const body = parseBoundaryInput(
          featureVisibilitySchema.setFeatureVisibilitySchema,
          request.body,
        );

        await this.featureVisibilityService.setFeatureVisibility(
          requestContext.tenantId,
          body.featureCode,
          body.roleCode,
          body.isEnabled,
        );

        return reply.status(200).send({
          success: true,
          traceId: request.id,
          payload: {
            success: true,
            message: `Feature '${body.featureCode}' visibility for role '${body.roleCode}' set to ${body.isEnabled}`,
          } as SetFeatureVisibilityResponse,
        });
      },
    );
  }
}
