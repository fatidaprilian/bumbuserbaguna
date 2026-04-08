export interface FeatureVisibilityRepository {
  /**
   * Check if a feature is visible for a specific role in an institution
   */
  isFeatureVisibleForRole(
    institutionId: string,
    roleCode: string,
    featureCode: string,
  ): Promise<boolean>;

  /**
   * Get all visible features for a role in an institution
   */
  getVisibleFeaturesForRole(
    institutionId: string,
    roleCode: string,
  ): Promise<string[]>;

  /**
   * Get all feature flags in the system
   */
  getAllFeatureFlags(): Promise<FeatureFlag[]>;

  /**
   * Set feature visibility for a role
   */
  setFeatureVisibility(
    institutionId: string,
    featureCode: string,
    roleCode: string,
    isEnabled: boolean,
  ): Promise<void>;
}

export interface FeatureFlag {
  featureFlagId: string;
  featureCode: string;
  featureLabel: string;
  description?: string;
  isEnabled: boolean;
  createdAt: Date;
}

export interface RoleFeatureAssignment {
  assignmentId: string;
  institutionId: string;
  featureFlagId: string;
  roleCode: string;
  isEnabled: boolean;
  createdAt: Date;
}
