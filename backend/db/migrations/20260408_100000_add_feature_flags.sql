-- Migration: Add feature flags and role-based visibility
-- Created: 2026-04-08
-- Purpose: Enable role-based feature visibility and tool toggles per institution

CREATE TABLE feature_flags (
  feature_flag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code VARCHAR(100) NOT NULL UNIQUE,
  feature_label VARCHAR(255) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_code ON feature_flags(feature_code);

-- Map roles to feature availability per institution
CREATE TABLE role_feature_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(institution_id),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(feature_flag_id),
  role_code VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, feature_flag_id, role_code)
);

CREATE INDEX idx_role_features_institution_role
  ON role_feature_assignments(institution_id, role_code, is_enabled);
CREATE INDEX idx_role_features_feature
  ON role_feature_assignments(feature_flag_id);

-- Advanced: segment-based tool visibility (e.g., SMP vs University)
CREATE TABLE tool_visibility_rules (
  rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(institution_id),
  education_segment VARCHAR(50) NOT NULL,
  feature_code VARCHAR(100) NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, education_segment, feature_code)
);

CREATE INDEX idx_tool_visibility_institution_segment
  ON tool_visibility_rules(institution_id, education_segment);

-- Seed default feature flags (all features enabled)
INSERT INTO feature_flags (feature_code, feature_label, description) VALUES
  ('plagiarism_check', 'Plagiarism Detection', 'Document plagiarism detection'),
  ('plagiarism_v2', 'Advanced Plagiarism (Paraphrase Detection)', 'Semantic plagiarism with paraphrase detection'),
  ('document_ingestion', 'Document Upload', 'Upload and process documents'),
  ('report_structuring', 'Report Structure Validation', 'Check report format compliance'),
  ('presentation_generation', 'Presentation Generation', 'Convert reports to presentations'),
  ('teacher_workspace', 'Teacher Workspace', 'Feedback drafting and feedback management'),
  ('rubric_evaluation', 'Rubric-Based Review', 'Pre-submission rubric compliance checks'),
  ('usage_quotas', 'Quota Enforcement', 'Track and enforce usage limits')
ON CONFLICT (feature_code) DO NOTHING;
