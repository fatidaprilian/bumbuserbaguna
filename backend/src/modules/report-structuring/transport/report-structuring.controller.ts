import type { ApiSuccessEnvelope } from "../../../shared/contracts/api-envelope";
import type { RequestContext } from "../../../shared/transport-context";
import { validateReportStructureSchema } from "../../../shared/validation/report-structuring.schema";
import { parseBoundaryInput } from "../../../shared/validation/validate-input";
import type { ReportStructuringService } from "../service/report-structuring.service";
import type {
  ValidateStructureRequestBody,
  ValidateStructureResponseBody,
} from "./report-structuring.controller-contract";

export class ReportStructuringController {
  constructor(private readonly reportStructuringService: ReportStructuringService) {}

  public async validateStructure(
    requestContext: RequestContext,
    incomingPayload: unknown,
  ): Promise<ApiSuccessEnvelope<ValidateStructureResponseBody>> {
    const requestBody = parseBoundaryInput(validateReportStructureSchema, incomingPayload);
    const serviceResult = await this.reportStructuringService.validateReportStructure({
      tenantId: requestContext.tenantId,
      userId: requestContext.userId,
      documentId: requestBody.documentId,
      templateType: requestBody.templateType,
      detectedSectionCodes: requestBody.detectedSectionCodes,
    });

    return {
      success: true,
      traceId: requestContext.traceId,
      payload: serviceResult,
    };
  }
}

export type ValidateStructureControllerRequest = ValidateStructureRequestBody;
