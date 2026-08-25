# Panduan Share Database Notion ke Integrasi API

## Mengapa Harus Di-share?

Notion memerlukan Anda untuk secara **manual mengizinkan** setiap integrasi untuk mengakses database/page tertentu. Ini fitur keamanan Notion — tanpa share, API tidak bisa baca data.

---

## Cara Share yang Benar (Langkah Detail)

### Langkah 1 — Buka Database di Notion

Buka salah satu database ini di browser:
- **Revenue Bundling**
- **Revenue Bulanan**  
- **Target Instalasi**

### Langkah 2 — Temukan Tombol Share/Connect

Di pojok kanan atas halaman, cari salah satu:

**Opsi A (tampilan database penuh):**
```
Klik tombol "..." (titik tiga) → pilih "Connections"
```

**Opsi B (tampilan dalam page):**
```
Klik tombol "Share" di pojok kanan atas → tab "Connections"
```

**Opsi C (cara termudah):**
```
Klik area kosong di dalam database → tekan tombol titik tiga "..." 
di pojok kanan atas → Add connections
```

### Langkah 3 — Tambahkan Koneksi

1. Klik **"Add connections"** atau **"Connect to"**
2. Di kotak pencarian, ketik: `Reminder`
3. Pilih **"Reminder Kontrak H-1 via WA"**
4. Klik **"Confirm"**

### Langkah 4 — Verifikasi

Setelah share berhasil, di samping nama database akan muncul ikon kecil integrasi.

### Langkah 5 — Ulangi untuk semua database

Lakukan langkah 1–4 untuk:
- ✅ Revenue Bundling
- ✅ Revenue Bulanan
- ✅ Target Instalasi

---

## Jika Tidak Muncul "Connections"

Database mungkin ada di **Teamspace**. Coba ini:

1. Buka **Settings** Notion (klik nama workspace di pojok kiri bawah)
2. Pilih **"Connections"** atau **"Integrations"**
3. Pastikan integrasi **"Reminder Kontrak H-1 via WA"** sudah aktif
4. Kembali ke database → Share → Add connections

---

## Database Arsip (Perlu Dibuat Baru)

Buat database Notion baru untuk menyimpan arsip KPI historis.

### Cara Buat Database Arsip:

1. Di Notion, buat **New Page**
2. Ketik `/database` → pilih **"Table - Full page"**
3. Beri nama: **KPI Arsip**

### Kolom yang Harus Dibuat:

| Nama Kolom | Tipe | Keterangan |
|-----------|------|-----------|
| **Periode** | Title | Otomatis ada, format: 2026-08 |
| **Total Instalasi** | Number | |
| **Target Instalasi** | Number | |
| **Pct Capaian Instalasi** | Number | |
| **Revenue Bundling** | Number | |
| **Target Revenue Bundling** | Number | |
| **Pct Capaian Rev Bundling** | Number | |
| **Revenue Bulanan** | Number | |
| **Target Revenue Bulanan** | Number | |
| **Pct Capaian Rev Bulanan** | Number | |
| **Total Revenue** | Number | |
| **Target Revenue Total** | Number | |
| **Pct Capaian Rev Total** | Number | |
| **Status** | Select | Options: Tercapai, Sebagian, Belum Tercapai |
| **Snapshot Tanggal** | Date | |
| **Catatan** | Text | |

### Cara Tambah Kolom:
1. Klik **"+"** di header tabel
2. Pilih tipe kolom
3. Ketik nama kolom persis seperti di tabel atas

### Ambil Database ID:

Setelah database dibuat:
1. Klik **"Share"** → **"Copy link"**  
2. URL akan berbentuk: `https://notion.so/namaworkspace/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?v=...`
3. Ambil 32 karakter setelah `/` terakhir sebelum `?` — itulah Database ID

Contoh URL:
```
https://notion.so/myworkspace/3c5dcd14e2c880abc123def456789abc?v=...
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              Database ID = 3c5dcd14e2c880abc123def456789abc
```

### Share ke Integrasi:
Setelah dibuat, share juga database **KPI Arsip** ke integrasi "Reminder Kontrak H-1 via WA"

---

## Konfirmasi ke Saya

Setelah semua di-share dan database arsip dibuat, beritahu saya:
1. Apakah ketiga database sudah di-share ✅
2. Database ID Arsip yang baru dibuat
3. Saya akan langsung test koneksi API
