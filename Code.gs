/**
 * =============================================================================
 *  AUDIT KINERJA & WORKLOAD ANALYSIS
 *  Cara pakai:
 *   1. Buka https://script.google.com -> New Project
 *   2. Hapus isi default, tempel SELURUH kode ini ke editor.
 *   3. Simpan, pilih fungsi createAuditForms, klik Run.
 *   4. Saat diminta, klik Authorize / Allow.
 *   5. Buka Execution log untuk melihat link Form + Spreadsheet.
 *
 *  Yang dibuat:
 *   - 1 Spreadsheet master (semua respons masuk ke tab masing-masing)
 *   - Form Karyawan     : workload self-report + self-assessment BARS
 *   - Form Manager      : beban kerja + OKR + rubrik BARS + cross-reference
 *   - Form Mgr (Self)   : penilaian diri manager, cukup isi 1x per manager
 *   - Form Owner        : penilaian owner ke manager (opsional, lihat flag di bawah)
 * =============================================================================
 */

// ---- KONFIGURASI — ubah sesuai kebutuhan ----

var VALUES = ['Agility', 'Growth Mindset', 'Problem Solver'];

var LEADERSHIP_COMPETENCIES = [
  'Leadership / People Management',
  'Decision Making',
  'Strategic & Visi-Misi Alignment',
  'Problem Solving & Delegasi'
];

// Behavioral Self-Reflection Statements (orang pertama), per kompetensi.
// Urutan array = jenjang kematangan CMMI Level 1..5.
// L1-L2 dikemas humanis & tidak menghakimi; L3-L5 berupa aksi konkret & terukur.
var COMPETENCY_BARS = {
  'Agility': [
    'Saya biasanya butuh waktu untuk menyesuaikan diri ketika ada perubahan mendadak, dan masih mencari cara yang pas.',
    'Saya bisa menyesuaikan diri dengan perubahan, biasanya setelah ada arahan atau ketika situasi sudah mendesak.',
    'Saya menyesuaikan rencana kerja secara mandiri saat prioritas berubah, mengikuti langkah yang sudah terbiasa dijalankan.',
    'Saya memantau tanda-tanda perubahan lebih awal dan menimbang dampaknya, sehingga bisa menyesuaikan target secara terukur.',
    'Saya mengantisipasi perubahan sebelum terjadi, menyiapkan rencana cadangan, dan membantu rekan lain ikut beradaptasi.'
  ],
  'Growth Mindset': [
    'Saya masih membangun kebiasaan mencari masukan, dan kadang merasa kurang nyaman saat menerima kritik.',
    'Saya terbuka pada masukan ketika diberikan, dan mulai mencoba hal baru meski lebih banyak atas dorongan orang lain.',
    'Saya secara rutin meminta umpan balik dan menerapkannya pada cara kerja sehari-hari.',
    'Saya menetapkan target belajar yang spesifik, melacak kemajuannya, dan mengevaluasi hasilnya secara berkala.',
    'Saya menjadikan pembelajaran bagian dari rutinitas, berbagi ilmu dengan tim, dan mendorong budaya berkembang bersama.'
  ],
  'Problem Solver': [
    'Saya masih belajar membedah masalah, dan biasanya mencari bantuan lebih dulu sebelum menyelesaikannya sendiri.',
    'Saya bisa menyelesaikan masalah yang sudah familiar, meski untuk masalah baru cenderung menunggu arahan.',
    'Saya menelusuri akar masalah dengan langkah yang terstruktur sebelum mengambil solusi.',
    'Saya menggunakan data untuk memvalidasi akar masalah dan mengukur apakah solusi yang diambil benar-benar efektif.',
    'Saya mencegah masalah berulang dengan memperbaiki prosesnya, lalu membagikan solusi itu agar dipakai tim.'
  ],
  'Leadership / People Management': [
    'Saya masih menemukan ritme dalam mengarahkan tim, dan sebagian besar perhatian masih pada pekerjaan teknis.',
    'Saya mengarahkan tim terutama saat ada masalah muncul, dan belum punya pola pembinaan yang rutin.',
    'Saya melakukan pembinaan dan komunikasi tim secara rutin dengan cara yang terstandar, misalnya 1-on-1 berkala.',
    'Saya memantau beban kerja dan perkembangan tiap anggota dengan indikator yang jelas, lalu menindaklanjutinya.',
    'Saya aktif mengembangkan kapasitas tim, menyiapkan kader penerus, dan terus memperbaiki cara kerja tim.'
  ],
  'Decision Making': [
    'Saya masih membangun keyakinan dalam mengambil keputusan, dan cenderung menundanya sampai ada kepastian.',
    'Saya mengambil keputusan saat dibutuhkan, lebih banyak berdasarkan pengalaman atau intuisi sesaat.',
    'Saya mengambil keputusan mengikuti pertimbangan dan langkah yang konsisten.',
    'Saya mendasarkan keputusan pada data dan mengevaluasi hasilnya untuk perbaikan berikutnya.',
    'Saya membangun kerangka pengambilan keputusan yang bisa dipakai tim, dan mendelegasikan keputusan secara tepat.'
  ],
  'Strategic & Visi-Misi Alignment': [
    'Saya masih menghubungkan pekerjaan sehari-hari dengan visi-misi perusahaan, dan kadang mendahulukan tugas teknis.',
    'Saya memahami visi-misi perusahaan dan menyampaikannya ke tim pada momen tertentu.',
    'Saya secara rutin menurunkan visi-misi menjadi target kerja tim yang konkret.',
    'Saya mengukur sejauh mana aktivitas tim selaras dengan tujuan strategis, dan menyesuaikannya bila melenceng.',
    'Saya memastikan setiap keputusan tim mengacu pada visi-misi, dan ikut menyempurnakan strategi bersama pimpinan.'
  ],
  'Problem Solving & Delegasi': [
    'Saya masih belajar mendelegasikan, dan sering mengerjakan banyak hal sendiri agar merasa lebih tenang.',
    'Saya mendelegasikan tugas saat beban sedang tinggi, meski pembagiannya belum selalu merata.',
    'Saya mendelegasikan tugas sesuai kapasitas anggota dengan arahan yang jelas.',
    'Saya memantau hasil delegasi dengan ukuran yang jelas dan memberi umpan balik berdasarkan itu.',
    'Saya mengembangkan anggota lewat delegasi bertahap, sehingga tim makin mandiri menyelesaikan masalah.'
  ]
};

// Set generik (fallback) bila kompetensi tidak ada di peta di atas.
var DEFAULT_BARS = [
  'Saya masih membangun cara kerja yang tetap di area ini, dan sering menyesuaikan secara situasional.',
  'Saya sudah bisa menjalankannya, meski masih bergantung pada arahan dan belum selalu konsisten.',
  'Saya menjalankannya secara konsisten mengikuti proses atau standar yang jelas.',
  'Saya memantau dan mengukur hasilnya dengan indikator yang jelas.',
  'Saya proaktif memperbaiki cara kerja dan membantu orang lain berkembang di area ini.'
];

// Ambil daftar pernyataan untuk kompetensi tertentu.
// subject 'self' -> sudut pandang "Saya"; 'other' -> diubah ke "Yang bersangkutan".
function barsLevelsFor(competency, subject) {
  var base = COMPETENCY_BARS[competency] || DEFAULT_BARS;
  if (subject === 'self') { return base; }
  return base.map(function (s) { return s.replace(/^Saya\b/, 'Yang bersangkutan'); });
}

var DIVISIONS = ['Creative', 'Digital', 'PR'];

// Ubah ke false jika tidak ingin membuat form Owner
var CREATE_OWNER_FORM = true;



// ---- FUNGSI UTAMA ------------------------------------------------------------

function createAuditForms() {
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var ss = SpreadsheetApp.create('Audit Kinerja - Workload Analysis (' + stamp + ')');
  var ssId = ss.getId();

  var forms = [];
  forms.push(buildEmployeeForm(ssId));
  forms.push(buildManagerForm(ssId));
  forms.push(buildManagerSelfForm(ssId));
  if (CREATE_OWNER_FORM) {
    forms.push(buildOwnerToManagerForm(ssId));
  }

  Logger.log('================ SELESAI ================');
  Logger.log('SPREADSHEET MASTER: ' + ss.getUrl());
  Logger.log('-----------------------------------------');
  for (var i = 0; i < forms.length; i++) {
    Logger.log((i + 1) + '. ' + forms[i].getTitle());
    Logger.log('   Link isi  : ' + forms[i].getPublishedUrl());
    Logger.log('   Link edit : ' + forms[i].getEditUrl());
  }
  Logger.log('=========================================');
}



// ---- HELPER UMUM ------------------------------------------------------------

function linkToSheet(form, ssId) {
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);
  form.setCollectEmail(false);
  form.setProgressBar(true);
  return form;
}

function addPage(form, title, desc) {
  var pb = form.addPageBreakItem().setTitle(title);
  if (desc) { pb.setHelpText(desc); }
  return pb;
}

function addEmployeeIdentity(form) {
  form.addTextItem().setTitle('Nama lengkap').setRequired(true);
  form.addListItem().setTitle('Divisi').setChoiceValues(DIVISIONS).setRequired(true);
  form.addTextItem().setTitle('Posisi / Jabatan').setRequired(true);
  form.addTextItem().setTitle('Nama atasan langsung').setRequired(true);
  form.addTextItem().setTitle('Lama bekerja (contoh: 1 tahun 6 bulan)').setRequired(false);
}

function addManagerEvaluatesIdentity(form) {
  form.addTextItem().setTitle('Nama manager (penilai)').setRequired(true);
  form.addListItem().setTitle('Divisi').setChoiceValues(DIVISIONS).setRequired(true);
  form.addTextItem().setTitle('Nama karyawan yang dinilai — isi 1 respons per karyawan').setRequired(true);
  form.addTextItem().setTitle('Posisi / Jabatan karyawan yang dinilai').setRequired(true);
}

function addBarsBlock(form, competency, subject) {
  var subjekLabel = (subject === 'self') ? 'diri Anda saat ini' : 'yang bersangkutan';

  form.addSectionHeaderItem()
    .setTitle('Kompetensi: ' + competency)
    .setHelpText('Tidak ada jawaban benar atau salah. Pilih pernyataan yang paling jujur menggambarkan kondisi saat ini.');

  form.addMultipleChoiceItem()
    .setTitle('Pernyataan mana yang paling menggambarkan ' + subjekLabel + ' untuk kompetensi ' + competency + '?')
    .setChoiceValues(barsLevelsFor(competency, subject))
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Ceritakan 1 contoh situasi nyata yang menggambarkan pilihan di atas (boleh singkat).')
    .setRequired(true);

  if (subject === 'self') {
    form.addParagraphTextItem()
      .setTitle('Menurut Anda, dukungan atau langkah apa yang akan membantu Anda berkembang lebih jauh di area ini?')
      .setRequired(false);
  } else {
    form.addParagraphTextItem()
      .setTitle('Area pengembangan apa yang menurut Anda paling bermanfaat untuk yang bersangkutan di kompetensi ini?')
      .setRequired(false);
  }
}

function addMaterialQuestion(form) {
  form.addParagraphTextItem()
    .setTitle('Apakah informasi / data / aset / brief yang diterima dari pihak lain biasanya lengkap dan akurat, atau sering perlu klarifikasi / revisi ulang? Berikan contoh.')
    .setRequired(false);
}



// =============================================================================
//  FORM KARYAWAN — workload self-report + self-assessment BARS
// =============================================================================

