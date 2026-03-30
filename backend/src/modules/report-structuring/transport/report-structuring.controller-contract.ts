export interface ValidateStructureRequestBody {
  documentId: string;
  templateType: "praktikum" | "makalah" | "proposal" | "skripsi";
  detectedSectionCodes: string[];
}

export interface ValidateStructureResponseBody {
  structureReportId: string;
  isStructureComplete: boolean;
  missingSections: string[];
}
