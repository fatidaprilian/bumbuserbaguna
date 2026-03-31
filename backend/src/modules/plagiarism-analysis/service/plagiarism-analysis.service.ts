import type { PlagiarismAnalysisRepository } from "../repository/plagiarism-analysis.repository-contract.ts";

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
  constructor(private readonly plagiarismAnalysisRepository: PlagiarismAnalysisRepository) {}

  public runPlagiarismCheck(
    command: RunPlagiarismCheckCommand,
  ): Promise<PlagiarismCheckResult> {
    return this.executePlagiarismCheck(command);
  }

  private async executePlagiarismCheck(
    command: RunPlagiarismCheckCommand,
  ): Promise<PlagiarismCheckResult> {
    const similarityEvidence = await this.plagiarismAnalysisRepository.fetchSimilarityEvidence(
      command.tenantId,
      command.documentId,
    );

    const similarityScore = this.calculateSimilarityScore(similarityEvidence.map((evidence) => evidence.similarityRatio));
    const requiresManualReview = command.analysisMode === "advanced";
    const reportId = await this.plagiarismAnalysisRepository.savePlagiarismReport(
      command.tenantId,
      command.documentId,
      similarityScore,
      requiresManualReview,
    );

    return {
      reportId,
      similarityScore,
      requiresManualReview,
    };
  }

  private calculateSimilarityScore(similarityRatios: number[]): number {
    if (similarityRatios.length === 0) {
      return 0;
    }

    const ratioSum = similarityRatios.reduce((accumulator, ratio) => accumulator + ratio, 0);
    return Number((ratioSum / similarityRatios.length).toFixed(2));
  }
}
