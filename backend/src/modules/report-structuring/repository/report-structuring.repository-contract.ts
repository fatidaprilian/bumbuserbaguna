export interface ReportTemplateSection {
  sectionCode: string;
  sectionTitle: string;
  isMandatory: boolean;
}

export interface ReportStructuringRepository {
  listTemplateSections(templateType: string): Promise<ReportTemplateSection[]>;
}
