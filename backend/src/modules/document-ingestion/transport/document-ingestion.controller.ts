import type { ApiSuccessEnvelope } from "../../../shared/contracts/api-envelope";
import type { RequestContext } from "../../../shared/transport-context";
import { uploadDocumentSchema } from "../../../shared/validation/document-ingestion.schema";
import { parseBoundaryInput } from "../../../shared/validation/validate-input";
import type { DocumentIngestionService } from "../service/document-ingestion.service";
import type {
  UploadDocumentRequestBody,
  UploadDocumentResponseBody,
} from "./document-ingestion.controller-contract";

export class DocumentIngestionController {
  constructor(private readonly documentIngestionService: DocumentIngestionService) {}

  public async uploadDocument(
    requestContext: RequestContext,
    incomingPayload: unknown,
  ): Promise<ApiSuccessEnvelope<UploadDocumentResponseBody>> {
    const requestBody = parseBoundaryInput(uploadDocumentSchema, incomingPayload);
    const serviceResult = await this.documentIngestionService.enqueueDocumentIngestion({
      tenantId: requestContext.tenantId,
      userId: requestContext.userId,
      assignmentType: requestBody.assignmentType,
      fileName: requestBody.fileName,
      mimeType: requestBody.mimeType,
      fileSizeBytes: requestBody.fileSizeBytes,
    });

    const payload: UploadDocumentResponseBody = {
      documentId: serviceResult.documentId,
      documentVersionId: serviceResult.documentVersionId,
      processingJobId: serviceResult.processingJobId,
    };

    return {
      success: true,
      traceId: requestContext.traceId,
      payload,
    };
  }
}

export type UploadDocumentControllerRequest = UploadDocumentRequestBody;
