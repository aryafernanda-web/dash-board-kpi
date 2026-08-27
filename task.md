# Task List — KPI Dashboard Build

## Setup
- [x] Buat struktur folder project
- [x] Buat task.md
- [x] Verifikasi dan integrasi Token Notion aktif
- [x] Verifikasi akses 3 database Notion (Form Registrasi, DATA MY COSTUMER METRONET, Arsip)

## Backend (Vercel Serverless Functions)
- [x] `api/notion.js` — Notion API client + resilient query + multi_select support + ID sanitization
- [x] `api/diagnose.js` — Endpoint diagnostik koneksi Notion API
- [x] `api/kpi-current.js` — GET KPI bulan berjalan
- [x] `api/kpi-archive.js` — GET data arsip historis
- [x] `api/kpi-snapshot.js` — POST snapshot manual
- [x] `api/target.js` — GET/PUT target KPI

## Frontend (HTML/CSS/JS)
- [x] `index.html` — Dashboard utama + tombol 🔍 Cek Koneksi + Modal Diagnostik
- [x] Banner error real-time jika live sync gagal
- [x] Live Sync badge dengan penghitung jumlah data transaksi asli Notion
- [x] `css/styles.css` — Desain premium dark mode
- [x] Export Excel & Print-ready report

## Config & Deploy
- [x] `vercel.json` — Konfigurasi routing `/api/diagnose` + cron job snapshot
- [x] `.env.example` — Template environment variables terverifikasi
- [x] `README.md` — Panduan setup dan deploy Vercel akurat
