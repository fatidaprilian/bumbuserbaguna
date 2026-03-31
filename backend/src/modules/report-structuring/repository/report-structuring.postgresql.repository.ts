import type { DatabaseQueryExecutor } from "../../../shared/database/postgresql-client.ts";
import type {
  ReportStructuringRepository,
  ReportTemplateSection,
} from "./report-structuring.repository-contract.ts";

interface ReportTemplateSectionRow {
  section_code: string;
  section_title: string;
  is_mandatory: boolean;
}

export class PostgresqlReportStructuringRepository implements ReportStructuringRepository {
  constructor(private readonly databaseClient: DatabaseQueryExecutor) {}

  public async listTemplateSections(templateType: string): Promise<ReportTemplateSection[]> {
    const queryResult = await this.databaseClient.query<ReportTemplateSectionRow>(
      `SELECT section_code, section_title, is_mandatory
       FROM report_template_sections
       WHERE template_type = $1
       ORDER BY section_order ASC`,
      [templateType],
    );

    return queryResult.rows.map((sectionRow) => ({
      sectionCode: sectionRow.section_code,
      sectionTitle: sectionRow.section_title,
      isMandatory: sectionRow.is_mandatory,
    }));
  }
}
