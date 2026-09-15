import { 
  ModelNutrisiAdg, 
  PrediksiHargaTernak, 
  JenisKelamin, 
  UmurKategori,
  CatatanPakanHarian,
  AnalisisEfisiensiPakanInterval,
  RiwayatBobot,
  DataPakan,
  GoatRecord,
  HasilPrediksiBirahi,
  StatusFaseBirahi
} from '../types';

/**
 * Model Hubungan Nutrisi Pakan (Hijauan vs Konsentrat) terhadap Pertambahan Bobot Badan Harian (PBBH / ADG)
 * Berdasarkan literatur ilmiah terpublikasi di Indonesia & Provinsi Lampung:
 * - Riset Nutrisi Kambing Fapet Universitas Lampung (Unila)
 * - Balai Penelitian Ternak (Balitnak) & Jurnal Ilmu Ternak dan Veteriner (JITV)
 * - Publikasi Polinela Lampung & Standar NRC (2007)
 */
export const MODEL_NUTRISI_ADG: ModelNutrisiAdg[] = [
  {
    kategoriRansum: 'Tradisional (100% Rumput Alam / Lapangan)',
    persentaseHijauan: 100,
    persentaseKonsentrat: 0,
    estimasiProteinKasar: 8.2, // % PK
    estimasiTDN: 51.5, // % Total Digestible Nutrients
    kisaranAdgGramPerHari: [25, 55],
    rasioKonversiPakan: 12.5,
    referensiIlmiah: 'Studi Peternakan Rakyat Lampung Utara & Selatan (Polinela & Unila): Hijauan rumput lapang tanpa penguat hanya mencukupi kebutuhan hidup pokok (maintenance) dengan PBBH 20-50 g/hari.',
  },
  {
    kategoriRansum: 'Hijauan Berkualitas (Rumput Odot 60% + Legum Indigofera/Gamal 40%)',
    persentaseHijauan: 100,
    persentaseKonsentrat: 0,
    estimasiProteinKasar: 13.5,
    estimasiTDN: 58.0,
    kisaranAdgGramPerHari: [60, 95],
    rasioKonversiPakan: 9.2,
    referensiIlmiah: 'Riset Balitnak & Balai Karantina Pertanian: Pemanfaatan leguminosa berprotein tinggi (Indigofera zollingeriana & Gliricidia sepium) mendongkrak retensi nitrogen tanpa konsentrat pabrik.',
  },
  {
    kategoriRansum: 'Ransum Terpadu Standar (Hijauan 70% + Konsentrat Penguat 30%)',
    persentaseHijauan: 70,
    persentaseKonsentrat: 30,
    estimasiProteinKasar: 14.8,
    estimasiTDN: 66.5,
    kisaranAdgGramPerHari: [95, 145],
    rasioKonversiPakan: 7.2,
    referensiIlmiah: 'Riset Fapet Unila pada Kambing PE & Boerawa pascasapih: Pemberian konsentrat dedak padi + bungkil + premix 30% di pagi hari menghasilkan PBBH optimal 105 - 133 g/hari.',
  },
  {
    kategoriRansum: 'Penggemukan Intensif (Hijauan 40-50% + Konsentrat Energi-Protein 50-60%)',
    persentaseHijauan: 45,
    persentaseKonsentrat: 55,
    estimasiProteinKasar: 16.5,
    estimasiTDN: 72.0,
    kisaranAdgGramPerHari: [150, 220],
    rasioKonversiPakan: 5.8,
    referensiIlmiah: 'Neliti & JITV Penggemukan Kambing Pedaging Jantan: Ransum konsentrat tinggi mempercepat pertumbuhan karkas kambing bakalan menjelang Idul Adha dengan FCR terbaik.',
  },
];

/**
 * Data Acuan Harga Pasar Hewan di Wilayah Lampung
 * Sumber data: Pemantauan Pasar Hewan Sukanegara (Bangunrejo, Lampung Tengah),
 * Pasar Hewan Sukoharjo (Pringsewu), Pasar Kalirejo, Tanggamus, dan Pesawaran.
 */
