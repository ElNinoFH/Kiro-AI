# URALA Audit Dashboard
**Audit Kinerja & Workload Analysis — Google Apps Script**

Sistem audit kinerja berbasis Google Form + Google Sheets + Web Dashboard, dirancang untuk perusahaan urala.id.

---

## Isi Repository

| File | Fungsi |
|---|---|
| `Code.gs` | Ditempel ke Google Apps Script. Berisi: generator 4 Google Form, integrasi Spreadsheet master, dan server-side dashboard (`doGet` + `getDashboardData`) |
| `Dashboard.html` | Ditempel sebagai file HTML baru di Apps Script. Berisi UI dashboard lengkap 6 tab dengan login, chart, heatmap, dan tabel data mentah |

---

## Cara Pakai

### 1. Setup Google Apps Script
1. Buka [script.google.com](https://script.google.com) → **New Project**
2. Hapus isi default, tempel seluruh isi **`Code.gs`**
3. Klik ikon `+` di panel kiri → pilih **HTML** → beri nama **`Dashboard`** (persis)
4. Tempel seluruh isi **`Dashboard.html`** ke file tersebut
5. Simpan semua

### 2. Generate Form & Spreadsheet
1. Isi `DASHBOARD_SPREADSHEET_ID = ''` dengan ID spreadsheet master (dari URL `/d/<ID>/edit`) — **atau kosongkan** jika script terikat langsung ke spreadsheet
2. Pilih fungsi **`createAuditForms`** → klik **Run**
3. Authorize → lihat **Execution log** untuk link semua form dan spreadsheet

### 3. Deploy Dashboard
1. Klik **Deploy** → **New deployment** → tipe **Web app**
2. *Execute as:* **Me** | *Who has access:* **Anyone with the link**
3. Klik **Deploy** → buka URL Web App
4. Login dengan password: **`uralakreatif`**

---

## Form yang Dibuat (otomatis)

| Form | Diisi oleh | Frekuensi |
|---|---|---|
| Audit Kinerja - Form Karyawan | Karyawan | 1x per karyawan |
| Audit Kinerja - Form Manager | Manager | 1x per karyawan yang dinilai |
| Audit Kinerja - Form Manager (Penilaian Diri) | Manager | 1x per manager |
| Audit Kinerja - Penilaian Owner terhadap Manager | Owner | 1x per manager |

---

## Fitur Dashboard

- 🔐 **Login** — password protected (`uralakreatif`)
- 📊 **Overview** — stat cards, distribusi beban kerja, capaian OKR, status pengisian
- 👤 **Profil Karyawan** — radar kompetensi (self vs manager), metrik efisiensi, refleksi
- 🏢 **Perbandingan Divisi** — grouped bar, stacked workload, scorecard
- 🗺️ **Heatmap Kompetensi** — 3 mode: Self / Manager / Analisis Gap
- 🧑‍💼 **Asesmen Manager** — radar kepemimpinan (self vs owner), keselarasan visi-misi
- 📋 **Data Mentah** — seluruh isi spreadsheet ditampilkan sebagai tabel

---

## Desain Visual
Mengacu pada identitas visual **urala.id**:
- Warna utama: Golden Yellow `#F0B429`, Rich Black `#111111`, Pure White `#FFFFFF`
- Aksen: Signal Blue `#3B82F6`
- Font: Plus Jakarta Sans + JetBrains Mono
- Level BARS: L1 Rose → L3 **Kuning (brand)** → L5 Hijau

---

## Konfigurasi (di bagian atas `Code.gs`)

```js
var VALUES = ['Agility', 'Growth Mindset', 'Problem Solver'];        // kompetensi karyawan
var LEADERSHIP_COMPETENCIES = ['Leadership / People Management', ...]; // kompetensi manager
var DIVISIONS = ['Creative', 'Digital', 'PR'];                         // daftar divisi
var CREATE_OWNER_FORM = true;                                           // false = tidak buat form owner
var DASHBOARD_SPREADSHEET_ID = '';                                      // ID spreadsheet master
```
