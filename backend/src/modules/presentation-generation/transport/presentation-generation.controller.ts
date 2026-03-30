import type { ApiSuccessEnvelope } from "../../../shared/contracts/api-envelope";
import type { RequestContext } from "../../../shared/transport-context";
import { generatePresentationSchema } from "../../../shared/validation/presentation-generation.schema";
import { parseBoundaryInput } from "../../../shared/validation/validate-input";
import type { PresentationGenerationService } from "../service/presentation-generation.service";
import type {
  GeneratePresentationRequestBody,
  GeneratePresentationResponseBody,
} from "./presentation-generation.controller-contract";

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