function buildEmployeeForm(ssId) {
  var form = FormApp.create('Audit Kinerja - Form Karyawan');
  form.setTitle('Audit Kinerja - Form Karyawan');
  form.setDescription(
    'Form ini menggabungkan pemetaan beban kerja dan penilaian diri kompetensi. ' +
    'Mohon diisi sejujurnya. Estimasi waktu pengisian: 15-20 menit.'
  );

  // Identitas
  addEmployeeIdentity(form);

  // Bagian 1
  addPage(form, 'Bagian 1 - Tugas & Rutinitas', 'Gambaran pekerjaan harian Anda.');
  form.addParagraphTextItem().setTitle('Tugas dan tanggung jawab utama Anda dalam posisi ini').setRequired(true);
  form.addParagraphTextItem().setTitle('Uraikan rutinitas harian Anda dari awal hingga akhir jam kerja').setRequired(true);
  form.addParagraphTextItem().setTitle('Tugas rutin mingguan, bulanan, atau kuartalan').setRequired(false);
  form.addParagraphTextItem().setTitle('Tugas tambahan di luar job desc yang sering Anda kerjakan (sebutkan)').setRequired(false);

  // Bagian 2
  addPage(form, 'Bagian 2 - Alokasi Waktu', 'Bagaimana waktu kerja Anda terdistribusi.');
  form.addParagraphTextItem().setTitle('Rata-rata waktu (menit/jam) untuk menyelesaikan tiap tugas utama').setRequired(true);
  form.addTextItem().setTitle('Pekerjaan yang paling banyak memakan waktu').setRequired(false);
  form.addTextItem().setTitle('Estimasi persentase waktu untuk tugas administratif vs teknis/utama').setRequired(false);
  form.addTextItem().setTitle('Waktu rapat (meeting) per minggu').setRequired(false);
  form.addParagraphTextItem().setTitle('Aplikasi, perangkat lunak, atau peralatan yang Anda gunakan').setRequired(false);

  // Bagian 3
  addPage(form, 'Bagian 3 - Dependensi & Hambatan', 'Hal-hal yang memengaruhi kelancaran kerja Anda.');
  form.addParagraphTextItem().setTitle('Apakah tugas Anda bergantung pada hasil, persetujuan, atau data pihak lain? Jelaskan').setRequired(false);
  form.addTextItem().setTitle('Jika ya, seberapa sering menunggu dan rata-rata lama waktu tunggunya').setRequired(false);
  form.addParagraphTextItem().setTitle('Tugas yang sering lebih lama dari seharusnya dan faktor penyebabnya').setRequired(false);
  form.addMultipleChoiceItem()
    .setTitle('Apakah deadline yang diberikan saat ini realistis dan cukup?')
    .setChoiceValues(['Selalu realistis', 'Umumnya realistis', 'Kadang tidak realistis', 'Sering tidak realistis'])
    .setRequired(false);
  form.addParagraphTextItem().setTitle('Pekerjaan yang sering tertunda atau tidak selesai hari yang sama, dan alasannya').setRequired(false);
  form.addParagraphTextItem().setTitle('Langkah atau proses yang bisa disederhanakan agar lebih cepat dan efisien').setRequired(false);
  addMaterialQuestion(form);


  // Bagian 4
  addPage(form, 'Bagian 4 - Target & Realisasi (OKR/SMART)', 'Pencapaian kuantitatif Anda periode ini.');
  form.addParagraphTextItem().setTitle('Target kerja kuantitatif (angka / persentase / jumlah) periode ini').setRequired(true);
  form.addParagraphTextItem().setTitle('Hasil aktual yang sudah Anda capai untuk target tersebut').setRequired(true);
  form.addParagraphTextItem().setTitle('Jika ada selisih target vs aktual, apa penyebabnya menurut Anda?').setRequired(false);
  form.addTextItem().setTitle('Persentase pekerjaan sebulan terakhir yang harus direvisi ulang (rework)').setRequired(false);
  form.addParagraphTextItem().setTitle('Pada bagian proses apa kesalahan biasanya terjadi?').setRequired(false);
  form.addTextItem().setTitle('Total jam lembur sebulan atau kuartal terakhir (sebutkan jumlah jam)').setRequired(false);

  // Bagian 5 — Self-Assessment BARS
  addPage(form,
    'Bagian 5 - Penilaian Diri (Self-Assessment Kompetensi)',
    'Bagian ini adalah refleksi diri, bukan ujian. Pilih pernyataan yang paling jujur menggambarkan diri Anda apa adanya. Tidak ada jawaban yang benar atau salah, dan jawaban ini dipakai untuk mendukung pengembangan, bukan menghakimi.'
  );
  for (var i = 0; i < VALUES.length; i++) {
    addBarsBlock(form, VALUES[i], 'self');
  }
  form.addSectionHeaderItem().setTitle('Penutup');
  form.addParagraphTextItem().setTitle('Kompetensi mana yang paling ingin Anda kembangkan? Mengapa?').setRequired(false);

  return linkToSheet(form, ssId);
}



// =============================================================================
//  FORM MANAGER — beban kerja + OKR + rubrik BARS + cross-reference
//  Diisi 1 respons per karyawan yang dinilai.
// =============================================================================

function buildManagerForm(ssId) {
  var form = FormApp.create('Audit Kinerja - Form Manager');
  form.setTitle('Audit Kinerja - Form Manager');
  form.setDescription(
    'Form ini berisi analisis beban kerja karyawan, pembangunan rubrik kompetensi, dan penilaian karyawan (cross-reference). ' +
    'ISI 1 RESPONS UNTUK SETIAP KARYAWAN yang Anda nilai. ' +
    'Penilaian diri Anda sebagai manager ada di form terpisah (Form Manager - Penilaian Diri).'
  );

  addManagerEvaluatesIdentity(form);

  // Bagian 1 — Beban Kerja
  addPage(form, 'Bagian 1 - Beban Kerja & Tugas Karyawan', 'Penilaian Anda atas beban kerja karyawan ini.');
  form.addParagraphTextItem().setTitle('Tugas pokok dan tanggung jawab utama yang Anda delegasikan ke karyawan ini').setRequired(true);
  form.addParagraphTextItem().setTitle('Tugas tambahan (ad-hoc) di luar job desc yang sering diberikan dan seberapa sering').setRequired(false);
  form.addParagraphTextItem().setTitle('Berikan 1-2 contoh konkret tugas ad-hoc tersebut dan dampaknya ke tugas utama').setRequired(false);
  form.addParagraphTextItem().setTitle('Waktu ideal penyelesaian tugas utama menurut standar ekspektasi Anda (per tugas)').setRequired(false);
  form.addMultipleChoiceItem()
    .setTitle('Bagaimana Anda menilai beban kerja karyawan ini saat ini?')
    .setChoiceValues(['Sangat ringan', 'Ringan', 'Pas/seimbang', 'Berat', 'Sangat berat (overload)'])
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Seberapa sering karyawan ini lembur untuk memenuhi tenggat?')
    .setChoiceValues(['Tidak pernah', 'Jarang', 'Kadang-kadang', 'Sering', 'Hampir selalu'])
    .setRequired(false);
  form.addParagraphTextItem().setTitle('Hambatan atau tantangan terbesar yang membuat pekerjaan tertunda atau meleset').setRequired(false);
  form.addParagraphTextItem().setTitle('Proses yang memperlambat kerja: approval, data tim lain, masalah sistem').setRequired(false);
  form.addMultipleChoiceItem()
    .setTitle('Apakah karyawan sudah punya skill dan alat pendukung yang memadai?')
    .setChoiceValues(['Ya, sepenuhnya', 'Sebagian besar', 'Sebagian', 'Belum memadai'])
    .setRequired(false);
  form.addParagraphTextItem().setTitle('Tugas rutin yang bisa disederhanakan, dihilangkan, atau diotomatisasi').setRequired(false);
  form.addParagraphTextItem().setTitle('Tugas yang seharusnya dikerjakan peran atau departemen lain tapi masih dikerjakan karyawan ini').setRequired(false);
  form.addMultipleChoiceItem()
    .setTitle('Jika ada proyek baru, apakah kapasitas karyawan ini masih memungkinkan?')
    .setChoiceValues(['Masih sangat memungkinkan', 'Masih memungkinkan', 'Terbatas', 'Tidak memungkinkan'])
    .setRequired(false);
  addMaterialQuestion(form);


  // Bagian 2 — OKR / SMART
  addPage(form, 'Bagian 2 - OKR / SMART', 'Target dan realisasi kuantitatif karyawan ini.');
  form.addParagraphTextItem().setTitle('Objective utama tim atau individu periode ini (harus spesifik)').setRequired(true);
  form.addParagraphTextItem().setTitle('Target kuantitatif sebagai ukuran keberhasilan objective tersebut').setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Dengan sumber daya saat ini, apakah target realistis dicapai?')
    .setChoiceValues(['Sangat realistis', 'Realistis', 'Menantang', 'Tidak realistis'])
    .setRequired(false);
  form.addParagraphTextItem().setTitle('Bagaimana target ini terkait tujuan strategis divisi atau perusahaan?').setRequired(false);
  form.addTextItem().setTitle('Kapan target ini harus tercapai?').setRequired(false);
  form.addParagraphTextItem().setTitle('Hasil aktual yang sudah dicapai untuk tiap key result').setRequired(false);
  form.addTextItem().setTitle('Rata-rata time-to-completion aktual vs waktu yang direncanakan').setRequired(false);
  form.addTextItem().setTitle('Persentase rework atau error rate pada output periode ini').setRequired(false);
  form.addTextItem().setTitle('Total jam lembur tercatat (bukan estimasi frekuensi)').setRequired(false);
  form.addParagraphTextItem().setTitle('Apakah lembur berkorelasi dengan kenaikan output, atau indikasi inefisiensi proses?').setRequired(false);
  form.addParagraphTextItem().setTitle('Apakah output tinggi dicapai dengan sumber daya efisien, atau dengan biaya tinggi seperti banyak lembur atau rework?').setRequired(false);
  form.addParagraphTextItem().setTitle('Adakah anggota tim dengan output setara tapi pakai sumber daya lebih sedikit? Apa yang membedakan cara kerjanya?').setRequired(false);

  // Bagian 3 — Rubrik BARS + CMMI
  addPage(form, 'Bagian 3 - Rubrik Kompetensi (BARS + CMMI)', 'Definisikan standar perilaku tiap level untuk posisi karyawan ini.');
  form.addParagraphTextItem()
    .setTitle('Dari 3 value perusahaan (Agility, Growth Mindset, Problem Solver), sebutkan 2-3 kompetensi kritis yang paling merepresentasikan value tersebut untuk posisi ini, lalu jelaskan singkat alasannya')
    .setRequired(true);
  form.addParagraphTextItem().setTitle('Perilaku konkret LEVEL 1 - belum kompeten / ad-hoc').setRequired(false);
  form.addParagraphTextItem().setTitle('Perilaku konkret LEVEL 2 - kompeten dasar tapi reaktif / belum konsisten').setRequired(false);
  form.addParagraphTextItem().setTitle('Perilaku konkret LEVEL 3 - kompeten, mengikuti proses terstandar').setRequired(false);
  form.addParagraphTextItem().setTitle('Perilaku konkret LEVEL 4 - kompeten + mampu mengukur dan mengelola kinerja kuantitatif').setRequired(false);
  form.addParagraphTextItem().setTitle('Perilaku konkret LEVEL 5 - kompeten + proaktif perbaikan berkelanjutan').setRequired(false);
  form.addParagraphTextItem().setTitle('Contoh insiden nyata (critical incident) untuk tiap level').setRequired(false);

  // Bagian 4 — Cross-Reference BARS
  addPage(form, 'Bagian 4 - Penilaian Karyawan (Cross-Reference)',
    'Pilih pernyataan yang paling menggambarkan yang bersangkutan untuk tiap kompetensi. Pernyataan ini sejajar dengan refleksi diri karyawan agar bisa dibandingkan secara adil. Kunci pencocokan: Nama karyawan + Nama kompetensi.');
  for (var j = 0; j < VALUES.length; j++) {
    addBarsBlock(form, VALUES[j], 'other');
  }
  form.addSectionHeaderItem().setTitle('Rekomendasi (dasar keputusan - Step 4)');
  form.addMultipleChoiceItem()
    .setTitle('Rekomendasi Anda untuk karyawan ini')
    .setChoiceValues(['Pertahankan posisi', 'Pengembangan / pelatihan', 'Rotasi', 'Promosi', 'Lainnya'])
    .setRequired(true);
  form.addParagraphTextItem().setTitle('Alasan rekomendasi').setRequired(false);

  return linkToSheet(form, ssId);
}



// =============================================================================
//  FORM MANAGER (PENILAIAN DIRI) — cukup isi 1x per manager
// =============================================================================

function buildManagerSelfForm(ssId) {
  var form = FormApp.create('Audit Kinerja - Form Manager (Penilaian Diri)');
  form.setTitle('Audit Kinerja - Form Manager (Penilaian Diri)');
  form.setDescription(
    'Nilai DIRI ANDA sebagai manager pada kompetensi kepemimpinan dan keselarasan visi-misi. ' +
    'CUKUP ISI 1 KALI per manager, tidak perlu diulang per karyawan.'
  );

  form.addTextItem().setTitle('Nama manager').setRequired(true);
  form.addListItem().setTitle('Divisi yang dipimpin').setChoiceValues(DIVISIONS).setRequired(true);
  form.addTextItem().setTitle('Jumlah anggota tim').setRequired(false);

  addPage(form, 'Kompetensi Kepemimpinan (Self-Assessment)', 'Bagian refleksi diri sebagai pemimpin. Pilih pernyataan yang paling menggambarkan kebiasaan Anda saat ini, apa adanya. Tidak ada jawaban yang benar atau salah.');
  for (var k = 0; k < LEADERSHIP_COMPETENCIES.length; k++) {
    addBarsBlock(form, LEADERSHIP_COMPETENCIES[k], 'self');
  }

  addPage(form, 'Keselarasan Visi-Misi (Tujuan 2)', '');
  form.addParagraphTextItem().setTitle('Bagaimana Anda mengomunikasikan visi-misi perusahaan ke tim? Seberapa sering?').setRequired(false);
  form.addParagraphTextItem().setTitle('Sebutkan 1 contoh keputusan tim yang langsung diturunkan dari visi-misi atau value perusahaan').setRequired(false);

  return linkToSheet(form, ssId);
}


// =============================================================================
//  FORM OWNER -> MANAGER — responden = owner, isi 1x per manager
// =============================================================================

