export interface RunPlagiarismCheckRequestBody {
  documentId: string;
  analysisMode: "basic" | "advanced";
  languageScope: "id" | "id-en";
}

export interface RunPlagiarismCheckResponseBody {
  reportId: string;
  similarityScore: number;
  requiresManualReview: boolean;
}
