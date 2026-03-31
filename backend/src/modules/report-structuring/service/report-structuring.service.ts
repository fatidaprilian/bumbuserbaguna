import { createIdentifier } from "../../../shared/identifier.ts";
import type { ReportStructuringRepository } from "../repository/report-structuring.repository-contract.ts";

export interface ValidateReportStructureCommand {
  tenantId: string;
  userId: string;
  documentId: string;
  templateType: "praktikum" | "makalah" | "proposal" | "skripsi";
  detectedSectionCodes: string[];
}

export interface StructureValidationResult {
  structureReportId: string;
  isStructureComplete: boolean;
  missingSections: string[];
}

export class ReportStructuringService {
  constructor(private readonly reportStructuringRepository: ReportStructuringRepository) {}

  public validateReportStructure(
    command: ValidateReportStructureCommand,
  ): Promise<StructureValidationResult> {
    return this.evaluateStructure(command);
  }

  private async evaluateStructure(
    command: ValidateReportStructureCommand,
  ): Promise<StructureValidationResult> {
    const templateSections = await this.reportStructuringRepository.listTemplateSections(
      command.templateType,
    );

    const detectedSectionSet = new Set(command.detectedSectionCodes);
    const missingSections = templateSections
      .filter((templateSection) => templateSection.isMandatory)
      .filter((templateSection) => !detectedSectionSet.has(templateSection.sectionCode))
      .map((templateSection) => templateSection.sectionTitle);

    const isStructureComplete = missingSections.length === 0;

    return {
      structureReportId: createIdentifier("structure"),
      isStructureComplete,
      missingSections,
    };
  }
}
