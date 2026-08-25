# Task List — KPI Dashboard Build

## Setup
- [x] Buat struktur folder project
- [x] Buat task.md
- [ ] ⚠️ User perlu share database Notion ke integrasi API

## Backend (Vercel Serverless Functions)
- [x] `api/notion.js` — Notion API client + aggregator
- [x] `api/kpi-current.js` — GET KPI bulan berjalan
- [x] `api/kpi-archive.js` — GET data arsip historis
- [x] `api/kpi-snapshot.js` — POST snapshot manual
- [x] `api/target.js` — GET/PUT target KPI

## Frontend (HTML/CSS/JS)
- [x] `index.html` — Dashboard utama
- [x] `css/styles.css` — Desain premium dark mode
- [x] `js/dashboard.js` — Logic + Chart.js + fetch API (termasuk chart & export)

## Config & Deploy
- [x] `vercel.json` — Konfigurasi routing + cron job snapshot
- [x] `.env.example` — Template environment variables
- [x] `README.md` — Panduan setup dan deploy

## Pending (menunggu aksi user)
- [ ] User share 3 database ke integrasi Notion
- [ ] User buat database Arsip di Notion
- [ ] User deploy ke Vercel + set environment variables
- [ ] Test koneksi API dan verifikasi nama kolom