function buildOwnerToManagerForm(ssId) {
  var form = FormApp.create('Audit Kinerja - Penilaian Owner terhadap Manager');
  form.setTitle('Audit Kinerja - Penilaian Owner terhadap Manager');
  form.setDescription(
    'Diisi oleh owner. Nilai tiap manager pada kompetensi kepemimpinan dan efektivitas menerjemahkan visi-misi. ' +
    'Isi 1 respons per manager.'
  );

  form.addTextItem().setTitle('Nama manager yang dinilai — isi 1 respons per manager').setRequired(true);
  form.addListItem().setTitle('Divisi').setChoiceValues(DIVISIONS).setRequired(true);

  for (var i = 0; i < LEADERSHIP_COMPETENCIES.length; i++) {
    addBarsBlock(form, LEADERSHIP_COMPETENCIES[i], 'other');
  }

  form.addSectionHeaderItem().setTitle('Penilaian Keselarasan & Rekomendasi');
  form.addMultipleChoiceItem()
    .setTitle('Pernyataan mana yang paling menggambarkan cara manajer ini membawa visi-misi ke dalam kerja tim?')
    .setChoiceValues([
      'Visi-misi belum banyak terlihat dalam keseharian tim, dan masih dalam tahap penyesuaian.',
      'Visi-misi disinggung pada momen tertentu, namun belum konsisten menjadi acuan kerja.',
      'Visi-misi diterjemahkan menjadi arahan kerja tim secara rutin dan konsisten.',
      'Visi-misi dipakai sebagai tolok ukur, dan keselarasan tim dipantau dengan indikator yang jelas.',
      'Visi-misi menjadi dasar setiap keputusan tim, dan manajer ikut menyempurnakan strateginya.'
    ])
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Rekomendasi owner')
    .setChoiceValues(['Pertahankan', 'Pengembangan', 'Rotasi', 'Promosi'])
    .setRequired(true);
  form.addParagraphTextItem().setTitle('Alasan rekomendasi').setRequired(false);

  return linkToSheet(form, ssId);
}



// =============================================================================
//  DASHBOARD WEB APP (server-side)
//  - doGet() menyajikan Dashboard.html
//  - getDashboardData() membaca spreadsheet master -> JSON
//  CARA DEPLOY: Deploy > New deployment > Web app > Execute as: Me,
//  Who has access: Anyone with the link.
// =============================================================================

// Isi dengan ID spreadsheet master (ambil dari URL: /d/<ID>/edit).
// Boleh dikosongkan jika script ini terikat (bound) langsung ke spreadsheet.
var DASHBOARD_SPREADSHEET_ID = '1loSkP_iOECP0HyCEyGNofr-nIa-kooyBuNmipyr3HDg';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('URALA Audit Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSpreadsheet_() {
  // 1) Pakai ID manual jika sudah diisi
  if (DASHBOARD_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(DASHBOARD_SPREADSHEET_ID);
  }
  // 2) Cari otomatis di Drive berdasarkan nama spreadsheet hasil createAuditForms()
  var files = DriveApp.searchFiles(
    'title contains "Audit Kinerja - Workload Analysis" and ' +
    'mimeType = "application/vnd.google-apps.spreadsheet" and trashed = false'
  );
  var found = null;
  while (files.hasNext()) {
    var f = files.next();
    if (!found || f.getLastUpdated() > found.getLastUpdated()) { found = f; }
  }
  if (found) { return SpreadsheetApp.openById(found.getId()); }
  // 3) Fallback: jika script di-bind langsung ke spreadsheet
  try {
    var active = SpreadsheetApp.getActive();
    if (active) { return active; }
  } catch (e) { /* bukan bound script */ }
  throw new Error(
    'Spreadsheet master tidak ditemukan. Pastikan sudah menjalankan createAuditForms() ' +
    'atau isi DASHBOARD_SPREADSHEET_ID di baris atas Code.gs dengan ID spreadsheet master.'
  );
}

function norm_(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().toLowerCase(); }

// Peta: teks pernyataan BARS -> level (1..5), mencakup versi "Saya" & "Yang bersangkutan".
function buildStatementMap_() {
  var map = {};
  function add(arr) {
    for (var i = 0; i < arr.length; i++) {
      var lvl = i + 1;
      map[norm_(arr[i])] = lvl;
      map[norm_(arr[i].replace(/^Saya\b/, 'Yang bersangkutan'))] = lvl;
    }
  }
  for (var k in COMPETENCY_BARS) { add(COMPETENCY_BARS[k]); }
  add(DEFAULT_BARS);
  return map;
}


function findCol_(headers, keyword) {
  var kw = keyword.toLowerCase();
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase().indexOf(kw) >= 0) { return i; }
  }
  return -1;
}

function sheetRows_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (!values || values.length === 0) { return { headers: [], rows: [] }; }
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var has = values[r].some(function (c) { return c !== '' && c !== null && String(c).trim() !== ''; });
    if (has) { rows.push(values[r]); }
  }
  return { headers: headers, rows: rows };
}

function cellStr_(c) {
  if (c instanceof Date) {
    return Utilities.formatDate(c, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  }
  return c;
}

function getDashboardData(token) {
  if (!_checkSession_(token)) { return { _auth: true }; }
  try {
    return _buildDashboardData();
  } catch (e) {
    return { _error: e.message };
  }
}

function _buildDashboardData() {
  var ss = getSpreadsheet_();
  var sheets = ss.getSheets();
  var stmtMap = buildStatementMap_();
  var data = {
    meta: {
      title: ss.getName(),
      lastUpdated: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMM yyyy, HH:mm'),
      sheets: []
    },
    values: VALUES,
    leadership: LEADERSHIP_COMPETENCIES,
    divisions: DIVISIONS,
    employees: [],
    managerEval: [],
    managerSelf: [],
    ownerEval: [],
    rawSheets: []
  };


  sheets.forEach(function (sheet) {
    var name = sheet.getName();
    var parsed = sheetRows_(sheet);
    var headers = parsed.headers;
    data.meta.sheets.push(name);
    data.rawSheets.push({
      name: name,
      headers: headers,
      rows: parsed.rows.map(function (r) { return r.map(cellStr_); })
    });

    var lname = name.toLowerCase();

    // Deteksi tipe sheet berdasarkan header (bukan nama sheet)
    // karena Google Sheets memberi nama otomatis "Form Responses 1/2/3/4"
    var hJoined = headers.map(function(h){ return String(h).toLowerCase(); }).join('|||');
    var sheetType;
    if (hJoined.indexOf('nama lengkap') >= 0 && hJoined.indexOf('atasan langsung') >= 0) {
      sheetType = 'karyawan';
    } else if (hJoined.indexOf('nama karyawan yang dinilai') >= 0 && hJoined.indexOf('nama manager (penilai)') >= 0) {
      sheetType = 'manager';
    } else if (hJoined.indexOf('divisi yang dipimpin') >= 0 && hJoined.indexOf('jumlah anggota tim') >= 0) {
      sheetType = 'managerself';
    } else if (hJoined.indexOf('nama manager yang dinilai') >= 0) {
      sheetType = 'owner';
    } else if (lname.indexOf('karyawan') >= 0) {
      sheetType = 'karyawan';
    } else if (lname.indexOf('penilaian diri') >= 0) {
      sheetType = 'managerself';
    } else if (lname.indexOf('owner') >= 0) {
      sheetType = 'owner';
    } else if (lname.indexOf('manager') >= 0) {
      sheetType = 'manager';
    } else {
      sheetType = 'unknown';
    }

    function val(row, kw) {
      var c = findCol_(headers, kw);
      if (c < 0) { return ''; }
      var v = cellStr_(row[c]);
      return (typeof v === 'string') ? v.trim() : v;
    }
    function levels(row) {
      var out = {};
      for (var i = 0; i < headers.length; i++) {
        var h = String(headers[i]);
        var idx = h.toLowerCase().indexOf('untuk kompetensi');
        if (idx >= 0) {
          var comp = h.substring(idx + 'untuk kompetensi'.length).replace(/\?\s*$/, '').trim();
          var cellVal = row[i];
          var cellStr = (cellVal instanceof Date) ? cellStr_(cellVal) : String(cellVal == null ? '' : cellVal);
          var lvl = stmtMap[norm_(cellStr)];
          if (lvl) { out[comp] = lvl; }
        }
      }
      return out;
    }

    if (sheetType === 'karyawan') {
      parsed.rows.forEach(function (row) {
        var nm = val(row, 'nama lengkap');
        if (!nm || !String(nm).trim()) { return; }
        data.employees.push({
          name: nm.trim(),
          division: val(row, 'divisi'),
          position: val(row, 'posisi'),
          manager: val(row, 'atasan langsung'),
          tenure: val(row, 'lama bekerja'),
          overtime: val(row, 'total jam lembur'),
          rework: val(row, 'direvisi ulang'),
          okrTarget: val(row, 'target kerja kuantitatif'),
          okrActual: val(row, 'hasil aktual yang sudah anda capai'),
          okrCause: val(row, 'selisih target'),
          deadline: val(row, 'deadline yang diberikan'),
          obstacles: val(row, 'lebih lama dari seharusnya'),
          simplify: val(row, 'bisa disederhanakan'),
          develop: val(row, 'paling ingin anda kembangkan'),
          mainDuties: val(row, 'tugas dan tanggung jawab utama'),
          dailyRoutine: val(row, 'rutinitas harian'),
          weeklyTasks: val(row, 'tugas rutin mingguan'),
          extraTasks: val(row, 'tugas tambahan di luar'),
          avgTime: val(row, 'rata-rata waktu'),
          mostTime: val(row, 'paling banyak memakan waktu'),
          adminPct: val(row, 'administratif'),
          meetingTime: val(row, 'waktu rapat'),
          tools: val(row, 'aplikasi'),
          dependency: val(row, 'bergantung pada hasil'),
          waitTime: val(row, 'seberapa sering menunggu'),
          material: val(row, 'lengkap dan akurat'),
          bars: levels(row)
        });
      });
    } else if (sheetType === 'managerself') {

      parsed.rows.forEach(function (row) {
        var nm = val(row, 'nama manager');
        if (!nm || !String(nm).trim()) { return; }
        data.managerSelf.push({
          manager: nm.trim(),
          division: val(row, 'divisi yang dipimpin'),
          teamSize: val(row, 'jumlah anggota tim'),
          visiMisiComm: val(row, 'mengomunikasikan visi-misi'),
          visiMisiExample: val(row, 'keputusan tim yang langsung'),
          bars: levels(row)
        });
      });
    } else if (sheetType === 'owner') {
      parsed.rows.forEach(function (row) {
        var nm = val(row, 'nama manager yang dinilai');
        if (!nm || !String(nm).trim()) { return; }
        data.ownerEval.push({
          manager: nm.trim(),
          division: val(row, 'divisi'),
          visiMisiStatement: val(row, 'membawa visi-misi'),
          recommendation: val(row, 'rekomendasi owner'),
          reason: val(row, 'alasan rekomendasi'),
          bars: levels(row)
        });
      });
    } else if (sheetType === 'manager') {
      parsed.rows.forEach(function (row) {
        var emp = val(row, 'nama karyawan yang dinilai');
        if (!emp || !String(emp).trim()) { return; }
        data.managerEval.push({
          manager: val(row, 'nama manager (penilai)').trim(),
          division: val(row, 'divisi'),
          employee: val(row, 'nama karyawan yang dinilai').trim(),
          position: val(row, 'posisi'),
          workloadRating: val(row, 'menilai beban kerja karyawan ini'),
          overtimeFreq: val(row, 'lembur untuk memenuhi tenggat'),
          rework: val(row, 'rework atau error rate'),
          overtime: val(row, 'total jam lembur tercatat'),
          okrTarget: val(row, 'target kuantitatif sebagai ukuran'),
          recommendation: val(row, 'rekomendasi anda untuk karyawan'),
          reason: val(row, 'alasan rekomendasi'),
          bars: levels(row)
        });
      });
    }
  });

  try { _resolveBars_(ss, data); } catch (e) {
    Logger.log('_resolveBars_ warning: ' + e.message);
    data.employees.forEach(function(e){ if(!e.resolvedBars){ e.resolvedBars = e.bars; e.validated = false; } });
    data.managerSelf.forEach(function(m){ if(!m.resolvedBars){ m.resolvedBars = m.bars; m.validated = false; } });
  }

  // Deduplikasi: satu entri per nama unik (ambil yang paling banyak datanya)
  data.employees  = _dedup_(data.employees,  'name');
  data.managerEval = _dedup_(data.managerEval, 'employee');
  data.managerSelf = _dedup_(data.managerSelf, 'manager');
  data.ownerEval  = _dedup_(data.ownerEval,  'manager');

  // Tempelkan hasil tafsiran OKR berbasis AI (jika sudah pernah dihitung via runAnalysis)
  try { _attachOkr_(ss, data); } catch (e) { Logger.log('attachOkr: ' + e.message); }

  return data;
}

// Deduplikasi array berdasarkan field kunci.
// Untuk nama yang sama, ambil entri dengan jumlah field non-kosong terbanyak.
function _dedup_(arr, key) {
  var seen = {}, result = [];
  arr.forEach(function (item) {
    var k = String(item[key] || '').trim().toLowerCase();
    if (!k) { return; }
    if (seen[k] === undefined) {
      seen[k] = result.length;
      result.push(item);
    } else {
      // Hitung field non-kosong; simpan yang lebih lengkap
      var scoreNew = 0, scoreOld = 0;
      var old = result[seen[k]];
      for (var f in item) { if (item[f] !== '' && item[f] !== null && item[f] !== undefined) { scoreNew++; } }
      for (var g in old)  { if (old[g]  !== '' && old[g]  !== null && old[g]  !== undefined) { scoreOld++; } }
      if (scoreNew > scoreOld) { result[seen[k]] = item; }
    }
  });
  return result;
}

// Bangun resolvedBars (skor final): Validasi -> Cross-reference/Owner -> Self
function _resolveBars_(ss, data) {
  var valK = _readValidations_(ss, 'karyawan');
  var valM = _readValidations_(ss, 'manager');

  // Karyawan: prioritas validasi karyawan -> cross-reference manager -> self
  data.employees.forEach(function (e) {
    var cross = null;
    data.managerEval.forEach(function (m) {
      if (norm_(m.employee) === norm_(e.name)) { cross = m.bars; }
    });
    var resolved = {}, source = {};
    (data.values || []).forEach(function (comp) {
      var selfLvl = e.bars[comp] || null;
      var v = valK[e.name] && valK[e.name].comps[comp];
      if (v && String(v.status) === 'Tidak' && v.level) {
        resolved[comp] = Number(v.level); source[comp] = 'validasi';
      } else if (v && String(v.status) === 'Benar') {
        resolved[comp] = selfLvl; source[comp] = 'validasi';
      } else if (cross && cross[comp]) {
        resolved[comp] = cross[comp]; source[comp] = 'crossref';
      } else if (selfLvl) {
        resolved[comp] = selfLvl; source[comp] = 'self';
      }
    });
    e.resolvedBars = resolved;
    e.barsSource = source;
    e.validated = !!(valK[e.name] && valK[e.name].any);
  });

  // Manager: prioritas validasi manager (owner) -> form owner -> self
  data.managerSelf.forEach(function (m) {
    var owner = null;
    data.ownerEval.forEach(function (o) {
      if (norm_(o.manager) === norm_(m.manager)) { owner = o.bars; }
    });
    var resolved = {}, source = {};
    (data.leadership || []).forEach(function (comp) {
      var selfLvl = m.bars[comp] || null;
      var v = valM[m.manager] && valM[m.manager].comps[comp];
      if (v && String(v.status) === 'Tidak' && v.level) {
        resolved[comp] = Number(v.level); source[comp] = 'validasi';
      } else if (v && String(v.status) === 'Benar') {
        resolved[comp] = selfLvl; source[comp] = 'validasi';
      } else if (owner && owner[comp]) {
        resolved[comp] = owner[comp]; source[comp] = 'owner';
      } else if (selfLvl) {
        resolved[comp] = selfLvl; source[comp] = 'self';
      }
    });
    m.resolvedBars = resolved;
    m.barsSource = source;
    m.validated = !!(valM[m.manager] && valM[m.manager].any);
  });
}

// Baca sheet hasil validasi -> { subjek: { any:true, comps:{ comp:{status,level} } } }
function _readValidations_(ss, kind) {
  var out = {};
  var sh = ss.getSheetByName(_valSheetName(kind));
  if (!sh) { return out; }
  var vv = sh.getDataRange().getValues();
  for (var i = 1; i < vv.length; i++) {
    var subj = vv[i][2]; if (!subj) { continue; }
    if (!out[subj]) { out[subj] = { any: false, comps: {} }; }
    out[subj].any = true;
    var q = String(vv[i][3]); var tipe = String(vv[i][4]);
    if (tipe === 'bars') {
      var idx = q.toLowerCase().indexOf('untuk kompetensi');
      if (idx >= 0) {
        var comp = q.substring(idx + 'untuk kompetensi'.length).replace(/\?\s*$/, '').trim();
        out[subj].comps[comp] = { status: vv[i][6], level: vv[i][7] };
      }
    }
  }
  return out;
}


// =============================================================================
//  RENAME SHEETS — jalankan 1x untuk memberi nama yang benar ke tab spreadsheet
//  Cara: pilih fungsi renameSheets() di dropdown Apps Script, lalu klik Run.
// =============================================================================
function renameSheets() {
  var ss = getSpreadsheet_();
  var sheets = ss.getSheets();
  var log = [];

  var nameMap = {
    'karyawan'   : 'Form Karyawan',
    'manager'    : 'Form Manager',
    'managerself': 'Form Manager (Penilaian Diri)',
    'owner'      : 'Form Owner'
  };

  sheets.forEach(function (sheet) {
    var parsed   = sheetRows_(sheet);
    var headers  = parsed.headers;
    var hJoined  = headers.map(function (h) {
      return String(h).toLowerCase();
    }).join('|||');

    var type;
    if (hJoined.indexOf('nama lengkap') >= 0 && hJoined.indexOf('atasan langsung') >= 0) {
      type = 'karyawan';
    } else if (hJoined.indexOf('nama karyawan yang dinilai') >= 0 && hJoined.indexOf('nama manager (penilai)') >= 0) {
      type = 'manager';
    } else if (hJoined.indexOf('divisi yang dipimpin') >= 0 && hJoined.indexOf('jumlah anggota tim') >= 0) {
      type = 'managerself';
    } else if (hJoined.indexOf('nama manager yang dinilai') >= 0) {
      type = 'owner';
    }

    if (type) {
      var newName = nameMap[type];
      var oldName = sheet.getName();
      if (oldName !== newName) {
        sheet.setName(newName);
        log.push(oldName + '  ->  ' + newName);
      } else {
        log.push(oldName + '  (tidak perlu diubah)');
      }
    }
  });

  if (log.length) {
    Logger.log('=== Hasil Rename ===\n' + log.join('\n'));
    SpreadsheetApp.getUi().alert('Selesai!\n\n' + log.join('\n'));
  } else {
    Logger.log('Tidak ada sheet form yang ditemukan.');
  }
}



// =============================================================================
//  VALIDASI (server-side)
//  - getValidationPayload(kind): ambil jawaban subjek + validasi tersimpan
//  - saveValidation(kind, validator, subject, itemsJson): simpan hasil validasi
//  kind: 'karyawan' (divalidasi manager) atau 'manager' (divalidasi owner)
// =============================================================================

var VAL_HEADERS = ['Timestamp', 'Validator', 'Subjek', 'Pertanyaan', 'Tipe', 'Jawaban', 'Status', 'Koreksi BARS', 'Catatan'];

function _valSheetName(kind) {
  return (kind === 'manager') ? 'Hasil Validasi Manager' : 'Hasil Validasi Karyawan';
}
function _getOrCreateValSheet(ss, kind) {
  var name = _valSheetName(kind);
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(VAL_HEADERS); }
  else if (sh.getLastRow() === 0) { sh.appendRow(VAL_HEADERS); }
  return sh;
}

