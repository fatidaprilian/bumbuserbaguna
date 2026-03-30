export interface RunPlagiarismCheckCommand {
  tenantId: string;
  userId: string;
  documentId: string;
  analysisMode: "basic" | "advanced";
  languageScope: "id" | "id-en";
}

export interface PlagiarismCheckResult {
  reportId: string;
  similarityScore: number;
  requiresManualReview: boolean;
}

export class PlagiarismAnalysisService {
  public runPlagiarismCheck(
    command: RunPlagiarismCheckCommand,
  ): PlagiarismCheckResult {
    const requiresManualReview = command.analysisMode === "advanced";

    return {
      reportId: "report_placeholder",
      similarityScore: 0,
      requiresManualReview,
    };
  }
}
