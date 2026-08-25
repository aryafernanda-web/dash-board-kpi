# KPI Dashboard — Notion API

Dashboard KPI real-time berbasis Notion API, dibangun dengan HTML/CSS/JS dan Vercel Serverless Functions.

## Fitur
- 📊 KPI cards: Instalasi & Revenue bulan berjalan vs target
- 📋 Tabel gaya Excel dengan breakdown produk, kecamatan, status
- 📈 Grafik tren historis dari data arsip
- 📸 Snapshot bulanan otomatis ke Notion
- 🎯 Target KPI bisa diubah kapan saja
- 🖨️ Export PDF & Print-ready

---

## Langkah Setup

### 1. Share Database ke Integrasi Notion

> ⚠️ **WAJIB dilakukan sebelum deploy**

Untuk setiap database (Revenue Bundling, Revenue Bulanan, Target Instalasi):
1. Buka database di Notion
2. Klik `...` (titik tiga) → **Connections** → **Add connections**
3. Pilih integrasi API Anda

### 2. Buat Database Arsip di Notion

Buat database baru di Notion dengan kolom:
| Kolom | Tipe |
|-------|------|
| Periode | Title |
| Total Instalasi | Number |
| Target Instalasi | Number |
| Pct Capaian Instalasi | Number |
| Total Revenue | Number |
| Target Revenue | Number |
| Pct Capaian Revenue | Number |
| Status | Select (Tercapai / Sebagian / Belum Tercapai) |
| Snapshot Tanggal | Date |
| Catatan | Text |

Setelah dibuat, share ke integrasi dan copy Database ID-nya.

### 3. Setup di GitHub

```bash
git init
git add .
git commit -m "Initial KPI Dashboard"
git remote add origin https://github.com/USERNAME/kpi-dashboard.git
git push -u origin main
```

### 4. Deploy ke Vercel

1. Buka https://vercel.com → **New Project**
2. Import repository dari GitHub
3. Di **Environment Variables**, isi:
   - `NOTION_API_TOKEN` = token integrasi Notion
   - `NOTION_DB_REVENUE_BUNDLING` = `3c5dcd14e2c8806aa1ffdd7960c4bc50`
   - `NOTION_DB_REVENUE_BULANAN`  = `3c5dcd14e2c88034a9e9c4274accf87d`
   - `NOTION_DB_TARGET_INSTALASI` = `3c5dcd14e2c880c79b5cda640a86be75`
   - `NOTION_DB_ARSIP` = ID database arsip yang baru dibuat
   - `DEFAULT_TARGET_INSTALASI` = `300`
   - `DEFAULT_TARGET_REVENUE` = `1500000000`
4. Klik **Deploy**

### 5. Verifikasi Nama Kolom

Buka `/api/kpi-current` di browser. Jika ada error kolom tidak ditemukan,
sesuaikan nama kolom di **Environment Variables** Vercel:
- `COL_RB_TANGGAL`, `COL_RB_REVENUE`, dll.

---

## Snapshot Otomatis

Dashboard menggunakan **Vercel Cron Jobs** (file `vercel.json`):
- Cron berjalan setiap tanggal 1, pukul 00:01 WIB (17:01 UTC)
- Otomatis menyimpan data bulan sebelumnya ke database arsip

> ⚠️ Vercel Cron Jobs membutuhkan **Vercel Pro Plan**.
> Jika Free Plan: gunakan tombol **"Simpan Snapshot"** manual di dashboard.

---

## Penyesuaian Nama Kolom

Jika nama kolom Notion Anda berbeda, ubah di file `.env` atau Vercel Environment Variables:

```
COL_RB_TANGGAL=Tanggal Aktivasi    # nama kolom tanggal di Revenue Bundling
COL_RB_REVENUE=Total Revenue       # nama kolom revenue di Revenue Bundling
COL_RB_STATUS=Status               # nama kolom status (NEW/EXIST)
COL_RB_PRODUK=Produk               # nama kolom produk
COL_RB_KECAMATAN=Kecamatan        # nama kolom kecamatan
```

---

## Struktur File

```
kpi-dashboard/
├── index.html              # Dashboard utama
├── css/
│   └── styles.css          # Desain premium dark mode
├── js/
│   └── dashboard.js        # Logic frontend + Chart.js
├── api/
│   ├── notion.js           # Notion API client & aggregator
│   ├── kpi-current.js      # GET KPI bulan berjalan
│   ├── kpi-archive.js      # GET data arsip historis
│   ├── kpi-snapshot.js     # POST snapshot ke Notion
│   └── target.js           # GET/POST target KPI
├── vercel.json             # Konfigurasi Vercel + Cron
├── package.json
└── .env.example            # Template environment variables
```