function _findSourceSheet(ss, srcType) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var p = sheetRows_(sheets[i]);
    var hj = p.headers.map(function (h) { return String(h).toLowerCase(); }).join('|||');
    var t = null;
    if (hj.indexOf('nama lengkap') >= 0 && hj.indexOf('atasan langsung') >= 0) { t = 'karyawan'; }
    else if (hj.indexOf('divisi yang dipimpin') >= 0 && hj.indexOf('jumlah anggota tim') >= 0) { t = 'managerself'; }
    if (t === srcType) { return { headers: p.headers, rows: p.rows }; }
  }
  return null;
}

function getValidationPayload(kind, token) {
  if (!_checkSession_(token)) { return { _auth: true }; }
  try {
    var ss = getSpreadsheet_();
    var srcType = (kind === 'manager') ? 'managerself' : 'karyawan';
    var src = _findSourceSheet(ss, srcType);
    if (!src) { return { _error: 'Sheet sumber untuk validasi ' + kind + ' tidak ditemukan. Pastikan form mandiri sudah diisi.' }; }

    var headers = src.headers;
    var keyKw = (kind === 'manager') ? 'nama manager' : 'nama lengkap';
    var divKw = (kind === 'manager') ? 'divisi yang dipimpin' : 'divisi';
    var keyIdx = findCol_(headers, keyKw);
    var divIdx = findCol_(headers, divKw);
    var skip = (kind === 'manager')
      ? ['timestamp', 'nama manager', 'divisi yang dipimpin', 'jumlah anggota tim']
      : ['timestamp', 'nama lengkap', 'divisi', 'posisi', 'jabatan', 'atasan', 'lama bekerja'];
    function isSkip(h) { var l = h.toLowerCase(); for (var s = 0; s < skip.length; s++) { if (l.indexOf(skip[s]) >= 0) { return true; } } return false; }

    var subjects = [], dataMap = {};
    src.rows.forEach(function (r) {
      var nm = keyIdx >= 0 ? cellStr_(r[keyIdx]) : '';
      if (!nm || !String(nm).trim()) { return; }
      var items = [];
      for (var c = 0; c < headers.length; c++) {
        var h = String(headers[c]);
        if (isSkip(h)) { continue; }
        var type = 'text', comp = null, options = null;
        var idx = h.toLowerCase().indexOf('untuk kompetensi');
        if (idx >= 0) {
          type = 'bars';
          comp = h.substring(idx + 'untuk kompetensi'.length).replace(/\?\s*$/, '').trim();
          options = barsLevelsFor(comp, 'other');
        }
        items.push({ q: h, a: cellStr_(r[c]), type: type, comp: comp, options: options });
      }
      subjects.push(nm);
      dataMap[nm] = { division: divIdx >= 0 ? cellStr_(r[divIdx]) : '', items: items };
    });

    var valSheet = _getOrCreateValSheet(ss, kind);
    var existing = {};
    var vv = valSheet.getDataRange().getValues();
    for (var v = 1; v < vv.length; v++) {
      var subj = vv[v][2]; if (!subj) { continue; }
      if (!existing[subj]) { existing[subj] = {}; }
      existing[subj][vv[v][3]] = { status: vv[v][6], level: vv[v][7], note: vv[v][8] };
    }
    var done = subjects.filter(function (s) { return existing[s]; }).length;
    return { kind: kind, subjects: subjects, data: dataMap, existing: existing, progress: { done: done, total: subjects.length } };
  } catch (e) {
    return { _error: e.message };
  }
}

function saveValidation(kind, validator, subject, itemsJson, token) {
  if (!_checkSession_(token)) { return { _auth: true }; }
  try {
    var items = (typeof itemsJson === 'string') ? JSON.parse(itemsJson) : itemsJson;
    var ss = getSpreadsheet_();
    var sh = _getOrCreateValSheet(ss, kind);
    var all = sh.getDataRange().getValues();
    var kept = [VAL_HEADERS.slice()];
    for (var i = 1; i < all.length; i++) {
      if (String(all[i][2]) !== String(subject)) { kept.push(all[i]); }
    }
    var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    items.forEach(function (it) {
      kept.push([ts, validator || '', subject, it.q || '', it.type || '', it.a || '', it.status || '', it.level || '', it.note || '']);
    });
    sh.clearContents();
    sh.getRange(1, 1, kept.length, VAL_HEADERS.length).setValues(kept);
    return { ok: true, saved: items.length };
  } catch (e) {
    return { _error: e.message };
  }
}



// =============================================================================
//  AUTENTIKASI — Password Hash + Session Token
//
//  Setup awal (hanya sekali):
//   1. Jalankan fungsi initPassword() untuk menyimpan hash password awal.
//   2. Untuk ganti password: jalankan changePassword('passwordBaru')
//
//  Alur login:
//   Client kirim password teks -> server hash SHA-256 -> cocokkan dengan
//   hash tersimpan -> jika cocok, buat UUID session token -> simpan di
//   Script Properties dengan waktu kadaluarsa -> kirim token ke client.
//   Client simpan token di sessionStorage -> sertakan di setiap API call.
// =============================================================================

var SESSION_TTL_MS  = 8 * 60 * 60 * 1000;   // 8 jam
var DEFAULT_PWD     = 'uralakreatif';
var PROP_PWD_HASH   = 'DASH_PWD_HASH';
var PROP_SESSION_PFX = 'SESS_';

/** Hitung SHA-256 dari string, kembalikan hex lowercase. */
function _sha256_(s) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8
  );
  return bytes.map(function (b) {
    var h = (b < 0 ? b + 256 : b).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('');
}

/** Inisialisasi hash password default. Jalankan 1x saat setup pertama. */
function initPassword() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty(PROP_PWD_HASH)) {
    props.setProperty(PROP_PWD_HASH, _sha256_(DEFAULT_PWD));
    Logger.log('Password hash disimpan. Password default: ' + DEFAULT_PWD);
  } else {
    Logger.log('Password hash sudah ada — tidak diubah.');
  }
}

/** Ganti password. Panggil changePassword('passwordBaruKamu') dari editor. */
function changePassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    Logger.log('ERROR: Password minimal 6 karakter.');
    return;
  }
  var props = PropertiesService.getScriptProperties();
  props.setProperty(PROP_PWD_HASH, _sha256_(newPassword));
  // Hapus semua sesi aktif (force re-login)
  var all = props.getProperties();
  Object.keys(all).forEach(function (k) {
    if (k.indexOf(PROP_SESSION_PFX) === 0) { props.deleteProperty(k); }
  });
  Logger.log('Password berhasil diganti dan semua sesi direset.');
}

/** Verifikasi password dari client. Kembalikan { ok, token } atau { ok:false }. */
function verifyLogin(password) {
  try {
    if (!password) { return { ok: false }; }
    var props   = PropertiesService.getScriptProperties();
    var stored  = props.getProperty(PROP_PWD_HASH);

    // Auto-inisialisasi hash jika belum ada
    if (!stored) {
      stored = _sha256_(DEFAULT_PWD);
      props.setProperty(PROP_PWD_HASH, stored);
    }

    if (_sha256_(password) !== stored) { return { ok: false }; }

    // Buat session token
    var token  = Utilities.getUuid();
    var expiry = String(Date.now() + SESSION_TTL_MS);
    props.setProperty(PROP_SESSION_PFX + token, expiry);
    return { ok: true, token: token, ttlHours: 8 };
  } catch (e) {
    return { ok: false };
  }
}

/** Validasi session token. Kembalikan true jika valid, false jika tidak/kadaluarsa. */
function _checkSession_(token) {
  if (!token) { return false; }
  var props  = PropertiesService.getScriptProperties();
  var expiry = props.getProperty(PROP_SESSION_PFX + token);
  if (!expiry) { return false; }
  if (Date.now() > Number(expiry)) {
    props.deleteProperty(PROP_SESSION_PFX + token);
    return false;
  }
  return true;
}

