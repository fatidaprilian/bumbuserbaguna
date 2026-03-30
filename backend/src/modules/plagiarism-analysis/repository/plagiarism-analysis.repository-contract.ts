export interface SimilarityMatchEvidence {
  sourceDocumentId: string;
  similarityRatio: number;
  matchedSegmentCount: number;
}

export interface PlagiarismAnalysisRepository {
  fetchSimilarityEvidence(
    tenantId: string,
    documentId: string,
  ): Promise<SimilarityMatchEvidence[]>;

  savePlagiarismReport(
    tenantId: string,
    documentId: string,
    similarityScore: number,
    requiresManualReview: boolean,
  ): Promise<string>;
}