export const HARGA_PASAR_LAMPUNG = {
  tanggalUpdate: 'September 2026',
  wilayah: 'Provinsi Lampung (Lampung Tengah, Pringsewu, Tanggamus, Bandar Lampung)',
  timbangHidupPerKg: {
    jantanKurbanSiapPotong: { min: 80000, acuan: 85000, max: 95000 },
    jantanBakalanMuda: { min: 75000, acuan: 80000, max: 88000 },
    betinaDewasaInduk: { min: 65000, acuan: 72000, max: 78000 },
    betinaBakalanDara: { min: 62000, acuan: 68000, max: 74000 },
  },
  hargaJogroganPerEkor: [
    {
      kategori: 'Kambing Akikah / Jantan Standar',
      bobotRentang: '20 - 25 kg',
      kisaranHarga: 'Rp 1.800.000 - Rp 2.400.000',
      keterangan: 'Cocok untuk ibadah aqiqah, biasanya umur gigi I0 atau I1.',
    },
    {
      kategori: 'Kambing Kurban Kelas Standar',
      bobotRentang: '26 - 30 kg',
      kisaranHarga: 'Rp 2.500.000 - Rp 3.000.000',
      keterangan: 'Syarat poel 1 pasang (I1) terpenuhi, kondisi sehat tidak cacat.',
    },
    {
      kategori: 'Kambing Kurban Kelas Medium',
      bobotRentang: '31 - 38 kg',
      kisaranHarga: 'Rp 3.100.000 - Rp 4.200.000',
      keterangan: 'Kambing PE / Saburai jantan gemuk dengan karkas tebal.',
    },
    {
      kategori: 'Kambing Kurban Kelas Super / Premium',
      bobotRentang: '> 39 - 50+ kg',
      kisaranHarga: 'Rp 4.300.000 - Rp 6.000.000+',
      keterangan: 'Pejantan Boer, Boer Cross, atau Saburai super konformasi karkas tinggi.',
    },
    {
      kategori: 'Indukan Produktif / Bibit Betina',
      bobotRentang: '22 - 32 kg',
      kisaranHarga: 'Rp 1.700.000 - Rp 2.400.000',
      keterangan: 'Betina produktif siap kawin atau bunting muda.',
    },
  ],
};

/**
 * Prediksi Nilai Jual Kambing Berdasarkan Bobot Badan Hidup & Karakteristik Ternak
 * 
 * Model Ilmiah:
 * Berdasarkan studi korelasi regresi penjualan ternak kambing (r = 0.810 - 0.848 antara Bobot Badan dengan Harga):
 * Harga = (Bobot Badan * Harga Dasar per Kg) * Faktor Kelamin * Faktor Bangsa * Faktor Kelayakan/Umur
 */
export function hitungPrediksiHargaKambing(
  bobotKg: number,
  jenisKelamin: JenisKelamin,
  bangsa: string,
  umur: UmurKategori,
  options?: {
    customHargaDasarPerKg?: number;
    namaArea?: string;
    faktorArea?: number;
    selisihVsProvinsi?: number;
  }
): PrediksiHargaTernak {
  const hargaDasarPerKg = options?.customHargaDasarPerKg ?? (jenisKelamin === 'Jantan' ? 82500 : 70000);

  // 1. Faktor Kelamin: Jantan memiliki permintaan tinggi untuk Qurban & Aqiqah
  let faktorKelamin = jenisKelamin === 'Jantan' ? 1.15 : 0.95;

  // 2. Faktor Bangsa: Daging & persentase karkas (Boer/Saburai memiliki karkas 48-52% vs Lokal 42-45%)
  let faktorBangsa = 1.0;
  const bLower = bangsa.toLowerCase();
  if (bLower.includes('boer') && !bLower.includes('cross')) {
    faktorBangsa = 1.18;
  } else if (bLower.includes('boer cross') || bLower.includes('bx') || bLower.includes('saburai')) {
    faktorBangsa = 1.12;
  } else if (bLower.includes('pe') || bLower.includes('ettawa')) {
    faktorBangsa = 1.06;
  } else if (bLower.includes('jawa randu') || bLower.includes('rambon')) {
    faktorBangsa = 1.0;
  } else if (bLower.includes('kacang')) {
    faktorBangsa = 0.95;
  }

  // 3. Faktor Kelayakan / Umur (Poel):
  // Syarat sah hewan kurban adalah minimal poel 1 pasang (I1 atau umur >= 1 tahun)
  let faktorKelayakan = 1.0;
  if (umur === 'I1' || umur === 'I2') {
    // Usia emas kurban/aqiqah
    faktorKelayakan = jenisKelamin === 'Jantan' ? 1.10 : 1.02;
  } else if (umur === 'I3') {
    faktorKelayakan = 1.05;
  } else if (umur === 'I4') {
    // Dewasa tua
    faktorKelayakan = 0.97;
  } else if (umur === 'I0') {
    // Cempe / belum poel (belum sah untuk kurban, hanya untuk bakalan / akikah tertentu)
    faktorKelayakan = 0.92;
  }

  // Perhitungan total estimasi
  const rawPrice = bobotKg * hargaDasarPerKg * faktorKelamin * faktorBangsa * faktorKelayakan;
  // Pembulatan ke kelipatan Rp 25.000 terdekat agar sesuai praktik pasar
  const estimasiHargaTotal = Math.round(rawPrice / 25000) * 25000;

  // Toleransi rentang tawar-menawar pasar hewan (±7%)
  const rangeHargaMin = Math.round((estimasiHargaTotal * 0.93) / 25000) * 25000;
  const rangeHargaMax = Math.round((estimasiHargaTotal * 1.07) / 25000) * 25000;

  // Penentuan Kategori Pasar
  let kategoriPasar: PrediksiHargaTernak['kategoriPasar'] = 'Bibit/Bakalan';
  if (jenisKelamin === 'Jantan') {
    if (bobotKg >= 38) {
      kategoriPasar = 'Kurban Super/Premium';
    } else if (bobotKg >= 26 && (umur === 'I1' || umur === 'I2' || umur === 'I3')) {
      kategoriPasar = 'Kurban Standar';
    } else if (bobotKg >= 20) {
      kategoriPasar = 'Akikah Standar';
    } else {
      kategoriPasar = 'Bibit/Bakalan';
    }
  } else {
    kategoriPasar = 'Bibit/Bakalan';
  }

  return {
    bobotKg,
    hargaDasarPerKg,
    faktorKelamin,
    faktorBangsa,
    faktorKelayakan,
    faktorArea: options?.faktorArea,
    namaAreaPasar: options?.namaArea,
    selisihVsProvinsi: options?.selisihVsProvinsi,
    estimasiHargaTotal,
    rangeHargaMin,
    rangeHargaMax,
    kategoriPasar,
  };
}