/** Perpanjang sesi (opsional, dipanggil saat ada aktivitas). */
function refreshSession(token) {
  if (!_checkSession_(token)) { return { ok: false }; }
  var props  = PropertiesService.getScriptProperties();
  props.setProperty(PROP_SESSION_PFX + token, String(Date.now() + SESSION_TTL_MS));
  return { ok: true };
}



// =============================================================================
//  ANALYSIS ENGINE (GOLD) — Kelebihan & Kekurangan Otomatis
//  Arsitektur 3-layer hybrid + integrasi validasi yang sudah ada:
//   LAYER 1 (Rule-based)  : data kuantitatif & terstruktur  -> akurasi ~100%
//                           (skor BARS final/tervalidasi, rework, OKR, lembur,
//                            beban kerja, rekomendasi)
//   LAYER 2 (Keyword NLP) : kamus sentimen Bahasa Indonesia  -> sinyal cepat
//   LAYER 3 (Gemini LLM)  : narasi deskriptif ambigu         -> pemahaman makna
//                           (structured output + evidence grounding + few-shot
//                            + grounding ke rubrik CMMI + self-consistency vote)
//
//  INTEGRASI VALIDASI:
//   Sistem ini TIDAK membuat antrian validasi manusia baru. Sebagai gantinya,
//   ia memakai hasil "Validasi" yang sudah ada (resolvedBars + barsSource)
//   sebagai sumber kebenaran (ground truth). Temuan kompetensi yang berasal
//   dari data tervalidasi otomatis mendapat confidence 1.0.
//
//  SETUP API KEY (jalankan 1x dari editor Apps Script):
//   setupGeminiKey('PASTE_API_KEY_ANDA')
//  Key disimpan di Script Properties (TIDAK ditulis ke kode / GitHub).
// =============================================================================

var PROP_GEMINI_KEY = 'GEMINI_API_KEY';
var ANALYSIS_SHEET  = 'Analysis';
var ANALYSIS_HEADERS = [
  'Timestamp', 'Subjek', 'Tipe', 'Divisi', 'Kategori', 'Aspek',
  'Temuan', 'Bukti', 'Sumber', 'Confidence', 'Metode', 'Status'
];

var ANALYSIS_CFG = {
  model: 'gemini-2.0-flash',     // model Gemini (UrlFetchApp)
  threshold: 0.85,               // >= terkonfirmasi, < perlu ditinjau
  selfConsistencyRuns: 3,        // jumlah panggilan LLM untuk majority voting
  temperature: 0.2,              // rendah = lebih deterministik
  // ambang kuantitatif
  reworkLow: 10, reworkHigh: 25, // % rework
  overtimeHigh: 40,              // jam lembur per periode
  okrLow: 60, okrHigh: 90        // % capaian OKR
};

// ---- Setup & ambil API key (aman, lewat Script Properties) -------------------
function setupGeminiKey(key) {
  if (!key || String(key).trim().length < 10) {
    Logger.log('ERROR: key tidak valid. Pakai: setupGeminiKey("API_KEY_ANDA")');
    return;
  }
  PropertiesService.getScriptProperties().setProperty(PROP_GEMINI_KEY, String(key).trim());
  Logger.log('Gemini API key tersimpan di Script Properties. Aman.');
}
function _getGeminiKey_() {
  return PropertiesService.getScriptProperties().getProperty(PROP_GEMINI_KEY) || '';
}

// ---- Util numerik server-side ----------------------------------------------
function firstNum_(s) {
  var m = String(s == null ? '' : s).replace(',', '.').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

// Konversi nilai sel apa pun -> string aman (hindari Date/obj merusak serialisasi
// google.script.run yang membuat success handler tidak pernah terpanggil).
function _toStr_(c) {
  if (c == null) { return ''; }
  if (c instanceof Date) {
    return Utilities.formatDate(c, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  }
  return String(c).trim();
}

// Pilih nilai metrik final: utamakan angka dari manager (tervalidasi),
// fallback ke lapor mandiri karyawan. Mengembalikan { val, validated, other }.
function _pickValidated_(mgrVal, empVal) {
  var m = firstNum_(mgrVal), e = firstNum_(empVal);
  if (m != null) { return { val: m, validated: true, other: e }; }
  if (e != null) { return { val: e, validated: false, other: null }; }
  return null;
}

// ---- Pembuat objek temuan ---------------------------------------------------
function _mkFinding_(kategori, aspek, temuan, bukti, sumber, confidence, metode) {
  return {
    kategori: kategori, aspek: aspek, temuan: temuan, bukti: bukti || '',
    sumber: sumber || '', confidence: Math.round(confidence * 100) / 100,
    metode: metode || 'rule'
  };
}

// =============================================================================
//  LAYER 1 — RULE-BASED (kuantitatif & terstruktur). Akurasi ~100%.
//  Memakai resolvedBars (hasil validasi) bila ada -> confidence 1.0.
// =============================================================================
function _analyzeQuant_(e, managerEval) {
  var f = [];
  var src = e.barsSource || {};

  // 1) Kompetensi (BARS) — pakai skor final (resolvedBars) hasil validasi
  (VALUES || []).forEach(function (comp) {
    var lvl = (e.resolvedBars && e.resolvedBars[comp]) || e.bars[comp] || null;
    if (!lvl) { return; }
    var validated = src[comp] === 'validasi';
    var crossref  = src[comp] === 'crossref';
    var conf = validated ? 1.0 : (crossref ? 0.92 : 0.85);
    var sumber = validated ? 'BARS (tervalidasi)' : (crossref ? 'BARS (cross-ref manager)' : 'BARS (penilaian diri)');
    if (lvl >= 4) {
      f.push(_mkFinding_('kelebihan', comp, 'Kompeten tinggi pada ' + comp + ' (Level ' + lvl + '/5)', 'Level ' + lvl, sumber, conf, 'rule'));
    } else if (lvl <= 2) {
      f.push(_mkFinding_('kekurangan', comp, 'Perlu pengembangan pada ' + comp + ' (Level ' + lvl + '/5)', 'Level ' + lvl, sumber, conf, 'rule'));
    }
  });

  // Cari penilaian manager untuk karyawan ini (sumber validasi metrik & narasi).
  var mr = null;
  (managerEval || []).forEach(function (m) {
    if (norm_(m.employee) === norm_(e.name)) { mr = m; }
  });

  // 2) Rework — utamakan angka dari manager (tervalidasi), fallback lapor mandiri.
  var rwP = _pickValidated_(mr && mr.rework, e.rework);
  if (rwP) {
    var rw = rwP.val;
    var rwConf = rwP.validated ? 1.0 : 0.85;
    var rwSrc = rwP.validated ? 'Metrik rework (divalidasi manager)' : 'Metrik rework (lapor mandiri)';
    if (rw <= ANALYSIS_CFG.reworkLow) {
      f.push(_mkFinding_('kelebihan', 'Kualitas Output', 'Tingkat rework rendah (' + rw + '%), output rapi sejak awal', rw + '%', rwSrc, rwConf, 'rule'));
    } else if (rw >= ANALYSIS_CFG.reworkHigh) {
      f.push(_mkFinding_('kekurangan', 'Kualitas Output', 'Tingkat rework tinggi (' + rw + '%), banyak revisi ulang', rw + '%', rwSrc, rwConf, 'rule'));
    }
    // Selisih signifikan lapor mandiri vs catatan manager -> sinyal akurasi pelaporan.
    if (rwP.validated && rwP.other != null && Math.abs(rwP.other - rw) >= 15) {
      f.push(_mkFinding_('kekurangan', 'Akurasi Pelaporan', 'Rework versi karyawan (' + rwP.other + '%) berbeda jauh dari catatan manager (' + rw + '%)', 'selisih ' + Math.abs(rwP.other - rw) + ' poin', 'Validasi silang manager', 0.88, 'rule'));
    }
  }

  // 3) OKR capaian — utamakan tafsiran AI (kontekstual); hindari angka naif yang menyesatkan.
  var okrPct = (typeof e.okrPct === 'number' && isFinite(e.okrPct)) ? e.okrPct : null;
  var okrSrc = 'OKR (ditafsirkan AI)';
  var okrConf = 0.85;
  if (okrPct == null) {
    // Fallback hanya bila target & aktual berupa angka sederhana (bukan narasi multi-objektif).
    if (_isSimpleNum_(e.okrTarget) && _isSimpleNum_(e.okrActual)) {
      var t = firstNum_(e.okrTarget), a = firstNum_(e.okrActual);
      if (t) { okrPct = Math.round(a / t * 100); okrSrc = 'OKR (lapor mandiri)'; okrConf = 0.8; }
    }
  }
  if (okrPct != null) {
    var okrEvid = e.okrSummary ? e.okrSummary : (okrPct + '%');
    if (okrPct >= ANALYSIS_CFG.okrHigh) {
      f.push(_mkFinding_('kelebihan', 'Pencapaian Target', 'Capaian OKR baik (' + okrPct + '%)' + (e.okrStatus ? ' — ' + e.okrStatus : ''), okrEvid, okrSrc, okrConf, 'rule'));
    } else if (okrPct < ANALYSIS_CFG.okrLow) {
      f.push(_mkFinding_('kekurangan', 'Pencapaian Target', 'Capaian OKR di bawah ekspektasi (' + okrPct + '%)' + (e.okrStatus ? ' — ' + e.okrStatus : ''), okrEvid, okrSrc, okrConf, 'rule'));
    }
  }

  // 4) Lembur — utamakan catatan manager (tervalidasi).
  var otP = _pickValidated_(mr && mr.overtime, e.overtime);
  if (otP && otP.val >= ANALYSIS_CFG.overtimeHigh) {
    var otSrc = otP.validated ? 'Lembur (divalidasi manager)' : 'Lembur (lapor mandiri)';
    f.push(_mkFinding_('kekurangan', 'Beban Kerja', 'Jam lembur tinggi (' + otP.val + ' jam) — indikasi overload / inefisiensi', otP.val + ' jam', otSrc, otP.validated ? 0.95 : 0.85, 'rule'));
  }

  // 5) Penilaian beban kerja & rekomendasi dari manager (terstruktur)
  if (mr) {
    var wl = norm_(mr.workloadRating);
    if (wl.indexOf('overload') >= 0 || wl.indexOf('sangat berat') >= 0) {
      f.push(_mkFinding_('kekurangan', 'Beban Kerja', 'Manager menilai beban kerja "Sangat berat (overload)"', mr.workloadRating, 'Penilaian manager', 0.95, 'rule'));
    } else if (wl.indexOf('pas') >= 0 || wl.indexOf('seimbang') >= 0) {
      f.push(_mkFinding_('kelebihan', 'Manajemen Beban Kerja', 'Beban kerja dinilai pas/seimbang oleh manager', mr.workloadRating, 'Penilaian manager', 0.9, 'rule'));
    }
    var rec = norm_(mr.recommendation);
    if (rec.indexOf('promosi') >= 0) {
      f.push(_mkFinding_('kelebihan', 'Rekomendasi', 'Direkomendasikan untuk promosi oleh manager', mr.recommendation, 'Rekomendasi manager', 1.0, 'rule'));
    } else if (rec.indexOf('pertahankan') >= 0) {
      f.push(_mkFinding_('kelebihan', 'Rekomendasi', 'Direkomendasikan dipertahankan pada posisi', mr.recommendation, 'Rekomendasi manager', 0.95, 'rule'));
    } else if (rec.indexOf('pengembangan') >= 0 || rec.indexOf('pelatihan') >= 0) {
      f.push(_mkFinding_('kekurangan', 'Rekomendasi', 'Manager merekomendasikan pengembangan / pelatihan', mr.recommendation, 'Rekomendasi manager', 0.9, 'rule'));
    }
  }

  // 6) Gap penilaian diri vs hasil akhir (over/under estimate)
  (VALUES || []).forEach(function (comp) {
    var self = e.bars[comp] || null;
    var fin = (e.resolvedBars && e.resolvedBars[comp]) || null;
    if (self != null && fin != null && self - fin >= 2) {
      f.push(_mkFinding_('kekurangan', 'Akurasi Penilaian Diri', 'Menilai diri lebih tinggi dari hasil validasi pada ' + comp + ' (diri L' + self + ' vs final L' + fin + ')', 'gap +' + (self - fin), 'Gap analysis', 0.88, 'rule'));
    }
  });

  return f;
}

// =============================================================================
//  LAYER 2 — KEYWORD NLP (kamus sentimen Bahasa Indonesia)
//  Dipakai sebagai: (a) fallback bila Gemini tidak tersedia,
//                    (b) penguat confidence (ensemble) bila sepakat dgn LLM.
// =============================================================================
var POS_WORDS = ['proaktif', 'inisiatif', 'inovatif', 'inovasi', 'mandiri', 'konsisten', 'cepat', 'efisien', 'efektif', 'membantu', 'memimpin', 'solutif', 'solusi', 'teliti', 'disiplin', 'berkembang', 'belajar', 'antisipasi', 'mengusulkan', 'memperbaiki', 'rapi', 'tepat waktu', 'kolaboratif', 'tanggung jawab'];
var NEG_WORDS = ['sulit', 'kesulitan', 'terlambat', 'tertunda', 'menunda', 'bingung', 'kurang', 'lambat', 'menunggu', 'bergantung', 'ketergantungan', 'revisi', 'error', 'kesalahan', 'overload', 'belum', 'tidak bisa', 'tidak mampu', 'hambatan', 'kendala', 'terhambat', 'meleset', 'gagal', 'lembur', 'sendiri agar', 'kewalahan'];

function _keywordSentiment_(text) {
  var t = norm_(text);
  if (!t) { return { score: 0, pos: 0, neg: 0 }; }
  var pos = 0, neg = 0;
  POS_WORDS.forEach(function (w) { if (t.indexOf(w) >= 0) { pos++; } });
  NEG_WORDS.forEach(function (w) { if (t.indexOf(w) >= 0) { neg++; } });
  return { score: pos - neg, pos: pos, neg: neg };
}

// Field naratif deskriptif yang relevan untuk analisis makna.
// Menggabungkan narasi karyawan + penilaian manager (sebagai validasi).
function _narrativeFields_(e, mr) {
  var raw = [
    { key: 'Hambatan / tugas lebih lama', a: e.obstacles, src: 'karyawan' },
    { key: 'Usulan penyederhanaan proses', a: e.simplify, src: 'karyawan' },
    { key: 'Area yang ingin dikembangkan', a: e.develop, src: 'karyawan' },
    { key: 'Penyebab selisih target OKR', a: e.okrCause, src: 'karyawan' },
    { key: 'Ketergantungan pada pihak lain', a: e.dependency, src: 'karyawan' },
    { key: 'Kualitas data/brief yang diterima', a: e.material, src: 'karyawan' },
    { key: 'Pekerjaan paling memakan waktu', a: e.mostTime, src: 'karyawan' },
    { key: 'Tugas tambahan di luar job desc', a: e.extraTasks, src: 'karyawan' }
  ];
  if (mr) {
    if (mr.reason)  { raw.push({ key: 'Alasan rekomendasi (penilaian manager)', a: mr.reason, src: 'manager' }); }
    if (mr.okrTarget) { raw.push({ key: 'Objective/target menurut manager', a: mr.okrTarget, src: 'manager' }); }
  }
  return raw.filter(function (x) { return x.a && String(x.a).trim().length > 8; });
}

function _keywordFallback_(fields) {
  var f = [];
  fields.forEach(function (fl) {
    var s = _keywordSentiment_(fl.a);
    if (s.score >= 1) {
      f.push(_mkFinding_('kelebihan', fl.key, String(fl.a).slice(0, 140), String(fl.a).slice(0, 80), 'Narasi (keyword)', 0.55, 'keyword'));
    } else if (s.score <= -1) {
      f.push(_mkFinding_('kekurangan', fl.key, String(fl.a).slice(0, 140), String(fl.a).slice(0, 80), 'Narasi (keyword)', 0.55, 'keyword'));
    }
  });
  return f;
}

// =============================================================================
//  LAYER 3 — GEMINI LLM (structured output + grounding + self-consistency)
// =============================================================================

// Few-shot khas konteks URALA (agensi kreatif: Creative / Digital / PR).
var ANALYSIS_FEWSHOT = [
  { teks: 'Saya aktif mengusulkan workflow baru di Notion supaya brief desain tidak bolak-balik revisi.', aspek: 'Inisiatif & Inovasi Proses', kategori: 'kelebihan' },
  { teks: 'Pekerjaan sering tertunda karena harus menunggu approval konten dari divisi lain.', aspek: 'Ketergantungan Lintas Tim', kategori: 'kekurangan' },
  { teks: 'Saya cenderung mengerjakan semua sendiri agar lebih tenang dan hasilnya sesuai.', aspek: 'Delegasi', kategori: 'kekurangan' },
  { teks: 'Brief dari klien biasanya lengkap jadi saya bisa langsung eksekusi tanpa banyak klarifikasi.', aspek: 'Kualitas Input Kerja', kategori: 'kelebihan' },
  { teks: 'Saya ingin belajar copywriting agar bisa bantu tim PR saat sedang padat.', aspek: 'Growth Mindset', kategori: 'kelebihan' }
];

function _buildAnalysisPrompt_(subjectName, division, fields) {
  var rubrik = '';
  (VALUES || []).forEach(function (comp) {
    var lv = COMPETENCY_BARS[comp];
    if (lv) { rubrik += '- ' + comp + ': L1=' + lv[0] + ' | L3=' + lv[2] + ' | L5=' + lv[4] + '\n'; }
  });

  var fewshot = ANALYSIS_FEWSHOT.map(function (x) {
    return '  {"teks":"' + x.teks.replace(/"/g, "'") + '","aspek":"' + x.aspek + '","kategori":"' + x.kategori + '"}';
  }).join(',\n');

  var inputJson = fields.map(function (fl, i) {
    return '  {"id":' + i + ',"sumber":"' + (fl.src || 'karyawan') + '","pertanyaan":"' + String(fl.key).replace(/"/g, "'") + '","jawaban":"' + String(fl.a).replace(/"/g, "'").replace(/\n/g, ' ') + '"}';
  }).join(',\n');

  return [
    'Anda adalah analis SDM senior di URALA (agensi kreatif, divisi Creative/Digital/PR).',
    'Nilai perusahaan: Agility, Growth Mindset, Problem Solver.',
    'TUGAS: Klasifikasikan tiap jawaban naratif (dari karyawan & manager) menjadi "kelebihan", "kekurangan", atau "netral".',
    'ATURAN PENTING:',
    '1. WAJIB mengutip frasa/kata persis dari jawaban sebagai "bukti". Jika tidak ada bukti tekstual, beri kategori "netral".',
    '2. Bedakan keluhan SISTEM (mis. menunggu approval pihak lain) dari KEKURANGAN PRIBADI karyawan. Keluhan sistem yang di luar kendali karyawan = "netral" (catat aspek tapi jangan jadikan kekurangan pribadi).',
    '3. Pahami nuansa: "lembur demi menyempurnakan" bisa berarti dedikasi (kelebihan) ATAU inefisiensi (kekurangan) — putuskan dari konteks dan turunkan confidence bila ambigu.',
    '4. "confidence" antara 0 dan 1 (0.9+ hanya bila sangat jelas).',
    '5. Selaraskan aspek dengan rubrik kompetensi bila relevan.',
    '6. Jawaban dengan "sumber":"manager" adalah penilaian/validasi atasan — perlakukan sebagai konfirmasi yang lebih otoritatif. Bila narasi manager menguatkan temuan dari karyawan, naikkan confidence; bila bertentangan, utamakan penilaian manager dan turunkan confidence temuan karyawan.',
    '',
    'RUBRIK KOMPETENSI (acuan makna level):',
    rubrik,
    'CONTOH KLASIFIKASI (few-shot):',
    '[\n' + fewshot + '\n]',
    '',
    'DATA KARYAWAN: ' + subjectName + ' (Divisi ' + division + ')',
    'JAWABAN NARATIF:',
    '[\n' + inputJson + '\n]',
    '',
    'KELUARKAN HANYA JSON array (tanpa teks lain), format tiap elemen:',
    '{"kategori":"kelebihan|kekurangan|netral","aspek":"<frasa singkat>","temuan":"<ringkasan 1 kalimat>","bukti":"<kutipan dari jawaban>","confidence":<0..1>}'
  ].join('\n');
}

function _callGemini_(prompt) {
  var key = _getGeminiKey_();
  if (!key) { return null; }
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + _getModel_() + ':generateContent';

  var payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: ANALYSIS_CFG.temperature, responseMimeType: 'application/json' }
  };
  try {
    var res = UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json',
      headers: { 'x-goog-api-key': key },   // cara resmi; berlaku utk key AIza... maupun AQ...
      payload: JSON.stringify(payload), muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    if (code !== 200) { Logger.log('Gemini HTTP ' + code + ': ' + res.getContentText().slice(0, 400)); return null; }
    var json = JSON.parse(res.getContentText());
    var cand = json.candidates && json.candidates[0];
    if (!cand || !cand.content || !cand.content.parts || !cand.content.parts[0]) { return null; }
    return cand.content.parts[0].text;
  } catch (e) {
    Logger.log('Gemini error: ' + e.message);
    return null;
  }
}

// Diagnosa cepat: jalankan fungsi ini dari editor lalu lihat Execution log.
// Menampilkan kode HTTP + isi respons asli dari Gemini (sukses atau error).
function testGemini() {
  var key = _getGeminiKey_();
  if (!key) { Logger.log('BELUM ADA API KEY. Jalankan setupGeminiKey("...") dulu.'); return; }
  Logger.log('Key terdeteksi (awalan): ' + key.slice(0, 6) + '... panjang ' + key.length);
  Logger.log('Model aktif: ' + _getModel_());
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + _getModel_() + ':generateContent';
  try {
    var res = UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json',
      headers: { 'x-goog-api-key': key },
      payload: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Balas hanya dengan kata: OK' }] }] }),
      muteHttpExceptions: true
    });
    Logger.log('HTTP ' + res.getResponseCode());
    Logger.log('Respons: ' + res.getContentText().slice(0, 900));
    if (res.getResponseCode() === 200) { Logger.log('>>> BERHASIL. API key valid & request terkirim. Cek usage di AI Studio.'); }
    else { Logger.log('>>> GAGAL. Lihat pesan error di atas (mis. API_KEY_INVALID, model tidak ditemukan, dsb).'); }
  } catch (e) {
    Logger.log('Exception: ' + e.message);
  }
}

