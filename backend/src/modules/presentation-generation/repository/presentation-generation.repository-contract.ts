export interface PresentationGenerationRepository {
  createPresentationJob(
    tenantId: string,
    userId: string,
    documentId: string,
    targetSlideCount: number,
    audienceLevel: string,
  ): Promise<string>;
}
