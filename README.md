# KPI Dashboard — Notion API

Dashboard KPI real-time berbasis Notion API, dibangun dengan HTML/CSS/JS dan Vercel Serverless Functions.

## Fitur
- 📊 **KPI cards**: Instalasi & Revenue bulan berjalan vs target
- 📋 **Tabel gaya Excel**: Live data transaksi instalasi & bundling
- 📈 **Grafik tren historis**: Akumulasi performa dari data arsip
- 📸 **Snapshot bulanan**: Simpan arsip langsung ke Notion
- 🎯 **Target KPI fleksibel**: Atur target langsung dari dashboard
- 🔍 **Diagnostik Koneksi**: Uji koneksi Notion secara realtime langsung dari tombol dashboard
- 🖨️ **Export Excel & Print**: Unduh spreadsheet format resmi

---

## Langkah Setup & Deploy ke Vercel

### 1. Share Database ke Integrasi Notion
Buka masing-masing database di Notion:
1. **Form Registrasi (1)**
2. **DATA MY COSTUMER METRONET**
3. **Arsip Rekapitulasi Historis**

Di pojok kanan atas database:
- Klik `...` (titik tiga) ➜ **Connections** ➜ **Add connections** ➜ Pilih integrasi Anda (misal: `maps` atau nama integrasi yang dibuat).

### 2. Setup Environment Variables di Vercel
Buka dashboard project Anda di **Vercel** ➜ **Settings** ➜ **Environment Variables**, tambahkan:

| Name | Value | Keterangan |
| :--- | :--- | :--- |
| `NOTION_API_TOKEN` | `ntn_...` (Token integrasi Notion Anda) | Token integrasi Notion |
| `NOTION_DB_REGISTRASI` | `320dcd14e2c88034999ffc33cfe28458` | ID Form Registrasi |
| `NOTION_DB_CUSTOMER` | `29edcd14e2c880ddb393dc9f54758a18` | ID Data Customer Metronet |
| `NOTION_DB_ARCHIVE` | `3c7dcd14e2c88022aad6c86491e15f9f` | ID Database Arsip |
| `DEFAULT_TARGET_INSTALASI` | `20` | Target unit bulanan |
| `DEFAULT_TARGET_REV_BUNDLING` | `2000000` | Target rev bundling |
| `DEFAULT_TARGET_REV_BULANAN` | `50000000` | Target rev bulanan |

> 💡 *Sistem juga mendukung alias lama seperti `NOTION_DB_TARGET_INSTALASI`, `NOTION_DB_REVENUE_BUNDLING`, dan `NOTION_DB_ARSIP`.*

### 3. Diagnosa Koneksi
Setelah deploy, Anda dapat mengklik tombol **🔍 Cek Koneksi** di header dashboard atau mengakses endpoint:
```
https://NAMA-PROJECT-ANDA.vercel.app/api/diagnose
```
Sistem akan memeriksa status token dan ketiga database serta memberikan rekomendasi langsung jika ada yang belum terhubung.

---

## Struktur File
```
kpi-dashboard/
├── index.html          # Dashboard UI & Logic
├── css/
│   └── styles.css      # Styling pendukung
├── js/
│   └── dashboard.js    # Script frontend modular
├── api/
│   ├── notion.js       # Notion API Client & Aggregator
│   ├── kpi-current.js  # GET KPI bulan berjalan
│   ├── kpi-archive.js  # GET data arsip historis
│   ├── kpi-snapshot.js # POST snapshot ke Notion
│   ├── target.js       # GET/POST target KPI
│   └── diagnose.js     # GET diagnostik koneksi Notion
├── vercel.json         # Konfigurasi rewrite & cron
├── package.json
└── .env.example
```