function _parseGeminiJson_(text) {
  if (!text) { return null; }
  var t = String(text).trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  try {
    var arr = JSON.parse(t);
    return Array.isArray(arr) ? arr : null;
  } catch (e) {
    // coba ambil array pertama
    var m = t.match(/\[[\s\S]*\]/);
    if (m) { try { return JSON.parse(m[0]); } catch (e2) { return null; } }
    return null;
  }
}

// Self-consistency: jalankan N kali, lalu majority voting per (aspek+kategori).
function _mergeRuns_(runs) {
  var bucket = {};
  var totalRuns = runs.length;
  runs.forEach(function (arr) {
    (arr || []).forEach(function (it) {
      if (!it || !it.kategori) { return; }
      var kat = norm_(it.kategori);
      if (kat === 'netral') { return; }
      var aspek = it.aspek || '(umum)';
      var k = norm_(aspek) + '|' + kat;
      if (!bucket[k]) { bucket[k] = { kategori: kat, aspek: aspek, temuan: it.temuan || '', bukti: it.bukti || '', confSum: 0, count: 0 }; }
      bucket[k].count++;
      bucket[k].confSum += (typeof it.confidence === 'number' ? it.confidence : 0.7);
      if ((it.temuan || '').length > bucket[k].temuan.length) { bucket[k].temuan = it.temuan; }
      if ((it.bukti || '').length > bucket[k].bukti.length) { bucket[k].bukti = it.bukti; }
    });
  });
  var out = [];
  Object.keys(bucket).forEach(function (k) {
    var b = bucket[k];
    var agreement = b.count / totalRuns;          // konsistensi antar-run
    var modelConf = b.confSum / b.count;           // rata-rata confidence model
    var conf = Math.round(agreement * modelConf * 100) / 100;
    out.push(_mkFinding_(b.kategori, b.aspek, b.temuan, b.bukti, 'Narasi (AI)', conf, 'AI'));
  });
  return out;
}

function _analyzeNarrative_(name, division, fields) {
  if (!fields.length) { return []; }
  var key = _getGeminiKey_();
  if (!key) { return _keywordFallback_(fields); }  // fallback bila key belum diset

  var prompt = _buildAnalysisPrompt_(name, division, fields);
  var runs = [];
  for (var i = 0; i < ANALYSIS_CFG.selfConsistencyRuns; i++) {
    var txt = _callGemini_(prompt);
    var parsed = _parseGeminiJson_(txt);
    if (parsed) { runs.push(parsed); }
  }
  if (!runs.length) { return _keywordFallback_(fields); }  // fallback bila API gagal

  var aiFindings = _mergeRuns_(runs);

  // ENSEMBLE: bila keyword sentiment sepakat arah dgn temuan AI -> +0.08 confidence.
  aiFindings.forEach(function (f) {
    var s = _keywordSentiment_(f.bukti + ' ' + f.temuan);
    if ((f.kategori === 'kelebihan' && s.score >= 1) || (f.kategori === 'kekurangan' && s.score <= -1)) {
      f.confidence = Math.min(1.0, Math.round((f.confidence + 0.08) * 100) / 100);
      f.metode = 'AI+keyword';
    }
  });
  return aiFindings;
}

// Hilangkan temuan duplikat (aspek+kategori), simpan confidence tertinggi.
function _dedupFindings_(arr) {
  var seen = {}, out = [];
  arr.forEach(function (f) {
    var k = norm_(f.aspek) + '|' + norm_(f.kategori);
    if (seen[k] === undefined) { seen[k] = out.length; out.push(f); }
    else if (f.confidence > out[seen[k]].confidence) { out[seen[k]] = f; }
  });
  // urutkan: kelebihan dulu, lalu confidence desc
  out.sort(function (a, b) {
    if (a.kategori !== b.kategori) { return a.kategori === 'kelebihan' ? -1 : 1; }
    return b.confidence - a.confidence;
  });
  return out;
}

