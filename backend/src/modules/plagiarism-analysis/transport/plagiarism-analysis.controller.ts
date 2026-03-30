import type { ApiSuccessEnvelope } from "../../../shared/contracts/api-envelope";
import type { RequestContext } from "../../../shared/transport-context";
import { runPlagiarismCheckSchema } from "../../../shared/validation/plagiarism-analysis.schema";
import { parseBoundaryInput } from "../../../shared/validation/validate-input";
import type { PlagiarismAnalysisService } from "../service/plagiarism-analysis.service";
import type {
  RunPlagiarismCheckRequestBody,
  RunPlagiarismCheckResponseBody,
} from "./plagiarism-analysis.controller-contract";

export class PlagiarismAnalysisController {
  constructor(private readonly plagiarismAnalysisService: PlagiarismAnalysisService) {}

  public async runPlagiarism(
    requestContext: RequestContext,
    incomingPayload: unknown,
  ): Promise<ApiSuccessEnvelope<RunPlagiarismCheckResponseBody>> {
    const requestBody = parseBoundaryInput(runPlagiarismCheckSchema, incomingPayload);
    const serviceResult = await this.plagiarismAnalysisService.runPlagiarismCheck({
      tenantId: requestContext.tenantId,
      userId: requestContext.userId,
      documentId: requestBody.documentId,
      analysisMode: requestBody.analysisMode,
      languageScope: requestBody.languageScope,
    });

    return {
      success: true,
      traceId: requestContext.traceId,
      payload: serviceResult,
    };
  }
}

export type RunPlagiarismControllerRequest = RunPlagiarismCheckRequestBody;
