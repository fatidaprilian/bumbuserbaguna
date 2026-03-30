import type { DatabaseClient } from "../../../shared/database/postgresql-client";
import type {
  ReportStructuringRepository,
  ReportTemplateSection,
} from "./report-structuring.repository-contract";

interface ReportTemplateSectionRow {
  section_code: string;
  section_title: string;
  is_mandatory: boolean;
}

export class PostgresqlReportStructuringRepository implements ReportStructuringRepository {
  constructor(private readonly databaseClient: DatabaseClient) {}

  public async listTemplateSections(templateType: string): Promise<ReportTemplateSection[]> {
    const templateSectionsResult = await this.databaseClient.query<ReportTemplateSectionRow>(
      `SELECT section_code, section_title, is_mandatory
       FROM report_template_sections
       WHERE template_type = $1
       ORDER BY section_order ASC`,
      [templateType],
    );

    return templateSectionsResult.rows.map((sectionRow) => ({
      sectionCode: sectionRow.section_code,
      sectionTitle: sectionRow.section_title,
      isMandatory: sectionRow.is_mandatory,
    }));
  }
}