// =============================================================================
//  ORKESTRATOR — runAnalysis() menulis ke sheet "Analysis"
//  getAnalysisData() membaca sheet untuk dashboard (cepat, tanpa panggil API).
// =============================================================================
function runAnalysis(token) {
  if (!_checkSession_(token)) { return { _auth: true }; }
  try {
    var data = _buildDashboardData();
    if (data._error) { return { _error: data._error }; }
    var ss = getSpreadsheet_();
    var sh = ss.getSheetByName(ANALYSIS_SHEET) || ss.insertSheet(ANALYSIS_SHEET);
    sh.clearContents();
    sh.getRange(1, 1, 1, ANALYSIS_HEADERS.length).setValues([ANALYSIS_HEADERS]);

    var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    var rows = [];
    var okrRows = [];
    var subjects = 0;

    (data.employees || []).forEach(function (e) {
      if (!e.name) { return; }
      subjects++;
      var mr = null;
      (data.managerEval || []).forEach(function (m) {
        if (norm_(m.employee) === norm_(e.name)) { mr = m; }
      });
      // Tafsirkan OKR secara kontekstual via AI, lalu pakai untuk temuan & cache.
      if ((e.okrTarget && String(e.okrTarget).trim()) || (e.okrActual && String(e.okrActual).trim())) {
        var okr = _interpretOKR_(e.okrTarget, e.okrActual);
        if (okr && okr.pct != null) {
          e.okrPct = okr.pct; e.okrStatus = okr.status; e.okrSummary = okr.summary;
          okrRows.push([e.name, okr.pct, okr.status || '', okr.summary || '', ts]);
        }
      }
      var findings = _analyzeQuant_(e, data.managerEval)
        .concat(_analyzeNarrative_(e.name, e.division, _narrativeFields_(e, mr)));
      findings = _dedupFindings_(findings);
      findings.forEach(function (f) {
        var status = f.confidence >= ANALYSIS_CFG.threshold ? 'Terkonfirmasi' : 'Perlu ditinjau';
        rows.push([ts, e.name, 'Karyawan', e.division || '', f.kategori, f.aspek, f.temuan, f.bukti, f.sumber, f.confidence, f.metode, status]);
      });
    });

    if (rows.length) {
      sh.getRange(2, 1, rows.length, ANALYSIS_HEADERS.length).setValues(rows);
    }

    // Simpan cache tafsiran OKR (dipakai tab Karyawan & Divisi tanpa panggil AI lagi)
    if (okrRows.length) {
      var osh = ss.getSheetByName(OKR_SHEET) || ss.insertSheet(OKR_SHEET);
      osh.clearContents();
      osh.getRange(1, 1, 1, OKR_HEADERS.length).setValues([OKR_HEADERS]);
      osh.getRange(2, 1, okrRows.length, OKR_HEADERS.length).setValues(okrRows);
    }

    return { ok: true, subjects: subjects, findings: rows.length, okr: okrRows.length, lastUpdated: ts, aiActive: !!_getGeminiKey_() };
  } catch (e) {
    return { _error: e.message };
  }
}

function getAnalysisData(token) {
  if (!_checkSession_(token)) { return { _auth: true }; }
  try {
    var ss = getSpreadsheet_();
    var sh = ss.getSheetByName(ANALYSIS_SHEET);
    if (!sh || sh.getLastRow() < 2) {
      return { generated: false, aiActive: !!_getGeminiKey_(), subjects: [] };
    }
    var vv = sh.getDataRange().getValues();
    var bySubj = {};
    var order = [];
    var lastUpdated = '';
    for (var i = 1; i < vv.length; i++) {
      var r = vv[i];
      var name = (r[1] == null) ? '' : String(r[1]).trim();
      if (!name) { continue; }
      var ts = _toStr_(r[0]); if (ts) { lastUpdated = ts; }
      if (!bySubj[name]) {
        bySubj[name] = { name: name, tipe: _toStr_(r[2]), division: _toStr_(r[3]), kelebihan: [], kekurangan: [] };
        order.push(name);
      }
      var conf = Number(r[9]); if (!isFinite(conf)) { conf = 0; }
      var item = {
        aspek: _toStr_(r[5]), temuan: _toStr_(r[6]), bukti: _toStr_(r[7]),
        sumber: _toStr_(r[8]), confidence: conf, metode: _toStr_(r[10]), status: _toStr_(r[11])
      };
      if (String(r[4]).toLowerCase().indexOf('lebih') >= 0) { bySubj[name].kelebihan.push(item); }
      else { bySubj[name].kekurangan.push(item); }
    }
    return {
      generated: true, aiActive: !!_getGeminiKey_(), lastUpdated: String(lastUpdated || ''),
      subjects: order.map(function (k) { return bySubj[k]; })
    };
  } catch (e) {
    return { _error: String(e && e.message || e) };
  }
}



// =============================================================================
//  ROOT CAUSE ANALYSIS (RCA) — MECE -> Fishbone (Ishikawa) -> 5 Whys
//  Alur:
//   1. Ambil masalah (kekurangan) karyawan dari hasil Analysis.
//   2. MECE: klasifikasikan tiap penyebab ke 6 kategori yang mutually exclusive
//      & collectively exhaustive (6M diadaptasi untuk kerja kreatif/knowledge).
//   3. Fishbone: kategori = tulang besar, penyebab spesifik = tulang kecil.
//   4. 5 Whys: sarankan titik mulai (pertanyaan "Mengapa" pertama) dari kategori
//      penyumbang akar masalah paling kuat.
//   NLP (keyword) + LLM (Gemini) dipakai untuk klasifikasi & hipotesis akar.
//
//  getRootCause(token, employeeName) dipanggil dari dashboard (on-demand).
//  Hemat kuota: membaca masalah dari sheet "Analysis" (hasil runAnalysis),
//  lalu LLM hanya dipakai untuk memperkaya RCA.
// =============================================================================

// Kategori MECE (Ishikawa 6M, diadaptasi). ME = tiap penyebab tepat 1 kategori;
// CE = enam kategori ini menutup seluruh kemungkinan sumber masalah kerja.
var MECE_CATS = [
  { id: 'M1', name: 'Manusia & Kompetensi', hint: 'skill, pengetahuan, motivasi, kebiasaan kerja, delegasi, keputusan' },
  { id: 'M2', name: 'Metode & Proses',      hint: 'cara kerja, alur, SOP, langkah manual/berulang, revisi' },
  { id: 'M3', name: 'Alat & Sistem',        hint: 'aplikasi, tools, otomasi, akses sistem, template' },
  { id: 'M4', name: 'Material & Input',     hint: 'kualitas brief/data/aset dari pihak lain, kelengkapan informasi' },
  { id: 'M5', name: 'Beban & Lingkungan',   hint: 'beban kerja, deadline, dependensi, antrian, koordinasi tim' },
  { id: 'M6', name: 'Manajemen & Pengukuran', hint: 'target, prioritas, ekspektasi, supervisi, metrik' }
];

var MECE_KEYWORDS = {
  M1: ['skill', 'kompeten', 'kemampuan', 'belajar', 'pengalaman', 'kebiasaan', 'motivasi', 'agility', 'growth', 'problem solver', 'delegasi', 'keputusan', 'penilaian diri', 'mandiri'],
  M2: ['proses', 'alur', 'langkah', 'sop', 'manual', 'revisi', 'rework', 'cara kerja', 'prosedur', 'workflow', 'disederhanakan', 'kualitas output'],
  M3: ['aplikasi', 'tools', 'alat', 'sistem', 'software', 'otomat', 'akses', 'template', 'perangkat'],
  M4: ['brief', 'data', 'aset', 'input', 'material', 'informasi', 'klarifikasi', 'tidak lengkap', 'akurat', 'mentah'],
  M5: ['beban', 'lembur', 'overload', 'deadline', 'tenggat', 'menunggu', 'bergantung', 'ketergantungan', 'approval', 'koordinasi', 'antri', 'padat', 'tertunda'],
  M6: ['target', 'okr', 'prioritas', 'ekspektasi', 'supervisi', 'arahan', 'pengukuran', 'metrik', 'realistis', 'pelaporan', 'rekomendasi']
};

function _meceClassify_(aspek, text) {
  // Kompetensi inti -> selalu M1 (sinyal kuat).
  var asp = norm_(aspek);
  var isComp = (VALUES || []).concat(LEADERSHIP_COMPETENCIES || []).some(function (c) { return norm_(c) === asp; });
  if (isComp) { return 'M1'; }
  if (asp.indexOf('penilaian diri') >= 0 || asp.indexOf('akurasi') >= 0 || asp.indexOf('pelaporan') >= 0 || asp.indexOf('target') >= 0 || asp.indexOf('pencapaian') >= 0) { return 'M6'; }
  if (asp.indexOf('kualitas output') >= 0) { return 'M2'; }
  if (asp.indexOf('beban') >= 0) { return 'M5'; }
  if (asp.indexOf('material') >= 0 || asp.indexOf('input') >= 0 || asp.indexOf('brief') >= 0) { return 'M4'; }

  var hay = norm_((aspek || '') + ' ' + (text || ''));
  var best = 'M2', bestScore = 0;
  Object.keys(MECE_KEYWORDS).forEach(function (cat) {
    var sc = 0;
    MECE_KEYWORDS[cat].forEach(function (w) { if (hay.indexOf(w) >= 0) { sc++; } });
    if (sc > bestScore) { bestScore = sc; best = cat; }
  });
  return best;
}

function _emptyBuckets_() {
  var b = {};
  MECE_CATS.forEach(function (c) { b[c.id] = { id: c.id, name: c.name, hint: c.hint, causes: [] }; });
  return b;
}

function _meceBuckets_(problems) {
  var b = _emptyBuckets_();
  problems.forEach(function (p) {
    var cat = _meceClassify_(p.aspek, p.temuan);
    b[cat].causes.push({
      cause: String(p.temuan || p.aspek || ''),
      evidence: String(p.bukti || p.sumber || ''),
      from: 'data'
    });
  });
  return b;
}

function _bucketsToArr_(b) {
  return MECE_CATS.map(function (c) {
    var bb = b[c.id];
    return {
      id: c.id, name: c.name, hint: c.hint,
      causes: (bb.causes || []).map(function (x) {
        return { cause: String(x.cause || ''), evidence: String(x.evidence || ''), from: String(x.from || 'data') };
      })
    };
  });
}

function _topBucketId_(b) {
  var top = MECE_CATS[0].id;
  MECE_CATS.forEach(function (c) { if (b[c.id].causes.length > b[top].causes.length) { top = c.id; } });
  return top;
}

function _rcaEffect_(problems) {
  var txt = problems.map(function (p) { return norm_(p.aspek + ' ' + p.temuan); }).join(' ');
  if (txt.indexOf('overload') >= 0 || txt.indexOf('lembur') >= 0 || txt.indexOf('beban') >= 0) { return 'Beban kerja berlebih & risiko inefisiensi/burnout'; }
  if (txt.indexOf('rework') >= 0 || txt.indexOf('kualitas output') >= 0) { return 'Kualitas output rendah (tingkat revisi/rework tinggi)'; }
  if (txt.indexOf('okr') >= 0 || txt.indexOf('target') >= 0 || txt.indexOf('pencapaian') >= 0) { return 'Target/OKR tidak tercapai sesuai ekspektasi'; }
  var comp = problems.filter(function (p) { return (VALUES || []).some(function (v) { return norm_(p.aspek) === norm_(v); }); })[0];
  if (comp) { return 'Gap kompetensi pada ' + comp.aspek; }
  return problems.length ? String(problems[0].temuan) : 'Tidak ada masalah signifikan';
}

function _fiveWhysFallback_(effect, b) {
  var topId = _topBucketId_(b);
  var cat = b[topId];
  var firstCause = (cat.causes[0] && cat.causes[0].cause) ? cat.causes[0].cause : effect;
  return {
    problem: effect,
    first_why: 'Mengapa ' + String(effect).charAt(0).toLowerCase() + String(effect).slice(1) + '?',
    focus: cat.name,
    rationale: 'Mulai dari kategori "' + cat.name + '" karena menyumbang penyebab terbanyak. Telusuri lebih dulu: ' + firstCause
  };
}

function _normFiveWhys_(fw, effect) {
  fw = fw || {};
  return {
    problem: String(fw.problem || effect || ''),
    first_why: String(fw.first_why || ''),
    focus: String(fw.focus || fw.focusCategory || ''),
    rationale: String(fw.rationale || '')
  };
}

function _avgConf_(problems) {
  if (!problems.length) { return 1; }
  var s = 0, n = 0;
  problems.forEach(function (p) { var c = Number(p.confidence); if (isFinite(c)) { s += c; n++; } });
  return n ? Math.round(s / n * 100) / 100 : 0.8;
}

// Parser objek JSON tunggal dari output LLM.
function _parseGeminiObj_(text) {
  if (!text) { return null; }
  var t = String(text).trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  try { var o = JSON.parse(t); return (o && typeof o === 'object' && !Array.isArray(o)) ? o : null; }
  catch (e) {
    var m = t.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (e2) { return null; } }
    return null;
  }
}

