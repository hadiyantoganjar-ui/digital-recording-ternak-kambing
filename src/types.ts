export type JenisKelamin = 'Jantan' | 'Betina';

export type UmurKategori = 'I0' | 'I1' | 'I2' | 'I3' | 'I4' | 'Belum Diketahui';

export type StatusKesehatanUtama = 'Sehat' | 'Sakit' | 'Dalam Perawatan' | 'Karantina';

export interface RiwayatBobot {
  id?: string;
  tanggal: string;
  bobot: number; // in kg
  pakanSaatTimbang?: string; // misal: 'Hijauan Saja', 'Hijauan 70% + Konsentrat 30%'
  lingkarDadaCm?: number; // lingkar dada dalam cm (estimasi morfometrik)
  petugasPenimbang?: string;
  catatan?: string;
}

export interface PrediksiHargaTernak {
  bobotKg: number;
  hargaDasarPerKg: number; // Rp per kg timbang hidup di Lampung
  faktorKelamin: number; // Pengali jantan vs betina
  faktorBangsa: number; // Pengali bangsa ternak (Boer, Saburai, PE, dll)
  faktorKelayakan: number; // Pengali umur gigi/poel (I1+ layak qurban)
  faktorArea?: number; // Pengali pasar area Lampung
  namaAreaPasar?: string; // Nama pasar hewan Lampung rujukan
  selisihVsProvinsi?: number; // Selisih vs rata-rata provinsi
  estimasiHargaTotal: number; // Hasil estimasi rupiah
  rangeHargaMin: number;
  rangeHargaMax: number;
  kategoriPasar: 'Bibit/Bakalan' | 'Akikah Standar' | 'Kurban Standar' | 'Kurban Super/Premium';
}

export interface ModelNutrisiAdg {
  kategoriRansum: string;
  persentaseHijauan: number;
  persentaseKonsentrat: number;
  estimasiProteinKasar: number; // % PK
  estimasiTDN: number; // % Total Digestible Nutrients
  kisaranAdgGramPerHari: [number, number]; // [min, max] gram/hari
  rasioKonversiPakan: number; // FCR perkiraan
  referensiIlmiah: string;
}

export interface CatatanKesehatan {
  id: string;
  tanggalPemeriksaan: string;
  jenisPenyakit: string;
  pengobatanDiberikan: string;
  kondisiSaatIni?: 'Sakit' | 'Membaik' | 'Sembuh';
  petugas?: string;
  catatan?: string;
}

export interface DataPakan {
  jenisPakan: string; // misal: 'Hijauan Segar (Rumput Odot & Indigofera)', 'Konsentrat + Fermentasi'
  komposisiPakan?: string;
  frekuensiPemberian?: string; // misal: '2x Sehari (Pagi & Sore)'
  jumlahHarianKg?: number;
  catatanPakan?: string;
}

export interface CatatanPakanHarian {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jenisHijauan: string; // misal: 'Rumput Odot', 'Rumput Pakchong', 'Daun Indigofera', 'Daun Gamal', 'Rumput Lapang'
  takaranHijauanKg: number; // kg hijauan segar per ekor per hari
  jenisKonsentrat: string; // misal: 'Konsentrat Penggemukan (PK 16%)', 'Dedak Padi Halus + Bungkil Sawit', 'Ampas Tahu', 'Konsentrat Riset Unila'
  takaranKonsentratKg: number; // kg konsentrat per ekor per hari
  frekuensi?: string; // misal: '2x Sehari (Pagi & Sore)'
  suplemenMineral?: string; // misal: 'Premix Mineral + Garam Dapur', 'Molasses / Tetes Tebu', 'Probiotik EM4'
  nafsuMakan?: 'Sangat Lahap (Habis)' | 'Normal' | 'Sisa Sedikit' | 'Kurang Nafsu';
  biayaPakanHarianRp?: number; // Estimasi biaya pakan/ekor/hari
  petugas?: string;
  catatan?: string;
}

export interface AnalisisEfisiensiPakanInterval {
  periode: string;
  tanggalAwal: string;
  tanggalAkhir: string;
  durasiHari: number;
  bobotAwal: number;
  bobotAkhir: number;
  pertambahanBobotKg: number;
  adgGramPerHari: number;
  rerataHijauanKgPerHari: number;
  rerataKonsentratKgPerHari: number;
  proporsiKonsentratPersen: number;
  totalPakanSegarKg: number;
  totalKonsumsiBahanKeringKg: number;
  fcrSegar: number; // Rasio Pakan Segar terhadap Pertambahan Bobot
  fcrBahanKering: number; // FCR Bahan Kering (Standard Ilmiah NRC/Balitnak)
  statusEfisiensi: 'Sangat Efisien' | 'Efisien (Standar Baik)' | 'Cukup / Moderat' | 'Kurang Efisien';
  evaluasiIlmiah: string;
  estimasiTotalBiayaPakan: number;
  biayaPerKgPertambahan: number; // Rp / kg pertambahan bobot
}

