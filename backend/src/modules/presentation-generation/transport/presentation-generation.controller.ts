import type { ApiSuccessEnvelope } from "../../../shared/contracts/api-envelope.ts";
import type { RequestContext } from "../../../shared/transport-context.ts";
import { generatePresentationSchema } from "../../../shared/validation/presentation-generation.schema.ts";
import { parseBoundaryInput } from "../../../shared/validation/validate-input.ts";
import type { PresentationGenerationService } from "../service/presentation-generation.service.ts";
import type {
  GeneratePresentationRequestBody,
  GeneratePresentationResponseBody,
} from "./presentation-generation.controller-contract.ts";

export class PresentationGenerationController {
  constructor(private readonly presentationGenerationService: PresentationGenerationService) {}

  public async generatePresentation(
    requestContext: RequestContext,
    incomingPayload: unknown,
  ): Promise<ApiSuccessEnvelope<GeneratePresentationResponseBody>> {
    const requestBody = parseBoundaryInput(generatePresentationSchema, incomingPayload);
    const serviceResult = await this.presentationGenerationService.generatePresentationFromReport({
      tenantId: requestContext.tenantId,
      userId: requestContext.userId,
      documentId: requestBody.documentId,
      targetSlideCount: requestBody.targetSlideCount,
      audienceLevel: requestBody.audienceLevel,
    });

    return {
      success: true,
      traceId: requestContext.traceId,
      payload: serviceResult,
    };
  }
}

export type GeneratePresentationControllerRequest = GeneratePresentationRequestBody;
