-- Migration: Seed default role feature assignments
-- Created: 2026-04-08
-- Purpose: Initialize default feature visibility for all roles in default institution

-- Get default institution ID (assuming it exists from Phase 1)
-- For dev: seed all features as enabled for all roles by default
-- For prod: seed with restrictive visibility

-- Insert role-feature assignments for default institution (using common UUID for dev)
-- Note: In production, these would be set per-institution by admin

INSERT INTO role_feature_assignments (institution_id, feature_flag_id, role_code, is_enabled)
SELECT
  institutions.institution_id,
  feature_flags.feature_flag_id,
  'admin'::text,
  TRUE
FROM institutions, feature_flags
WHERE institutions.institution_code = 'DEV_INSTITUTION'
ON CONFLICT (institution_id, feature_flag_id, role_code) DO NOTHING;

-- Teachers get most features (except admin-only ones)
INSERT INTO role_feature_assignments (institution_id, feature_flag_id, role_code, is_enabled)
SELECT
  institutions.institution_id,
  feature_flags.feature_flag_id,
  'teacher'::text,
  feature_flags.feature_code NOT IN ('usage_quotas')
FROM institutions, feature_flags
WHERE institutions.institution_code = 'DEV_INSTITUTION'
ON CONFLICT (institution_id, feature_flag_id, role_code) DO NOTHING;

-- Students get public features (document upload, plagiarism check, presentation)
INSERT INTO role_feature_assignments (institution_id, feature_flag_id, role_code, is_enabled)
SELECT
  institutions.institution_id,
  feature_flags.feature_flag_id,
  'student'::text,
  feature_flags.feature_code IN ('document_ingestion', 'plagiarism_check', 'presentation_generation')
FROM institutions, feature_flags
WHERE institutions.institution_code = 'DEV_INSTITUTION'
ON CONFLICT (institution_id, feature_flag_id, role_code) DO NOTHING;
