/**
 * Request/Response types for Feature Visibility API
 */

export interface ListFeatureFlagsRequest {
  // No parameters - returns all feature flags
}

export interface ListFeatureFlagsResponse {
  featureFlags: Array<{
    featureCode: string;
    featureLabel: string;
    description?: string;
  }>;
}

export interface GetVisibleFeaturesRequest {
  // No body parameters - uses JWT context for institutionId and roleCode
}

export interface GetVisibleFeaturesResponse {
  visibleFeatures: string[];
}

export interface SetFeatureVisibilityRequest {
  featureCode: string;
  roleCode: string;
  isEnabled: boolean;
}

export interface SetFeatureVisibilityResponse {
  success: boolean;
  message: string;
}
