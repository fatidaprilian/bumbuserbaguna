# Phase 2 Week 2 Execution Plan

## Scope
Dokumen ini melanjutkan hasil Week 1 pada `docs/PHASE2_WEEK1_COMPLETION.md`.
Fokus Week 2 adalah eksekusi fitur yang sudah disiapkan, tanpa mengulang infrastruktur yang sudah selesai.

## Timeline Alignment
- Relative timeline: Phase 2 Week 2
- Absolute timeline (roadmap): Week 7
- Referensi roadmap: `docs/roadmap/IMPLEMENTATION_ROADMAP.md`

## Week 2 Objectives
1. Enforce `requireFeatureAccess()` pada endpoint plagiarism dan presentation.
2. Build basic teacher workspace untuk feedback draft.
3. Add basic usage quota controls per role/segment.
4. Lengkapi test coverage untuk alur role-feature enforcement.

## Non-Goals (To Avoid Duplicate Work)
1. Tidak membangun ulang migration runner.
2. Tidak membuat ulang tabel `feature_flags` dan `role_feature_assignments`.
3. Tidak menambah endpoint admin visibility baru (sudah ada di Week 1).
4. Tidak mengubah ulang struktur module transport-service-repository.

## Detailed Implementation Tasks

### A. Feature Access Enforcement
1. Tambahkan guard `requireFeatureAccess()` pada route:
   - plagiarism analysis
   - presentation generation
2. Standardize response code `FORBIDDEN` saat feature tidak aktif.
3. Tambahkan integration test untuk role `admin`, `teacher`, `student`.

### B. Teacher Workspace (Basic)
1. Endpoint draft feedback:
   - `POST /v1/teacher/feedback-drafts`
   - `GET /v1/teacher/feedback-drafts`
2. Gunakan pola modul standar:
   - `repository/`
   - `service/`
   - `transport/`
3. Validasi input via Zod di `shared/validation/`.

### C. Usage Quota (Basic)
1. Tambahkan kontrak quota check di service layer sebelum pemanggilan worker berat.
2. Implementasi repository lookup quota berbasis role.
3. Return error code terstruktur saat quota habis.

## Definition of Done
1. Route plagiarism dan presentation sudah pakai `requireFeatureAccess()`.
2. Teacher workspace draft endpoint minimal berjalan end-to-end.
3. Quota basic aktif untuk minimal satu fitur berat.
4. OpenAPI ter-update untuk endpoint baru.
5. Integration tests untuk skenario allow/deny minimal 6 kasus.

## Development Environment Note
1. Local development wajib pakai `docker-compose.dev.yml`.
2. Konfigurasi production dipisahkan pada `docker-compose.yml` sebagai template deployment, bukan untuk workflow harian developer.
3. Untuk performa Docker Desktop + WSL2, simpan project di filesystem WSL (bukan path Windows mount).

## Execution Checklist
- [ ] Start infra: `docker compose -f docker-compose.dev.yml up -d`
- [ ] Start API: `cd backend && npm run dev`
- [ ] Verify feature access deny/allow by role
- [ ] Verify teacher draft create/list
- [ ] Verify quota rejection response shape
- [ ] Update OpenAPI and docs