/**
 * Menghitung Pertambahan Bobot Badan Harian (PBBH / ADG) dari riwayat penimbangan
 */
export function hitungAdgAntarTimbang(
  bobotAkhir: number,
  tanggalAkhir: string,
  bobotAwal: number,
  tanggalAwal: string
): { adgGramPerHari: number; selisihHari: number; selisihKg: number } {
  const d1 = new Date(tanggalAwal).getTime();
  const d2 = new Date(tanggalAkhir).getTime();
  const diffDays = Math.max(1, Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)));
  const diffKg = Math.round((bobotAkhir - bobotAwal) * 100) / 100;
  const adg = Math.round((diffKg * 1000) / diffDays);

  return {
    adgGramPerHari: adg,
    selisihHari: diffDays,
    selisihKg: diffKg,
  };
}

/**
 * Rekomendasi Kebutuhan Nutrisi Pakan Harian berdasarkan Bobot Badan (NRC 2007)
 */
export function hitungKebutuhanPakanHarian(bobotKg: number) {
  // Konsumsi Bahan Kering (BK): 3.2% dari bobot badan
  const bkKg = Math.round(bobotKg * 0.032 * 100) / 100;
  // Kebutuhan Hijauan Segar (kadar air 78%): ~10% dari bobot badan
  const hijauanSegarKg = Math.round(bobotKg * 0.10 * 10) / 10;
  // Kebutuhan Konsentrat (kadar air 12%): ~1.2% dari bobot badan
  const konsentratKg = Math.round(bobotKg * 0.012 * 100) / 100;

  return {
    bobotKg,
    bahanKeringKg: bkKg,
    hijauanSegarKg,
    konsentratKg,
    proteinKasarGram: Math.round(bkKg * 140), // target PK 14% dari total BK
  };
}

/**
 * Format Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Pilihan Jenis Hijauan Unggulan di Peternakan Kambing Lampung
 */
export const PRESET_HIJAUAN = [
  { nama: 'Rumput Odot Segar (Pennisetum purpureum cv Mott)', bkPersen: 20, pkPersen: 12.5, hargaPerKg: 350 },
  { nama: 'Rumput Pakchong / Super Napier', bkPersen: 22, pkPersen: 14.0, hargaPerKg: 400 },
  { nama: 'Daun Indigofera zollingeriana (Legum PK Tinggi)', bkPersen: 24, pkPersen: 26.0, hargaPerKg: 600 },
  { nama: 'Daun Gamal / Gliricidia sepium', bkPersen: 23, pkPersen: 22.5, hargaPerKg: 450 },
  { nama: 'Daun Kaliandra (Calliandra calothyrsus)', bkPersen: 25, pkPersen: 21.0, hargaPerKg: 500 },
  { nama: 'Daun Singkong Kering / Layu (Khas Lampung)', bkPersen: 28, pkPersen: 19.5, hargaPerKg: 300 },
  { nama: 'Rumput Lapang / Alam Tradisional', bkPersen: 21, pkPersen: 8.2, hargaPerKg: 200 },
  { nama: 'Silase Tebon Jagung / Fermentasi', bkPersen: 32, pkPersen: 9.8, hargaPerKg: 550 },
];

/**
 * Pilihan Jenis Konsentrat & Pakan Penguat di Lampung
 */
export const PRESET_KONSENTRAT = [
  { nama: 'Konsentrat Penggemukan Komersil (PK 16%, TDN 70%)', bkPersen: 88, pkPersen: 16.0, hargaPerKg: 4500 },
  { nama: 'Dedak Padi Halus Super + Bungkil Sawit (1:1)', bkPersen: 89, pkPersen: 14.5, hargaPerKg: 3800 },
  { nama: 'Ampas Tahu Basah + Pollard Gandum', bkPersen: 45, pkPersen: 18.0, hargaPerKg: 2200 },
  { nama: 'Formulasi Riset Fapet Unila (Jagung 40% + Bungkil 30% + Dedak 28% + Premix 2%)', bkPersen: 88, pkPersen: 15.2, hargaPerKg: 4200 },
  { nama: 'Dedak Padi Halus Tradisional + Garam Dapur', bkPersen: 88, pkPersen: 11.5, hargaPerKg: 3200 },
  { nama: 'Tanpa Konsentrat (0 kg)', bkPersen: 0, pkPersen: 0, hargaPerKg: 0 },
];