export interface GoatRecord {
  id: string;
  nomorRfid: string;
  nomorEartag: string;
  namaPeternak: string;
  lokasi: string;
  bangsaTernak: string; // misal: PE, Boer, Saburai, Rambon, Jawa Randu, dll
  bobotBadan: number; // in kg
  umur: UmurKategori;
  jenisKelamin: JenisKelamin;
  statusKesehatan: StatusKesehatanUtama;
  statusReproduksi?: StatusReproduksi;
  tanggalBirahiTerakhir?: string; // YYYY-MM-DD
  riwayatBirahi?: CatatanBirahi[];
  riwayatKebuntingan?: CatatanKebuntingan[];
  riwayatKesehatan: CatatanKesehatan[];
  riwayatBobot: RiwayatBobot[];
  riwayatPakanHarian?: CatatanPakanHarian[];
  pakan: DataPakan;
  nomorPejantan?: string;
  nomorInduk?: string;
  timestampAwal?: string;
  catatanTambahan?: string;
  updatedAt: string;
}

export type StatusReproduksi = 
  | 'Dara (Belum Dikawinkan)' 
  | 'Siap Kawin / Siklus Aktif' 
  | 'Bunting' 
  | 'Laktasi / Menyusui' 
  | 'Afkir / Tidak Produktif'
  | 'Belum Cukup Umur';

export interface CatatanBirahi {
  id: string;
  tanggalBirahi: string; // YYYY-MM-DD
  gejalaKlinis?: string[]; // misal: ['Vulva Bengkak & Kemerahan', 'Lendir Transparan', 'Gelisah & Mengibaskan Ekor', 'Standing Heat (Diam Dinaiki)', 'Nafsu Makan Turun', 'Sering Mengembik']
  intensitasBirahi?: 'Sangat Jelas / Kuat' | 'Sedang' | 'Lemah / Tenang (Silent Heat)';
  tindakan?: 'Dikawinkan Pejantan' | 'Inseminasi Buatan (IB)' | 'Hanya Dicatat (Tidak Dikawinkan)';
  pejantanId?: string; // Eartag / Nama pejantan pemacak jika dikawinkan
  petugasPengamat?: string;
  catatan?: string;
}

export interface CatatanKebuntingan {
  id: string;
  tanggalKawin: string; // YYYY-MM-DD
  nomorPejantan?: string;
  metodeKawin: 'Alami' | 'Inseminasi Buatan (IB)';
  statusKonfirmasi: 'Belum Terkonfirmasi' | 'Positif Bunting' | 'Tidak Bunting / Kosong' | 'Sudah Melahirkan';
  estimasiHPL?: string; // Hari Perkiraan Lahir (gestasi ~150 hari)
  catatan?: string;
}

export type StatusFaseBirahi = 
  | 'BIRAHI_AKTIF' // Hari H s/d H+1 (Standing heat / puncak birahi) -> ALARM MERAH BERKEDIP
  | 'SIAGA_PROESTRUS' // H-1 s/d H-3 (Fase folikuler / persiapan kawin) -> ALARM KUNING
  | 'METESTRUS' // H+1 s/d H+3 (Pasca ovulasi)
  | 'DIESTRUS' // H+4 s/d H+17 (Fase luteal / tenang)
  | 'TERLEWAT_EVALUASI' // > 25 hari tanpa rekaman baru / indikasi silent heat atau bunting
  | 'TIDAK_APLIKATIF'; // Jantan, Cempe belum puber, Bunting, atau Belum ada data

export interface HasilPrediksiBirahi {
  isEligible: boolean; // false jika Jantan, Bunting, Cempe < pubertas, atau data tidak ada
  alasanIneligible?: string;
  tanggalBirahiTerakhir?: string;
  tanggalPerkiraanBirahiBerikutnya?: string;
  rentangPerkiraanMin?: string;
  rentangPerkiraanMax?: string;
  hariKeDalamSiklus?: number; // 1 s/d 21
  sisaHariMenujuBirahi?: number; // 0 = hari ini, negatif jika terlewat
  statusFase: StatusFaseBirahi;
  
  // Real-time Alarm & Notifikasi
  isAlarmActive: boolean;
  tingkatUrgensi: 'TINGGI' | 'SEDANG' | 'NORMAL' | 'EVALUASI' | 'NONE';
  pesanAlarm: string;
  badgeLabel: string;
  badgeColor: string;
  rekomendasiTindakan: string;
  waktuKawinTerbaik: string;
  gejalaKunci: string[];
  persentaseSiklusBerjalan: number; // 0 - 100%
}

export interface FilterOptions {
  searchQuery: string;
  peternak: string;
  lokasi: string;
  bangsa: string;
  jenisKelamin: string;
  umur: string;
  statusKesehatan: string;
  statusBirahi?: string;
}
