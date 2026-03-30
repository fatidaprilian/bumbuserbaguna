-- Database schema baseline for Bumbuserbaguna multi-tool platform.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE institutions (
  institution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name VARCHAR(200) NOT NULL,
  institution_code VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(institution_id),
  email_address VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role_code VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, email_address)
);

CREATE INDEX users_institution_id_idx ON users(institution_id);

CREATE TABLE documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(institution_id),
  owner_user_id UUID NOT NULL REFERENCES users(user_id),
  assignment_type VARCHAR(50) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  current_status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX documents_institution_id_idx ON documents(institution_id);
CREATE INDEX documents_owner_user_id_idx ON documents(owner_user_id);

CREATE TABLE document_versions (
  document_version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(document_id),
  storage_path TEXT NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  source_checksum VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX document_versions_document_id_idx ON document_versions(document_id);

CREATE TABLE comparison_jobs (
  comparison_job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(institution_id),
  document_id UUID NOT NULL REFERENCES documents(document_id),
  tool_code VARCHAR(50) NOT NULL,
  job_status VARCHAR(30) NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX comparison_jobs_institution_id_idx ON comparison_jobs(institution_id);
CREATE INDEX comparison_jobs_document_id_idx ON comparison_jobs(document_id);
CREATE INDEX comparison_jobs_status_idx ON comparison_jobs(job_status);

CREATE TABLE plagiarism_reports (
  plagiarism_report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(institution_id),
  document_id UUID NOT NULL REFERENCES documents(document_id),
  similarity_score NUMERIC(5,2) NOT NULL,
  requires_manual_review BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX plagiarism_reports_document_id_idx ON plagiarism_reports(document_id);

CREATE TABLE plagiarism_matches (
  plagiarism_match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plagiarism_report_id UUID NOT NULL REFERENCES plagiarism_reports(plagiarism_report_id),
  source_document_id UUID,
  source_label VARCHAR(255) NOT NULL,
  similarity_ratio NUMERIC(5,2) NOT NULL,
  evidence_excerpt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX plagiarism_matches_report_id_idx ON plagiarism_matches(plagiarism_report_id);

CREATE TABLE structure_reports (
  structure_report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(institution_id),
  document_id UUID NOT NULL REFERENCES documents(document_id),
  template_type VARCHAR(50) NOT NULL,
  is_structure_complete BOOLEAN NOT NULL,
  missing_sections JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX structure_reports_document_id_idx ON structure_reports(document_id);

CREATE TABLE report_template_sections (
  report_template_section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type VARCHAR(50) NOT NULL,
  section_code VARCHAR(80) NOT NULL,
  section_title VARCHAR(200) NOT NULL,
  section_order INTEGER NOT NULL,
  is_mandatory BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_type, section_code)
);

CREATE INDEX report_template_sections_template_type_idx ON report_template_sections(template_type);

INSERT INTO report_template_sections (template_type, section_code, section_title, section_order, is_mandatory)
VALUES
  ('makalah', 'PENDAHULUAN', 'Pendahuluan', 1, TRUE),
  ('makalah', 'TINJAUAN_PUSTAKA', 'Tinjauan Pustaka', 2, TRUE),
  ('makalah', 'PEMBAHASAN', 'Pembahasan', 3, TRUE),
  ('makalah', 'KESIMPULAN', 'Kesimpulan', 4, TRUE),
  ('praktikum', 'PENDAHULUAN', 'Pendahuluan', 1, TRUE),
  ('praktikum', 'METODE', 'Metode Praktikum', 2, TRUE),
  ('praktikum', 'HASIL', 'Hasil', 3, TRUE),
  ('praktikum', 'KESIMPULAN', 'Kesimpulan', 4, TRUE),
  ('proposal', 'LATAR_BELAKANG', 'Latar Belakang', 1, TRUE),
  ('proposal', 'TUJUAN', 'Tujuan', 2, TRUE),
  ('proposal', 'METODOLOGI', 'Metodologi', 3, TRUE),
  ('proposal', 'RAB', 'Rencana Anggaran Biaya', 4, TRUE),
  ('skripsi', 'BAB_1', 'Bab 1 Pendahuluan', 1, TRUE),
  ('skripsi', 'BAB_2', 'Bab 2 Tinjauan Pustaka', 2, TRUE),
  ('skripsi', 'BAB_3', 'Bab 3 Metodologi', 3, TRUE),
  ('skripsi', 'BAB_4', 'Bab 4 Hasil dan Pembahasan', 4, TRUE),
  ('skripsi', 'BAB_5', 'Bab 5 Kesimpulan dan Saran', 5, TRUE);

CREATE TABLE presentation_jobs (
  presentation_job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(institution_id),
  document_id UUID NOT NULL REFERENCES documents(document_id),
  target_slide_count INTEGER NOT NULL,
  audience_level VARCHAR(30) NOT NULL,
  job_status VARCHAR(30) NOT NULL,
  output_storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX presentation_jobs_document_id_idx ON presentation_jobs(document_id);
CREATE INDEX presentation_jobs_status_idx ON presentation_jobs(job_status);

CREATE TABLE usage_quotas (
  usage_quota_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(institution_id),
  user_id UUID REFERENCES users(user_id),
  quota_scope VARCHAR(50) NOT NULL,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  used_units INTEGER NOT NULL DEFAULT 0,
  max_units INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX usage_quotas_institution_id_idx ON usage_quotas(institution_id);
CREATE INDEX usage_quotas_user_id_idx ON usage_quotas(user_id);

CREATE TABLE audit_events (
  audit_event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(institution_id),
  actor_user_id UUID REFERENCES users(user_id),
  action_code VARCHAR(100) NOT NULL,
  target_entity_type VARCHAR(80) NOT NULL,
  target_entity_id UUID,
  action_metadata JSONB NOT NULL,
  trace_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_events_institution_id_idx ON audit_events(institution_id);
CREATE INDEX audit_events_actor_user_id_idx ON audit_events(actor_user_id);
CREATE INDEX audit_events_trace_id_idx ON audit_events(trace_id);