// LLM enrichment untuk RCA. Mengembalikan objek {effect, root_cause, categories, five_whys_start, confidence} atau null.
function _rcaLLM_(name, division, problems) {
  var key = _getGeminiKey_();
  if (!key) { return null; }

  var probList = problems.map(function (p, i) {
    return '  {"id":' + i + ',"masalah":"' + String(p.temuan || '').replace(/"/g, "'") + '","aspek":"' + String(p.aspek || '').replace(/"/g, "'") + '","bukti":"' + String(p.bukti || '').replace(/"/g, "'") + '"}';
  }).join(',\n');

  var cats = MECE_CATS.map(function (c) { return c.id + '=' + c.name + ' (' + c.hint + ')'; }).join('; ');

  var prompt = [
    'Anda adalah konsultan continuous improvement di URALA (agensi kreatif).',
    'Lakukan Root Cause Analysis untuk karyawan ' + name + ' (Divisi ' + division + ') secara DISIPLIN dan AKURAT.',
    '',
    'DAFTAR MASALAH (kekurangan) terdeteksi:',
    '[\n' + probList + '\n]',
    '',
    'KATEGORI MECE (gunakan PERSIS enam ini): ' + cats,
    '',
    'INSTRUKSI:',
    '1. Tentukan SATU "effect" = masalah inti paling berdampak (ringkas, 1 kalimat).',
    '2. Petakan tiap penyebab ke TEPAT SATU kategori MECE (mutually exclusive, tidak tumpang tindih). Jika satu masalah punya beberapa akar, pecah menjadi beberapa penyebab di kategori berbeda.',
    '3. Untuk tiap penyebab sertakan "evidence" singkat dari data/bukti.',
    '4. Rumuskan SATU "root_cause" = hipotesis akar yang paling mungkin (spesifik, dapat ditindaklanjuti).',
    '5. Sarankan titik mulai 5 Whys: "problem" (pernyataan masalah), "first_why" (pertanyaan Mengapa pertama yang paling tepat), "focus" (nama kategori MECE yang jadi titik mulai), dan "rationale" (alasan singkat kenapa mulai dari sana).',
    '6. "confidence" 0..1.',
    '',
    'KELUARKAN HANYA JSON objek (tanpa teks lain):',
    '{"effect":"...","root_cause":"...","categories":[{"id":"M1","causes":[{"cause":"...","evidence":"..."}]}],"five_whys_start":{"problem":"...","first_why":"...","focus":"...","rationale":"..."},"confidence":0.0}'
  ].join('\n');

  var runs = [];
  for (var i = 0; i < 2; i++) {
    var txt = _callGemini_(prompt);
    var obj = _parseGeminiObj_(txt);
    if (obj) { runs.push(obj); }
  }
  if (!runs.length) { return null; }

  // Gabung: pakai run pertama sebagai dasar, union causes dari run kedua (dedup).
  var base = runs[0];
  if (runs[1] && runs[1].categories) {
    var byId = {};
    (base.categories || []).forEach(function (c) { byId[c.id] = c; });
    runs[1].categories.forEach(function (c) {
      if (!byId[c.id]) { (base.categories = base.categories || []).push(c); byId[c.id] = c; }
      else {
        var existing = (byId[c.id].causes || []).map(function (x) { return norm_(x.cause).slice(0, 30); });
        (c.causes || []).forEach(function (x) {
          if (existing.indexOf(norm_(x.cause).slice(0, 30)) < 0) { byId[c.id].causes.push(x); }
        });
      }
    });
  }
  return base;
}

// Tempel penyebab hasil LLM ke bucket MECE (dedup terhadap penyebab rule-based).
function _mergeLLMCauses_(buckets, llmCats) {
  (llmCats || []).forEach(function (c) {
    var id = String(c.id || '').toUpperCase();
    if (!buckets[id]) { return; }
    var existing = buckets[id].causes.map(function (x) { return norm_(x.cause).slice(0, 30); });
    (c.causes || []).forEach(function (x) {
      var key = norm_(x.cause || '').slice(0, 30);
      if (key && existing.indexOf(key) < 0) {
        buckets[id].causes.push({ cause: String(x.cause || ''), evidence: String(x.evidence || ''), from: 'AI' });
        existing.push(key);
      }
    });
  });
}

function getRootCause(token, employeeName) {
  if (!_checkSession_(token)) { return { _auth: true }; }
  try {
    var ad = getAnalysisData(token);
    if (ad && ad._auth) { return { _auth: true }; }
    if (ad && ad._error) { return { _error: ad._error }; }
    if (!ad || !ad.generated) { return { _error: 'Belum ada hasil Analysis. Klik "Jalankan Analisis AI" dulu, lalu coba lagi.' }; }

    var subj = null;
    (ad.subjects || []).forEach(function (s) { if (norm_(s.name) === norm_(employeeName)) { subj = s; } });
    if (!subj) { return { _error: 'Data analisis untuk "' + employeeName + '" tidak ditemukan. Jalankan ulang Analisis AI.' }; }

    var problems = (subj.kekurangan || []).map(function (it) {
      return { temuan: it.temuan, aspek: it.aspek, bukti: it.bukti, sumber: it.sumber, confidence: it.confidence };
    });

    if (!problems.length) {
      return {
        employee: subj.name, division: subj.division, aiActive: !!_getGeminiKey_(),
        noProblem: true, effect: 'Tidak ada kekurangan signifikan terdeteksi',
        rootCause: '-', categories: _bucketsToArr_(_emptyBuckets_()), fiveWhys: null, confidence: 1
      };
    }

    var buckets = _meceBuckets_(problems);
    var effect = _rcaEffect_(problems);
    var rootCause = '';
    var fiveWhys = null;
    var conf = _avgConf_(problems);

    var llm = _rcaLLM_(subj.name, subj.division, problems);
    if (llm) {
      if (llm.effect) { effect = String(llm.effect); }
      if (llm.root_cause) { rootCause = String(llm.root_cause); }
      if (llm.categories) { _mergeLLMCauses_(buckets, llm.categories); }
      if (llm.five_whys_start) { fiveWhys = _normFiveWhys_(llm.five_whys_start, effect); }
      if (typeof llm.confidence === 'number' && isFinite(llm.confidence)) { conf = Math.round(llm.confidence * 100) / 100; }
    }
    if (!rootCause) {
      var topId = _topBucketId_(buckets);
      var c0 = buckets[topId].causes[0];
      rootCause = c0 ? c0.cause : effect;
    }
    if (!fiveWhys) { fiveWhys = _fiveWhysFallback_(effect, buckets); }

    return {
      employee: subj.name, division: subj.division, aiActive: !!_getGeminiKey_(),
      effect: String(effect), rootCause: String(rootCause),
      categories: _bucketsToArr_(buckets), fiveWhys: fiveWhys,
      confidence: conf, method: llm ? 'AI+rule' : 'rule'
    };
  } catch (e) {
    return { _error: String(e && e.message || e) };
  }
}



// =============================================================================
//  OKR INTERPRETER (AI) — menafsirkan target & realisasi yang berupa narasi
//  bebas menjadi tingkat pencapaian (%) yang kontekstual, bukan sekadar
//  mengambil angka pertama. Hasil di-cache di sheet "OKR Analysis".
// =============================================================================

var OKR_SHEET = 'OKR Analysis';
var OKR_HEADERS = ['Subjek', 'Capaian (%)', 'Status', 'Ringkasan', 'Timestamp'];

// true bila string hanya berupa angka sederhana (mis. "85", "85%", "3.5") — aman dihitung naif.
function _isSimpleNum_(s) {
  s = String(s == null ? '' : s).trim();
  return /^\d+([.,]\d+)?\s*%?$/.test(s);
}

function _interpretOKR_(target, actual) {
  var key = _getGeminiKey_();
  if (!key) { return null; }
  target = String(target == null ? '' : target).trim();
  actual = String(actual == null ? '' : actual).trim();
  if (!target && !actual) { return null; }

  var prompt = [
    'Anda analis kinerja di URALA. Diberi TARGET dan REALISASI (OKR) yang sering ditulis bebas:',
    'banyak objektif sekaligus, persen parsial, dan istilah seperti "all achieve", "under achieve", "ongoing", "sourcing".',
    'TUGAS: simpulkan TINGKAT PENCAPAIAN KESELURUHAN secara kontekstual — JANGAN hanya mengambil angka.',
    '',
    'ATURAN:',
    '- Persen pada metrik parsial (mis. "khusus impression 500%") JANGAN dihitung sebagai capaian objektif penuh; objektif yang tercapai maksimal dianggap ~100%, bukan 500%.',
    '- "100% all achieve" = objektif tercapai penuh. "under achieve" = di bawah target. "ongoing/sourcing/0%" = belum berjalan (anggap rendah).',
    '- Rata-ratakan secara adil lintas semua objektif yang disebut.',
    '- Abaikan angka tahun/tanggal (mis. "2026") sebagai capaian.',
    '- Hasil 0-100; boleh sedikit di atas 100 (maksimum 120) HANYA bila benar-benar over-achieve menyeluruh.',
    '',
    'TARGET:\n' + target,
    '',
    'REALISASI:\n' + actual,
    '',
    'Keluarkan HANYA JSON: {"pct":<angka 0-120>,"status":"<ringkas, mis. Sebagian besar tercapai>","summary":"<1-2 kalimat konteks>"}'
  ].join('\n');

  var runs = [];
  for (var i = 0; i < 2; i++) {
    var o = _parseGeminiObj_(_callGemini_(prompt));
    if (o && typeof o.pct !== 'undefined' && o.pct !== null) { runs.push(o); }
  }
  if (!runs.length) { return null; }

  var pcts = runs.map(function (o) { return Number(o.pct); }).filter(function (x) { return isFinite(x); });
  if (!pcts.length) { return null; }
  var pct = Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length);
  if (pct < 0) { pct = 0; }
  if (pct > 120) { pct = 120; }
  return { pct: pct, status: String(runs[0].status || ''), summary: String(runs[0].summary || '') };
}

function _readOkrCache_(ss) {
  var out = {};
  var sh = ss.getSheetByName(OKR_SHEET);
  if (!sh || sh.getLastRow() < 2) { return out; }
  var vv = sh.getDataRange().getValues();
  for (var i = 1; i < vv.length; i++) {
    var n = vv[i][0]; if (!n) { continue; }
    var p = Number(vv[i][1]);
    out[norm_(n)] = { pct: isFinite(p) ? p : null, status: _toStr_(vv[i][2]), summary: _toStr_(vv[i][3]) };
  }
  return out;
}

function _attachOkr_(ss, data) {
  var cache = _readOkrCache_(ss);
  (data.employees || []).forEach(function (e) {
    var o = cache[norm_(e.name)];
    if (o) { e.okrPct = o.pct; e.okrStatus = o.status; e.okrSummary = o.summary; }
    else { e.okrPct = null; e.okrStatus = ''; e.okrSummary = ''; }
  });
}



// =============================================================================
//  PEMILIHAN MODEL GEMINI
//  Akun/key tertentu hanya punya kuota free-tier pada sebagian model.
//  - findWorkingGeminiModel(): coba beberapa model, simpan yang berhasil (200).
//  - listGeminiModels(): tampilkan daftar model yang bisa diakses key Anda.
//  - setGeminiModel('nama-model'): set manual.
// =============================================================================

var PROP_GEMINI_MODEL = 'GEMINI_MODEL';

function _getModel_() {
  return PropertiesService.getScriptProperties().getProperty(PROP_GEMINI_MODEL) || ANALYSIS_CFG.model;
}

function setGeminiModel(name) {
  if (!name) { Logger.log('Pakai: setGeminiModel("gemini-2.5-flash")'); return; }
  PropertiesService.getScriptProperties().setProperty(PROP_GEMINI_MODEL, String(name).trim());
  Logger.log('Model disetel ke: ' + String(name).trim());
}

// Coba beberapa model, pakai & simpan model pertama yang mengembalikan HTTP 200.
function findWorkingGeminiModel() {
  var key = _getGeminiKey_();
  if (!key) { Logger.log('BELUM ADA API KEY. Jalankan setupGeminiKey("...") dulu.'); return; }
  var candidates = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-flash-latest',
    'gemini-1.5-flash'
  ];
  var found = '';
  for (var i = 0; i < candidates.length; i++) {
    var m = candidates[i];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent';
    try {
      var res = UrlFetchApp.fetch(url, {
        method: 'post', contentType: 'application/json',
        headers: { 'x-goog-api-key': key },
        payload: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'OK' }] }] }),
        muteHttpExceptions: true
      });
      var code = res.getResponseCode();
      Logger.log(m + ' -> HTTP ' + code);
      if (code === 200) { found = m; break; }
      else { Logger.log('   ' + res.getContentText().slice(0, 160)); }
    } catch (e) { Logger.log(m + ' -> error ' + e.message); }
    Utilities.sleep(800); // jeda agar tidak kena rate limit
  }
  if (found) {
    setGeminiModel(found);
    Logger.log('>>> BERHASIL. Model yang dipakai: ' + found + '. Dashboard siap memakai AI.');
  } else {
    Logger.log('>>> Tidak ada model dengan kuota gratis untuk key ini.');
    Logger.log('    Kemungkinan akun belum punya free tier. Aktifkan billing di Google Cloud project ');
    Logger.log('    (https://aistudio.google.com -> Get API key -> project -> enable billing), atau pakai akun/region lain.');
  }
}

// Tampilkan daftar model yang dapat diakses oleh API key Anda.
function listGeminiModels() {
  var key = _getGeminiKey_();
  if (!key) { Logger.log('BELUM ADA API KEY.'); return; }
  try {
    var res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      method: 'get', headers: { 'x-goog-api-key': key }, muteHttpExceptions: true
    });
    Logger.log('HTTP ' + res.getResponseCode());
    var json = JSON.parse(res.getContentText());
    (json.models || []).forEach(function (m) {
      var methods = (m.supportedGenerationMethods || []).join(',');
      if (methods.indexOf('generateContent') >= 0) { Logger.log(m.name + '  [' + methods + ']'); }
    });
  } catch (e) { Logger.log('error: ' + e.message); }
}
