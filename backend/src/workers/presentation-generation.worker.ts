import type { PresentationGenerationService } from "../modules/presentation-generation/service/presentation-generation.service";

export interface PresentationWorkerPayload {
  tenantId: string;
  userId: string;
  documentId: string;
  targetSlideCount: number;
  audienceLevel: "smp" | "sma-smk" | "university";
}

export class PresentationGenerationWorker {
  constructor(private readonly presentationGenerationService: PresentationGenerationService) {}

  public async processJob(workerPayload: PresentationWorkerPayload): Promise<void> {
    await this.presentationGenerationService.generatePresentationFromReport(workerPayload);
  }
}