/**
 * Analisis Efisiensi Pakan (FCR / Feed Conversion Ratio) Berdasarkan Interval Penimbangan
 * Menghubungkan log pakan harian terperinci dengan riwayat timbang berkala.
 * 
 * Standar Sains Peternakan:
 * - FCR Bahan Kering (BK) = Total Konsumsi Bahan Kering (kg) / Pertambahan Bobot Badan (kg)
 * - FCR Pakan Segar (As-Fed) = Total Bobot Pakan Segar (kg) / Pertambahan Bobot Badan (kg)
 */
export function hitungEfisiensiPakanAntarTimbang(
  riwayatBobot: RiwayatBobot[],
  riwayatPakan: CatatanPakanHarian[] = [],
  pakanDefault?: DataPakan,
  bobotSaatIni: number = 25
): AnalisisEfisiensiPakanInterval[] {
  if (!riwayatBobot || riwayatBobot.length < 2) return [];

  // Urutkan kronologis
  const sortedBobot = [...riwayatBobot].sort(
    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
  );

  const results: AnalisisEfisiensiPakanInterval[] = [];

  for (let i = 0; i < sortedBobot.length - 1; i++) {
    const timbangAwal = sortedBobot[i];
    const timbangAkhir = sortedBobot[i + 1];

    const d1 = new Date(timbangAwal.tanggal).getTime();
    const d2 = new Date(timbangAkhir.tanggal).getTime();
    const durasiHari = Math.max(1, Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)));

    const pertambahanBobotKg = Math.round((timbangAkhir.bobot - timbangAwal.bobot) * 100) / 100;
    const adgGramPerHari = Math.round((pertambahanBobotKg * 1000) / durasiHari);

    // Cari catatan pakan yang berada di dalam interval tanggal [timbangAwal.tanggal, timbangAkhir.tanggal]
    const pakanDalamInterval = riwayatPakan.filter((p) => {
      const pTime = new Date(p.tanggal).getTime();
      return pTime >= d1 && pTime <= d2;
    });

    let rerataHijauanKgPerHari = 0;
    let rerataKonsentratKgPerHari = 0;
    let rerataBiayaHarian = 0;

    if (pakanDalamInterval.length > 0) {
      const totalH = pakanDalamInterval.reduce((acc, curr) => acc + (curr.takaranHijauanKg || 0), 0);
      const totalK = pakanDalamInterval.reduce((acc, curr) => acc + (curr.takaranKonsentratKg || 0), 0);
      const totalB = pakanDalamInterval.reduce((acc, curr) => acc + (curr.biayaPakanHarianRp || 0), 0);
      rerataHijauanKgPerHari = Math.round((totalH / pakanDalamInterval.length) * 100) / 100;
      rerataKonsentratKgPerHari = Math.round((totalK / pakanDalamInterval.length) * 100) / 100;
      rerataBiayaHarian = Math.round(totalB / pakanDalamInterval.length);
    } else {
      // Fallback ke takaran ilmiah standar berdasarkan porsi bobot awal & akhir
      const avgWeight = (timbangAwal.bobot + timbangAkhir.bobot) / 2;
      const needs = hitungKebutuhanPakanHarian(avgWeight);
      // Jika di catatan penimbangan ada jenis pakan tertentu:
      const pakanNote = timbangAkhir.pakanSaatTimbang || pakanDefault?.jenisPakan || '';
      const isKonsentratTinggi = pakanNote.toLowerCase().includes('intensif') || pakanNote.toLowerCase().includes('50%');
      const isRansumTerpadu = pakanNote.toLowerCase().includes('30%') || pakanNote.toLowerCase().includes('konsentrat');

      rerataHijauanKgPerHari = isKonsentratTinggi ? needs.hijauanSegarKg * 0.7 : needs.hijauanSegarKg;
      rerataKonsentratKgPerHari = isKonsentratTinggi ? needs.konsentratKg * 1.5 : isRansumTerpadu ? needs.konsentratKg : 0.2;
      rerataBiayaHarian = Math.round((rerataHijauanKgPerHari * 350) + (rerataKonsentratKgPerHari * 4200));
    }

    // Konsumsi Bahan Kering (BK):
    // Rerata kadar BK hijauan 22%, Konsentrat 88%
    const konsumsiBkHarianKg = (rerataHijauanKgPerHari * 0.22) + (rerataKonsentratKgPerHari * 0.88);
    const totalKonsumsiBahanKeringKg = Math.round(konsumsiBkHarianKg * durasiHari * 100) / 100;

    const totalPakanSegarKg = Math.round((rerataHijauanKgPerHari + rerataKonsentratKgPerHari) * durasiHari * 100) / 100;
    const totalKonsentratKg = rerataKonsentratKgPerHari * durasiHari;
    const proporsiKonsentratPersen = totalPakanSegarKg > 0 
      ? Math.round((totalKonsentratKg / totalPakanSegarKg) * 100) 
      : 0;

    // FCR Calculation
    let fcrSegar = 0;
    let fcrBahanKering = 0;
    if (pertambahanBobotKg > 0) {
      fcrSegar = Math.round((totalPakanSegarKg / pertambahanBobotKg) * 10) / 10;
      fcrBahanKering = Math.round((totalKonsumsiBahanKeringKg / pertambahanBobotKg) * 10) / 10;
    } else {
      fcrSegar = 999;
      fcrBahanKering = 999;
    }

    // Biaya Pakan
    const estimasiTotalBiayaPakan = Math.round(rerataBiayaHarian * durasiHari);
    const biayaPerKgPertambahan = pertambahanBobotKg > 0
      ? Math.round(estimasiTotalBiayaPakan / pertambahanBobotKg)
      : 0;

    // Evaluasi Efisiensi Berdasarkan Standar Fapet Unila / Balitnak
    let statusEfisiensi: AnalisisEfisiensiPakanInterval['statusEfisiensi'] = 'Cukup / Moderat';
    let evaluasiIlmiah = '';

    if (pertambahanBobotKg <= 0) {
      statusEfisiensi = 'Kurang Efisien';
      evaluasiIlmiah = 'Bobot stagnan atau turun. Ternak membutuhkan pemeriksaan kesehatan dan peningkatan rasio konsentrat berenergi tinggi.';
    } else if (fcrBahanKering <= 6.5) {
      statusEfisiensi = 'Sangat Efisien';
      evaluasiIlmiah = `FCR DM istimewa (${fcrBahanKering}). Nutrisi konsentrat dan hijauan diserap sangat optimal oleh mikrobioma rumen dengan efisiensi tinggi (ADG +${adgGramPerHari} g/hari).`;
    } else if (fcrBahanKering <= 8.5) {
      statusEfisiensi = 'Efisien (Standar Baik)';
      evaluasiIlmiah = `FCR DM baik (${fcrBahanKering}). Sesuai standar laju pertumbuhan fisiologis kambing bakalan persilangan di Lampung (ADG +${adgGramPerHari} g/hari).`;
    } else if (fcrBahanKering <= 11.0) {
      statusEfisiensi = 'Cukup / Moderat';
      evaluasiIlmiah = `FCR DM ${fcrBahanKering}. Laju pertumbuhan cukup (${adgGramPerHari} g/hari). Disarankan menambah proporsi legum (Indigofera) atau konsentrat penguat untuk memacu konversi daging.`;
    } else {
      statusEfisiensi = 'Kurang Efisien';
      evaluasiIlmiah = `FCR DM tinggi (${fcrBahanKering}). Konsumsi pakan relatif boros terhadap penambahan bobot. Evaluasi palatabilitas dan kandungan serat kasar hijauan.`;
    }

    results.push({
      periode: `${timbangAwal.tanggal} s/d ${timbangAkhir.tanggal}`,
      tanggalAwal: timbangAwal.tanggal,
      tanggalAkhir: timbangAkhir.tanggal,
      durasiHari,
      bobotAwal: timbangAwal.bobot,
      bobotAkhir: timbangAkhir.bobot,
      pertambahanBobotKg,
      adgGramPerHari,
      rerataHijauanKgPerHari,
      rerataKonsentratKgPerHari,
      proporsiKonsentratPersen,
      totalPakanSegarKg,
      totalKonsumsiBahanKeringKg,
      fcrSegar,
      fcrBahanKering,
      statusEfisiensi,
      evaluasiIlmiah,
      estimasiTotalBiayaPakan,
      biayaPerKgPertambahan,
    });
  }

  return results;
}

