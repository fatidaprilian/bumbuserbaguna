import type { PlagiarismAnalysisService } from "../modules/plagiarism-analysis/service/plagiarism-analysis.service";

export interface PlagiarismWorkerPayload {
  tenantId: string;
  userId: string;
  documentId: string;
  analysisMode: "basic" | "advanced";
  languageScope: "id" | "id-en";
}

export class PlagiarismAnalysisWorker {
  constructor(private readonly plagiarismAnalysisService: PlagiarismAnalysisService) {}

  public async processJob(workerPayload: PlagiarismWorkerPayload): Promise<void> {
    await this.plagiarismAnalysisService.runPlagiarismCheck(workerPayload);
  }
}
