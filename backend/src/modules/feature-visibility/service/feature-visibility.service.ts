import { ApplicationError } from "../../../shared/errors/application-error.ts";
import type {
  FeatureVisibilityRepository,
  FeatureFlag,
} from "../repository/feature-visibility.repository-contract.ts";

/**
 * FeatureVisibilityService
 * Manages which features are visible to which roles in which institutions.
 * Used by auth guard to enforce feature access control.
 */
export class FeatureVisibilityService {
  constructor(private readonly repository: FeatureVisibilityRepository) {}

  /**
   * Check if a feature is visible for a specific role in an institution
   * Throws FORBIDDEN error if not visible
   */
  public async assertFeatureVisibleForRole(
    institutionId: string,
    roleCode: string,
    featureCode: string,
  ): Promise<void> {
    const isVisible = await this.repository.isFeatureVisibleForRole(
      institutionId,
      roleCode,
      featureCode,
    );

    if (!isVisible) {
      throw new ApplicationError(
        "FORBIDDEN",
        `Feature '${featureCode}' is not available for this role.`,
      );
    }
  }

  /**
   * Check if a feature is visible (returns boolean, doesn't throw)
   */
  public async isFeatureVisibleForRole(
    institutionId: string,
    roleCode: string,
    featureCode: string,
  ): Promise<boolean> {
    return this.repository.isFeatureVisibleForRole(
      institutionId,
      roleCode,
      featureCode,
    );
  }

  /**
   * Get all visible features for a role in an institution
   */
  public async getVisibleFeaturesForRole(
    institutionId: string,
    roleCode: string,
  ): Promise<string[]> {
    return this.repository.getVisibleFeaturesForRole(institutionId, roleCode);
  }

  /**
   * Get all available feature flags
   */
  public async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return this.repository.getAllFeatureFlags();
  }

  /**
   * Set feature visibility for a role (admin only)
   */
  public async setFeatureVisibility(
    institutionId: string,
    featureCode: string,
    roleCode: string,
    isEnabled: boolean,
  ): Promise<void> {
    return this.repository.setFeatureVisibility(
      institutionId,
      featureCode,
      roleCode,
      isEnabled,
    );
  }
}
