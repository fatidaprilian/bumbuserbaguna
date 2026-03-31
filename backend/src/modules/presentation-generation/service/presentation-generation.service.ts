import type { PresentationGenerationRepository } from "../repository/presentation-generation.repository-contract.ts";

export interface GeneratePresentationCommand {
  tenantId: string;
  userId: string;
  documentId: string;
  targetSlideCount: number;
  audienceLevel: "smp" | "sma-smk" | "university";
}

export interface PresentationGenerationResult {
  presentationId: string;
  jobStatus: "queued" | "processing" | "completed";
}

export class PresentationGenerationService {
  constructor(
    private readonly presentationGenerationRepository: PresentationGenerationRepository,
  ) {}

  public generatePresentationFromReport(
    command: GeneratePresentationCommand,
  ): Promise<PresentationGenerationResult> {
    return this.enqueuePresentationGeneration(command);
  }

  private async enqueuePresentationGeneration(
    command: GeneratePresentationCommand,
  ): Promise<PresentationGenerationResult> {
    const slideCount = Math.max(8, Math.min(command.targetSlideCount, 20));
    const presentationId = await this.presentationGenerationRepository.createPresentationJob(
      command.tenantId,
      command.userId,
      command.documentId,
      slideCount,
      command.audienceLevel,
    );

    return {
      presentationId,
      jobStatus: "queued",
    };
  }
}