/**
 * Normalisasi tanggal ke tengah malam (00:00:00) lokal untuk kalkulasi selisih hari presisi
 */
function parseDateToMidnight(dateInput: string | Date): Date {
  if (typeof dateInput === 'string') {
    const parts = dateInput.slice(0, 10).split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
}

function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTanggalIndo(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = parseDateToMidnight(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Prediksi Siklus Birahi Kambing Betina Secara Real-Time dan Akurat
 * 
 * Dasar Ilmiah Fisiologi Reproduksi Kambing (Capra hircus):
 * - Rata-rata interval siklus estrus: 21 hari (kisaran fisiologis normal: 18 - 24 hari)
 * - Durasi fase birahi (standing heat): 24 - 48 jam (rata-rata 36 jam)
 * - Waktu ovulasi: 24 - 36 jam setelah awal estrus (menjelang akhir birahi)
 * - Golden Mating Window: 12 - 24 jam setelah tanda estrus teramati pertama kali
 * - Fase Proestrus: Hari ke-18 s.d 20 (persiapan folikuler, pelepasan estrogen)
 * - Fase Estrus: Hari ke-21 / Hari 0 (puncak birahi, siap kawin)
 * - Fase Metestrus: Hari ke-1 s.d 3 (korpus luteum mulai tumbuh pasca ovulasi)
 * - Fase Diestrus: Hari ke-4 s.d 17 (fase luteal tenang, progesteron tinggi)
 * 
 * Aturan Ketat Validitas (Mandat: Jangan tambahkan bila data tidak ada/tidak sesuai):
 * 1. Kambing Jantan -> Ineligible (tidak ada siklus birahi)
 * 2. Kambing Bunting -> Ineligible (anoestrus gestasi: siklus terhenti selama kebuntingan ~150 hari)
 * 3. Cempe I0 di bawah pubertas (< 6-8 bulan / < 20 kg tanpa riwayat) -> Ineligible
 * 4. Tanpa Catatan Birahi -> Ineligible ("Belum ada rekaman tanggal birahi")
 */
export function hitungPrediksiSiklusBirahi(
  goat: GoatRecord,
  referenceDateInput?: Date | string
): HasilPrediksiBirahi {
  // 1. Validasi Jenis Kelamin: Jantan tidak mengalami siklus birahi
  if (goat.jenisKelamin !== 'Betina') {
    return {
      isEligible: false,
      alasanIneligible: 'Ternak Jantan — Kambing jantan tidak mengalami siklus estrus/birahi.',
      statusFase: 'TIDAK_APLIKATIF',
      isAlarmActive: false,
      tingkatUrgensi: 'NONE',
      pesanAlarm: '',
      badgeLabel: 'Ternak Jantan',
      badgeColor: 'bg-slate-100 text-slate-500 border border-slate-200',
      rekomendasiTindakan: 'Ternak jantan digunakan sebagai pejantan pemacak unggul atau bakalan penggemukan.',
      waktuKawinTerbaik: '-',
      gejalaKunci: [],
      persentaseSiklusBerjalan: 0,
    };
  }

  // 2. Validasi Status Kebuntingan: Bunting mengalami anoestrus gestasi fisiologis
  if (goat.statusReproduksi === 'Bunting') {
    const lastMating = goat.riwayatKebuntingan && goat.riwayatKebuntingan.length > 0
      ? goat.riwayatKebuntingan[goat.riwayatKebuntingan.length - 1]
      : null;
    const infoHpl = lastMating?.estimasiHPL ? ` • Perkiraan Lahir: ${formatTanggalIndo(lastMating.estimasiHPL)}` : '';

    return {
      isEligible: false,
      alasanIneligible: `Sedang Bunting (Anoestrus gestasi aktif — masa kebuntingan ~150 hari${infoHpl}).`,
      statusFase: 'TIDAK_APLIKATIF',
      isAlarmActive: false,
      tingkatUrgensi: 'NONE',
      pesanAlarm: '',
      badgeLabel: 'Bunting (Gestasi)',
      badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold',
      rekomendasiTindakan: 'Ternak dalam masa kebuntingan aktif. Hormon progesteron menekan siklus birahi secara alami. Berikan pakan bergizi tinggi dan hindari stres.',
      waktuKawinTerbaik: '-',
      gejalaKunci: ['Perut sisi kanan bawah membesar', 'Nafsu makan stabil', 'Vulva tenang tidak berlendir'],
      persentaseSiklusBerjalan: 0,
    };
  }

  // 3. Validasi Cempe Belum Puber
  const isCempeMuda = goat.umur === 'I0' && (goat.bobotBadan < 19 || goat.statusReproduksi === 'Belum Cukup Umur');
  const hasRecordedEstrus = Boolean(
    goat.tanggalBirahiTerakhir || 
    (goat.riwayatBirahi && goat.riwayatBirahi.length > 0)
  );

  if (isCempeMuda && !hasRecordedEstrus) {
    return {
      isEligible: false,
      alasanIneligible: 'Belum Cukup Umur (Cempe belum mencapai masa pubertas seksual fisiologis ~6-8 bulan).',
      statusFase: 'TIDAK_APLIKATIF',
      isAlarmActive: false,
      tingkatUrgensi: 'NONE',
      pesanAlarm: '',
      badgeLabel: 'Cempe (Pra-Pubertas)',
      badgeColor: 'bg-slate-100 text-slate-500 border border-slate-200',
      rekomendasiTindakan: 'Fokuskan nutrisi pakan pertumbuhan berkualitas (protein kasar 14-16%) hingga bobot mencapai minimal 22-25 kg sebelum program perkawinan perdana.',
      waktuKawinTerbaik: '-',
      gejalaKunci: [],
      persentaseSiklusBerjalan: 0,
    };
  }

  // 4. Validasi Ketersediaan Data Rekaman (Mandat: Jangan tambahkan bila data benar-benar tidak ada)
  if (!hasRecordedEstrus) {
    return {
      isEligible: false,
      alasanIneligible: 'Belum ada data rekaman birahi. Rekam tanggal birahi pertama kali untuk mengaktifkan sistem prediksi dan alarm akurat.',
      statusFase: 'TIDAK_APLIKATIF',
      isAlarmActive: false,
      tingkatUrgensi: 'NONE',
      pesanAlarm: '',
      badgeLabel: 'Belum Ada Rekaman',
      badgeColor: 'bg-slate-50 text-slate-400 border border-dashed border-slate-300',
      rekomendasiTindakan: 'Amati tanda klinis birahi harian di kandang: vulva kemerahan, keluar lendir transparan, ekor mengibas (*tail flagging*), dan *standing heat*. Rekam tanggal pengamatan awal untuk memulai pelacakan siklus 21 hari.',
      waktuKawinTerbaik: 'Perlu rekaman awal',
      gejalaKunci: [
        'Vulva bengkak, merah, dan basah',
        'Keluar lendir transparan dari liang vagina',
        'Gelisah dan sering mengibaskan ekor',
        'Standing heat (diam saat dinaiki pejantan / betina lain)',
      ],
      persentaseSiklusBerjalan: 0,
    };
  }

  // 5. Data Valid: Menghitung Prediksi Siklus Birahi Akurat Berbasis Waktu Nyata (Real-time)
  let latestDateStr = goat.tanggalBirahiTerakhir || '';
  if (goat.riwayatBirahi && goat.riwayatBirahi.length > 0) {
    const sorted = [...goat.riwayatBirahi].sort(
      (a, b) => new Date(b.tanggalBirahi).getTime() - new Date(a.tanggalBirahi).getTime()
    );
    latestDateStr = sorted[0].tanggalBirahi;
  }

  const refMidnight = referenceDateInput ? parseDateToMidnight(referenceDateInput) : parseDateToMidnight(new Date());
  const lastEstrusMidnight = parseDateToMidnight(latestDateStr);

  const diffMs = refMidnight.getTime() - lastEstrusMidnight.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const SIKLUS_ESTRUS_HARI = 21; // Standar biologis kambing di Indonesia
  let hariKeDalamSiklus: number;
  let sisaHariMenujuBirahi: number;
  let nextEstrusDate: Date;

  if (diffDays < 0) {
    // Tanggal birahi di masa depan yang telah dijadwalkan / diinput
    hariKeDalamSiklus = 1;
    sisaHariMenujuBirahi = Math.abs(diffDays);
    nextEstrusDate = lastEstrusMidnight;
  } else {
    // diffDays >= 0
    const siklusBerjalan = Math.floor(diffDays / SIKLUS_ESTRUS_HARI);
    const sisaHariModulo = diffDays % SIKLUS_ESTRUS_HARI;
    hariKeDalamSiklus = sisaHariModulo + 1; // 1 s/d 21

    if (sisaHariModulo === 0 && diffDays > 0) {
      // Tepat pada hari ke-21 siklus (atau kelipatan 21) = HARI H BIRAHI BARU
      sisaHariMenujuBirahi = 0;
      nextEstrusDate = refMidnight;
    } else if (diffDays === 0) {
      // Hari H tanggal rekaman awal
      sisaHariMenujuBirahi = 0;
      nextEstrusDate = refMidnight;
    } else {
      sisaHariMenujuBirahi = SIKLUS_ESTRUS_HARI - sisaHariModulo;
      nextEstrusDate = new Date(lastEstrusMidnight.getTime() + (siklusBerjalan + 1) * SIKLUS_ESTRUS_HARI * 24 * 60 * 60 * 1000);
    }
  }

  const minWindowDate = new Date(nextEstrusDate.getTime() - 2 * 24 * 60 * 60 * 1000); // H-2 (19 hari)
  const maxWindowDate = new Date(nextEstrusDate.getTime() + 2 * 24 * 60 * 60 * 1000); // H+2 (23 hari)

  const persentaseSiklus = Math.min(100, Math.round((hariKeDalamSiklus / SIKLUS_ESTRUS_HARI) * 100));

  // Gejala kunci berdasarkan ilmu peternakan
  const gejalaKunciDefault = [
    'Vulva bengkak, memerah, dan mengeluarkan lendir transparan elastis',
    'Standing heat: diam dan siap dinaiki pejantan pemacak',
    'Ekor bergerak aktif mengibas-ngibas (tail flagging)',
    'Sering mengembik mencari pejantan dan nafsu makan sedikit berkurang',
  ];

  // Penentuan Fase, Urgensi Alarm & Rekomendasi
  let statusFase: StatusFaseBirahi = 'DIESTRUS';
  let isAlarmActive = false;
  let tingkatUrgensi: HasilPrediksiBirahi['tingkatUrgensi'] = 'NORMAL';
  let pesanAlarm = '';
  let badgeLabel = '';
  let badgeColor = '';
  let rekomendasiTindakan = '';
  let waktuKawinTerbaik = '';

  // Kondisi 1: Puncak Birahi Aktif (Hari H s/d H+1 / Standing Heat)
  if (sisaHariMenujuBirahi === 0 || hariKeDalamSiklus === 21 || (hariKeDalamSiklus === 1 && diffDays > 0)) {
    statusFase = 'BIRAHI_AKTIF';
    isAlarmActive = true;
    tingkatUrgensi = 'TINGGI';
    badgeLabel = '🚨 BIRAHI AKTIF (HARI INI)';
    badgeColor = 'bg-rose-600 text-white font-extrabold shadow-sm ring-2 ring-rose-300 animate-pulse';
    pesanAlarm = '🚨 ALARM BIRAHI AKTIF: Kambing sedang dalam puncak estrus (Standing Heat) hari ini! Segera lakukan perkawinan pejantan unggul atau Inseminasi Buatan (IB).';
    waktuKawinTerbaik = 'GOLDEN MATING WINDOW: Kawinkan dalam rentang 12 - 24 jam sejak tanda standing heat pertama terlihat (ovulasi terjadi menjelang akhir fase estrus).';
    rekomendasiTindakan = 'Segera bawa kambing ke kandang pejantan pemacak atau hubungi Inseminator Buatan (IB). Pastikan vulva bersih dan catat identitas pejantan pemacak untuk rekam jejak silsilah.';
  }
  // Kondisi 2: Siaga Birahi Proestrus (H-1 s/d H-3)
  else if (sisaHariMenujuBirahi >= 1 && sisaHariMenujuBirahi <= 3) {
    statusFase = 'SIAGA_PROESTRUS';
    isAlarmActive = true;
    tingkatUrgensi = 'SEDANG';
    badgeLabel = `⚠️ Siaga Birahi (H-${sisaHariMenujuBirahi})`;
    badgeColor = 'bg-amber-400 text-amber-950 font-extrabold border border-amber-500 shadow-2xs';
    pesanAlarm = `⚠️ PERINGATAN SIAGA: Birahi diprediksi tiba dalam ${sisaHariMenujuBirahi} hari ke depan (${formatTanggalIndo(formatDateToIso(nextEstrusDate))}).`;
    waktuKawinTerbaik = `Perkiraan puncak kawin: ${formatTanggalIndo(formatDateToIso(nextEstrusDate))} (Hari ke-21 siklus).`;
    rekomendasiTindakan = 'Fase Proestrus aktif: folikel ovarium sedang berkembang pesat. Dekatkan dengan pejantan pemacak (efek buck) untuk menstimulasi birahi optimal dan amati kondisi vulva setiap pagi dan sore.';
  }
  // Kondisi 3: Metestrus (Hari ke-2 s/d ke-4 siklus / pasca ovulasi)
  else if (hariKeDalamSiklus >= 2 && hariKeDalamSiklus <= 4) {
    statusFase = 'METESTRUS';
    isAlarmActive = false;
    tingkatUrgensi = 'NORMAL';
    badgeLabel = `Metestrus (H+${hariKeDalamSiklus - 1})`;
    badgeColor = 'bg-sky-100 text-sky-800 border border-sky-300 font-semibold';
    pesanAlarm = `Fase Metestrus (H+${hariKeDalamSiklus - 1} pasca birahi). Ovulasi telah terjadi, korpus luteum mulai terbentuk.`;
    waktuKawinTerbaik = 'Masa subur telah berakhir. Jika sudah dikawinkan, pantau apakah terjadi kebuntingan pada 21 hari ke depan.';
    rekomendasiTindakan = 'Kambing sudah tidak mau dinaiki pejantan. Berikan pakan berkualitas dan catat tanggal perkawinan jika sudah dikawinkan.';
  }
  // Kondisi 4: Diestrus (Hari ke-5 s/d 17 / fase luteal tenang)
  else {
    statusFase = 'DIESTRUS';
    isAlarmActive = false;
    tingkatUrgensi = 'NORMAL';
    badgeLabel = `Diestrus (${sisaHariMenujuBirahi} hr lagi)`;
    badgeColor = 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium';
    pesanAlarm = `Fase Diestrus (fase luteal tenang). Hormon progesteron dominan. Birahi berikutnya diperkirakan ${sisaHariMenujuBirahi} hari lagi (${formatTanggalIndo(formatDateToIso(nextEstrusDate))}).`;
    waktuKawinTerbaik = `Jadwal kawin berikutnya: ${formatTanggalIndo(formatDateToIso(nextEstrusDate))}.`;
    rekomendasiTindakan = 'Pertahankan kecukupan nutrisi pakan hijauan dan konsentrat. Hindari pengobatan keras atau pemindahan kandang yang memicu stres.';
  }

  // Flag evaluasi bila siklus telah terlewat > 25 hari tanpa rekaman kawin atau birahi baru
  if (diffDays > 25 && (!goat.riwayatKebuntingan || goat.riwayatKebuntingan.length === 0)) {
    const siklusKelewatan = Math.floor(diffDays / SIKLUS_ESTRUS_HARI);
    if (siklusKelewatan >= 2 && statusFase !== 'BIRAHI_AKTIF' && statusFase !== 'SIAGA_PROESTRUS') {
      statusFase = 'TERLEWAT_EVALUASI';
      tingkatUrgensi = 'EVALUASI';
      badgeLabel = 'Perlu Evaluasi (Cek Silent Heat / Bunting)';
      badgeColor = 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
      pesanAlarm = `Ternak telah melewati ${siklusKelewatan} siklus (terakhir dicatat ${formatTanggalIndo(latestDateStr)}). Periksa kemungkinan kebuntingan atau birahi tenang (silent heat).`;
      rekomendasiTindakan = 'Lakukan pemeriksaan kebuntingan (palpasi abdominal / USG jika tersedia) atau amati intensif adanya silent heat (birahi tanpa tanda visual mencolok).';
    }
  }

  return {
    isEligible: true,
    tanggalBirahiTerakhir: latestDateStr,
    tanggalPerkiraanBirahiBerikutnya: formatDateToIso(nextEstrusDate),
    rentangPerkiraanMin: formatDateToIso(minWindowDate),
    rentangPerkiraanMax: formatDateToIso(maxWindowDate),
    hariKeDalamSiklus,
    sisaHariMenujuBirahi,
    statusFase,
    isAlarmActive,
    tingkatUrgensi,
    pesanAlarm,
    badgeLabel,
    badgeColor,
    rekomendasiTindakan,
    waktuKawinTerbaik,
    gejalaKunci: gejalaKunciDefault,
    persentaseSiklusBerjalan: persentaseSiklus,
  };
}
