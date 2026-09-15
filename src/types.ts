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

export interface FilterOptions {
  searchQuery: string;
  peternak: string;
  lokasi: string;
  bangsa: string;
  jenisKelamin: string;
  umur: string;
  statusKesehatan: string;
}
