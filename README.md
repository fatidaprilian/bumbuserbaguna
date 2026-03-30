# bumbuserbaguna

Platform tools akademik untuk siswa SMP, SMA/SMK, dan mahasiswa, mencakup plagiarism check, struktur laporan otomatis, citation helper, dan generator presentasi dari laporan.

## Status

Repository saat ini fokus pada perencanaan awal sebelum coding aplikasi inti.

## Dokumentasi Utama

1. docs/PRODUCT_RESEARCH.md
2. docs/PRODUCT_TOOL_CATALOG.md
3. docs/architecture/SYSTEM_ARCHITECTURE.md
4. docs/security/SECURITY_BASELINE.md
5. docs/database/DATABASE_ARCHITECTURE.md
6. docs/ai/AI_STRATEGY.md
7. docs/roadmap/IMPLEMENTATION_ROADMAP.md
8. docs/README.md

## Prinsip Teknis

1. Modular monolith terlebih dulu, microservices jika ada trigger jelas.
2. Security-by-design untuk upload dokumen akademik.
3. AI Gateway internal agar tidak lock-in satu provider.
4. OpenAPI-first dan quality gate sejak awal.

## Konfigurasi Environment

Gunakan file .env.example sebagai referensi variabel konfigurasi lokal.

## Langkah Lanjut

1. Inisialisasi backend modular (transport, service, repository).
2. Implementasi pipeline upload dan normalisasi dokumen.
3. Implementasi tool basic: plagiarism basic, citation helper, struktur laporan otomatis.
4. Tambahkan generator presentasi dari laporan sebagai wave kedua.
5. Tambahkan AI Gateway untuk semantic workflows tanpa lock-in provider.
