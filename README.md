# bumbuserbaguna

Platform cek plagiarisme untuk siswa SMP, SMA/SMK, dan mahasiswa dengan pendekatan enterprise-grade dari tahap perencanaan.

## Status

Repository saat ini fokus pada perencanaan awal sebelum coding aplikasi inti.

## Dokumentasi Utama

1. docs/PRODUCT_RESEARCH.md
2. docs/architecture/SYSTEM_ARCHITECTURE.md
3. docs/security/SECURITY_BASELINE.md
4. docs/database/DATABASE_ARCHITECTURE.md
5. docs/ai/AI_STRATEGY.md
6. docs/roadmap/IMPLEMENTATION_ROADMAP.md
7. docs/README.md

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
3. Implementasi lexical similarity engine sebagai baseline.
4. Tambahkan AI Gateway untuk semantic similarity tahap berikutnya.
