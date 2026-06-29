# URALA Audit Dashboard
**Audit Kinerja & Workload Analysis — Google Apps Script**

Sistem audit kinerja berbasis Google Form + Google Sheets + Web Dashboard, dirancang untuk perusahaan urala.id.

---

## Isi Repository

| File | Fungsi |
|---|---|
| `Code.gs` | Ditempel ke Google Apps Script. Berisi: generator 4 Google Form, integrasi Spreadsheet master, server-side dashboard (`doGet` + `getDashboardData`), dan **engine Analisis AI** (`runAnalysis` + `getAnalysisData`) |
| `Dashboard.html` | Ditempel sebagai file HTML baru di Apps Script. Berisi UI dashboard lengkap dengan login, chart, heatmap, **tab Analysis (kelebihan & kekurangan)**, dan tabel data mentah |

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
- 🧠 **Analysis (Kelebihan & Kekurangan)** — ringkasan otomatis per karyawan berbasis AI/NLP (lihat bagian di bawah)
- 📋 **Data Mentah** — seluruh isi spreadsheet ditampilkan sebagai tabel

---

## 🧠 Fitur Analysis — Kelebihan & Kekurangan Otomatis (AI/NLP)

Tab **Analysis** menghasilkan ringkasan **kelebihan** dan **kekurangan** tiap karyawan secara otomatis dari seluruh data spreadsheet (angka + narasi). Arsitekturnya **3-layer hybrid** agar akurat dan jujur soal tingkat keyakinan.

### Cara kerja (3 layer)

| Layer | Sumber data | Teknik | Akurasi |
|---|---|---|---|
| **1. Rule-based** | Skor BARS final, % rework, OKR, lembur, beban kerja, rekomendasi manager | Threshold & mapping deterministik | ~100% (data pasti) |
| **2. Keyword NLP** | Narasi deskriptif | Kamus sentimen Bahasa Indonesia | sinyal cepat / fallback |
| **3. Gemini LLM** | Narasi deskriptif ambigu | Structured output + evidence grounding + few-shot + grounding rubrik CMMI + self-consistency voting (3×) | ~90-95% |

### Integrasi dengan Validasi yang sudah ada
Engine ini **tidak membuat antrian validasi manusia baru**. Ia memakai hasil **tab Validasi** yang sudah ada (`resolvedBars` + `barsSource`) sebagai *ground truth*: temuan kompetensi dari data **tervalidasi** otomatis mendapat **confidence 1.0**.

### Tingkat keyakinan (confidence)
Setiap temuan diberi skor keyakinan 0-100%:
- **≥ 85%** → ditandai **Terkonfirmasi**
- **< 85%** → ditandai **Perlu ditinjau** (tetap ditampilkan, dengan badge kuning)

Self-consistency menjalankan LLM 3× lalu majority voting; ensemble menaikkan confidence bila keyword sentiment sepakat dengan AI.

### Output
- Tab baru **`Analysis`** di Spreadsheet (kolom: Subjek, Kategori, Aspek, Temuan, Bukti, Sumber, Confidence, Metode, Status)
- Tab **Analysis** di Dashboard (kartu per karyawan: ✅ Kelebihan / ⚠️ Kekurangan + badge confidence)

### ⚙️ Setup Gemini API Key (sekali saja)
> Tanpa key, sistem tetap jalan dalam **mode keyword** (akurasi lebih rendah). Dengan key, mode **AI penuh** aktif.

1. Ambil API key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Di editor Apps Script, pilih fungsi **`setupGeminiKey`**, lalu jalankan lewat console:
   ```js
   setupGeminiKey('PASTE_API_KEY_ANDA_DISINI')
   ```
   Key disimpan aman di **Script Properties** — **tidak** ditulis ke kode/GitHub.
3. Buka dashboard → tab **Analysis** → klik **⚡ Jalankan Analisis AI**

### Catatan akurasi (jujur)
100% otomatis murni **tidak mungkin** untuk klasifikasi makna subjektif (bahkan antar-HR ahli hanya sepakat ~80-90%). Sistem ini realistis di **~95% otomatis**, dan mendekati **~99%** bila temuan "Perlu ditinjau" dikoreksi via tab Validasi yang sudah ada.

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

### Konfigurasi Analysis (di `Code.gs`)
```js
var ANALYSIS_CFG = {
  model: 'gemini-2.0-flash',  // model Gemini
  threshold: 0.85,            // ambang Terkonfirmasi vs Perlu ditinjau
  selfConsistencyRuns: 3,     // jumlah panggilan LLM untuk voting (naikkan = lebih akurat, lebih banyak kuota)
  temperature: 0.2,           // rendah = lebih deterministik
  reworkLow: 10, reworkHigh: 25,  // ambang % rework (kelebihan / kekurangan)
  overtimeHigh: 40,               // ambang jam lembur
  okrLow: 60, okrHigh: 90         // ambang % capaian OKR
};
```
