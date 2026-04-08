import type {
  FeatureVisibilityRepository,
  FeatureFlag,
  RoleFeatureAssignment,
} from "./feature-visibility.repository-contract.ts";
import type { DatabaseQueryExecutor } from "../../../shared/database/postgresql-client.ts";

interface FeatureFlagRow {
  feature_flag_id: string;
  feature_code: string;
  feature_label: string;
  description: string | null;
  is_enabled: boolean;
  created_at: string;
}

interface RoleFeatureAssignmentRow {
  assignment_id: string;
  institution_id: string;
  feature_flag_id: string;
  role_code: string;
  is_enabled: boolean;
  created_at: string;
}

export class PostgresqlFeatureVisibilityRepository
  implements FeatureVisibilityRepository {
  constructor(private readonly databaseClient: DatabaseQueryExecutor) {}

  public async isFeatureVisibleForRole(
    institutionId: string,
    roleCode: string,
    featureCode: string,
  ): Promise<boolean> {
    const query = `
      SELECT 1
      FROM role_feature_assignments rfa
      JOIN feature_flags ff ON rfa.feature_flag_id = ff.feature_flag_id
      WHERE rfa.institution_id = $1
        AND rfa.role_code = $2
        AND ff.feature_code = $3
        AND rfa.is_enabled = TRUE
        AND ff.is_enabled = TRUE
      LIMIT 1
    `;

    const result = await this.databaseClient.query<{ '?column?': number }>(
      query,
      [institutionId, roleCode, featureCode],
    );

    return result.rows.length > 0;
  }

  public async getVisibleFeaturesForRole(
    institutionId: string,
    roleCode: string,
  ): Promise<string[]> {
    const query = `
      SELECT DISTINCT ff.feature_code
      FROM role_feature_assignments rfa
      JOIN feature_flags ff ON rfa.feature_flag_id = ff.feature_flag_id
      WHERE rfa.institution_id = $1
        AND rfa.role_code = $2
        AND rfa.is_enabled = TRUE
        AND ff.is_enabled = TRUE
      ORDER BY ff.feature_code
    `;

    interface Row {
      feature_code: string;
    }

    const result = await this.databaseClient.query<Row>(query, [
      institutionId,
      roleCode,
    ]);

    return result.rows.map((row) => row.feature_code);
  }

  public async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    const query = `
      SELECT
        feature_flag_id,
        feature_code,
        feature_label,
        description,
        is_enabled,
        created_at
      FROM feature_flags
      ORDER BY feature_code
    `;

    const result = await this.databaseClient.query<FeatureFlagRow>(query);

    return result.rows.map((row) => ({
      featureFlagId: row.feature_flag_id,
      featureCode: row.feature_code,
      featureLabel: row.feature_label,
      description: row.description || undefined,
      isEnabled: row.is_enabled,
      createdAt: new Date(row.created_at),
    }));
  }

  public async setFeatureVisibility(
    institutionId: string,
    featureCode: string,
    roleCode: string,
    isEnabled: boolean,
  ): Promise<void> {
    const query = `
      UPDATE role_feature_assignments
      SET is_enabled = $1,
          enabled_at = CASE WHEN $1 = TRUE THEN NOW() ELSE enabled_at END,
          disabled_at = CASE WHEN $1 = FALSE THEN NOW() ELSE disabled_at END
      WHERE institution_id = $2
        AND role_code = $3
        AND feature_flag_id = (
          SELECT feature_flag_id FROM feature_flags WHERE feature_code = $4
        )
    `;

    await this.databaseClient.query(query, [
      isEnabled,
      institutionId,
      roleCode,
      featureCode,
    ]);
  }
}
