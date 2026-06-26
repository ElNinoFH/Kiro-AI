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
var DASHBOARD_SPREADSHEET_ID = '';

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
    var has = values[r].some(function (c) { return c !== '' && c !== null; });
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

function getDashboardData() {
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

    function val(row, kw) { var c = findCol_(headers, kw); return c >= 0 ? cellStr_(row[c]) : ''; }
    function levels(row) {
      var out = {};
      for (var i = 0; i < headers.length; i++) {
        var h = String(headers[i]);
        var idx = h.toLowerCase().indexOf('untuk kompetensi');
        if (idx >= 0) {
          var comp = h.substring(idx + 'untuk kompetensi'.length).replace(/\?\s*$/, '').trim();
          var lvl = stmtMap[norm_(row[i])];
          if (lvl) { out[comp] = lvl; }
        }
      }
      return out;
    }

    if (sheetType === 'karyawan') {
      parsed.rows.forEach(function (row) {
        data.employees.push({
          name: val(row, 'nama lengkap'),
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
          bars: levels(row)
        });
      });
    } else if (sheetType === 'managerself') {

      parsed.rows.forEach(function (row) {
        data.managerSelf.push({
          manager: val(row, 'nama manager'),
          division: val(row, 'divisi yang dipimpin'),
          teamSize: val(row, 'jumlah anggota tim'),
          visiMisiComm: val(row, 'mengomunikasikan visi-misi'),
          visiMisiExample: val(row, 'keputusan tim yang langsung'),
          bars: levels(row)
        });
      });
    } else if (sheetType === 'owner') {
      parsed.rows.forEach(function (row) {
        data.ownerEval.push({
          manager: val(row, 'nama manager yang dinilai'),
          division: val(row, 'divisi'),
          visiMisiStatement: val(row, 'membawa visi-misi'),
          recommendation: val(row, 'rekomendasi owner'),
          reason: val(row, 'alasan rekomendasi'),
          bars: levels(row)
        });
      });
    } else if (sheetType === 'manager') {
      parsed.rows.forEach(function (row) {
        data.managerEval.push({
          manager: val(row, 'nama manager (penilai)'),
          division: val(row, 'divisi'),
          employee: val(row, 'nama karyawan yang dinilai'),
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

  return data;
}
