import React, { useState, useMemo } from 'react';
import { GoatRecord, RiwayatBobot, CatatanPakanHarian } from '../types';
import { 
  X, 
  Scale, 
  Save, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Wheat, 
  Coins, 
  Sparkles,
  Ruler,
  User,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  hitungAdgAntarTimbang, 
  hitungPrediksiHargaKambing, 
  formatRupiah,
  PRESET_HIJAUAN,
  PRESET_KONSENTRAT,
  hitungKebutuhanPakanHarian
} from '../utils/livestockScience';

interface WeightRecordModalProps {
  goat: GoatRecord | null;
  onClose: () => void;
  onSaveWeight: (
    goatId: string, 
    newBobot: number, 
    tanggal: string, 
    catatan: string,
    pakanSaatTimbang?: string,
    lingkarDadaCm?: number,
    petugasPenimbang?: string
  ) => void;
  onSaveFeedRecord?: (goatId: string, record: CatatanPakanHarian) => void;
}

export const WeightRecordModal: React.FC<WeightRecordModalProps> = ({
  goat,
  onClose,
  onSaveWeight,
  onSaveFeedRecord,
}) => {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [bobotInput, setBobotInput] = useState(goat ? String(goat.bobotBadan) : '25');
  const [lingkarDada, setLingkarDada] = useState<string>('');
  const [petugasPenimbang, setPetugasPenimbang] = useState('Petugas Recording Lapangan');
  const [catatan, setCatatan] = useState('Penimbangan berkala monitoring pertumbuhan');

  // Input Ransum Pakan Harian Terperinci Terhubung
  const defaultNeeds = useMemo(() => {
    return hitungKebutuhanPakanHarian(goat?.bobotBadan || 25);
  }, [goat?.bobotBadan]);

  // Cek apakah ada catatan pakan harian terakhir ternak ini
  const lastFeedLog = goat?.riwayatPakanHarian && goat.riwayatPakanHarian.length > 0
    ? goat.riwayatPakanHarian[goat.riwayatPakanHarian.length - 1]
    : null;

  const [jenisHijauan, setJenisHijauan] = useState<string>(
    lastFeedLog?.jenisHijauan || PRESET_HIJAUAN[0].nama
  );
  const [takaranHijauanKg, setTakaranHijauanKg] = useState<string>(
    String(lastFeedLog?.takaranHijauanKg || defaultNeeds.hijauanSegarKg)
  );
  const [jenisKonsentrat, setJenisKonsentrat] = useState<string>(
    lastFeedLog?.jenisKonsentrat || PRESET_KONSENTRAT[0].nama
  );
  const [takaranKonsentratKg, setTakaranKonsentratKg] = useState<string>(
    String(lastFeedLog?.takaranKonsentratKg || defaultNeeds.konsentratKg)
  );
  const [simpanPakanJuga, setSimpanPakanJuga] = useState(true);

  if (!goat) return null;

  const currentWeight = goat.bobotBadan;
  const newWeightNum = parseFloat(bobotInput) || 0;
  const ldNum = parseFloat(lingkarDada) || undefined;
  const hKg = parseFloat(takaranHijauanKg) || 0;
  const kKg = parseFloat(takaranKonsentratKg) || 0;

  // Temukan penimbangan terakhir untuk menghitung ADG & interval hari
  const lastWeightRecord = goat.riwayatBobot && goat.riwayatBobot.length > 0
    ? goat.riwayatBobot[goat.riwayatBobot.length - 1]
    : null;

  const lastDate = lastWeightRecord?.tanggal || goat.timestampAwal || '2025-12-03';
  const adgCalculation = hitungAdgAntarTimbang(newWeightNum, tanggal, currentWeight, lastDate);

  // Estimasi FCR (Feed Conversion Ratio) dalam Interval Ini
  const selectedHijauan = PRESET_HIJAUAN.find((h) => h.nama === jenisHijauan) || {
    bkPersen: 22,
    hargaPerKg: 350,
  };
  const selectedKonsentrat = PRESET_KONSENTRAT.find((k) => k.nama === jenisKonsentrat) || {
    bkPersen: 88,
    hargaPerKg: 4200,
  };

  const selisihHari = adgCalculation.selisihHari;
  const selisihKg = adgCalculation.selisihKg;

  // Konsumsi Bahan Kering total selama periode antar-timbang
  const bkHarianKg = (hKg * (selectedHijauan.bkPersen / 100)) + (kKg * (selectedKonsentrat.bkPersen / 100));
  const totalBkJangkaWaktu = Math.round(bkHarianKg * selisihHari * 100) / 100;
  const totalPakanSegarJangkaWaktu = Math.round((hKg + kKg) * selisihHari * 10) / 10;
  
  const fcrBahanKering = selisihKg > 0 
    ? Math.round((totalBkJangkaWaktu / selisihKg) * 10) / 10 
    : 0;
  
  const estimasiBiayaHarian = Math.round((hKg * selectedHijauan.hargaPerKg) + (kKg * selectedKonsentrat.hargaPerKg));
  const totalBiayaInterval = estimasiBiayaHarian * selisihHari;
  const biayaPerKgGain = selisihKg > 0 ? Math.round(totalBiayaInterval / selisihKg) : 0;

  // Estimasi Harga Jual di Lampung sebelum dan sesudah penimbangan baru
  const prediksiLama = hitungPrediksiHargaKambing(
    currentWeight,
    goat.jenisKelamin,
    goat.bangsaTernak,
    goat.umur
  );
  const prediksiBaru = hitungPrediksiHargaKambing(
    newWeightNum,
    goat.jenisKelamin,
    goat.bangsaTernak,
    goat.umur
  );
  const selisihHarga = prediksiBaru.estimasiHargaTotal - prediksiLama.estimasiHargaTotal;

  const pakanSummary = `${jenisHijauan.split('(')[0].trim()} (${hKg} kg) + ${jenisKonsentrat.split('(')[0].trim()} (${kKg} kg)`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeightNum <= 0) return;

    onSaveWeight(
      goat.id,
      newWeightNum,
      tanggal,
      catatan,
      pakanSummary,
      ldNum,
      petugasPenimbang
    );

    // Simpan log pakan harian jika opsi aktif
    if (simpanPakanJuga && onSaveFeedRecord && (hKg > 0 || kKg > 0)) {
      onSaveFeedRecord(goat.id, {
        id: `feed-${Date.now()}`,
        tanggal,
        jenisHijauan,
        takaranHijauanKg: hKg,
        jenisKonsentrat,
        takaranKonsentratKg: kKg,
        frekuensi: '2x Sehari (Pagi & Sore)',
        suplemenMineral: 'Premix Mineral + Garam Dapur',
        nafsuMakan: 'Normal',
        biayaPakanHarianRp: estimasiBiayaHarian,
        petugas: petugasPenimbang,
        catatan: `Dicatat saat penimbangan berkala (${newWeightNum} kg)`,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
              <Scale className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Catat Penimbangan Berkala & Pakan
              </h3>
              <p className="text-xs text-amber-100">
                Eartag #{goat.nomorEartag} • {goat.bangsaTernak} ({goat.jenisKelamin}) • Pemilik: {goat.namaPeternak}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Tanggal & Petugas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tanggal Penimbangan Berkala *
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-amber-600 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Petugas / Penimbang
              </label>
              <input
                type="text"
                value={petugasPenimbang}
                onChange={(e) => setPetugasPenimbang(e.target.value)}
                placeholder="Nama petugas lapangan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-amber-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Bobot Input & Lingkar Dada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-800 block mb-1">
                Hasil Timbangan Baru (kg) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="150"
                  required
                  value={bobotInput}
                  onChange={(e) => setBobotInput(e.target.value)}
                  className="w-full font-black text-2xl sm:text-3xl px-4 py-2.5 bg-white border-2 border-amber-500/80 rounded-2xl text-slate-900 focus:border-amber-600 focus:outline-none shadow-xs"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-sm">
                  kg
                </span>
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Lingkar Dada (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={lingkarDada}
                  onChange={(e) => setLingkarDada(e.target.value)}
                  placeholder="Opsional"
                  className="w-full font-bold px-3 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:border-amber-600 focus:bg-white focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                  cm
                </span>
              </div>
            </div>
          </div>

          {/* Real-time ADG & Delta Box */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/90 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                Pertumbuhan Bobot (ADG / PBBH)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Jarak: {adgCalculation.selisihHari} hari ({lastDate})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white/90 p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] text-slate-500 block font-medium">Bobot Awal</span>
                <span className="font-bold text-slate-800 text-sm">{currentWeight} kg</span>
              </div>
              <div className="bg-white/90 p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] text-slate-500 block font-medium">Selisih Bobot</span>
                <span className={`font-bold text-sm ${
                  adgCalculation.selisihKg > 0 ? 'text-emerald-700' : adgCalculation.selisihKg < 0 ? 'text-rose-700' : 'text-slate-700'
                }`}>
                  {adgCalculation.selisihKg > 0 ? `+${adgCalculation.selisihKg}` : adgCalculation.selisihKg} kg
                </span>
              </div>
              <div className="bg-white/90 p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] text-slate-500 block font-medium">Laju PBBH / ADG</span>
                <span className={`font-black text-sm ${
                  adgCalculation.adgGramPerHari > 0 ? 'text-emerald-700' : 'text-slate-700'
                }`}>
                  {adgCalculation.adgGramPerHari > 0 ? `+${adgCalculation.adgGramPerHari}` : adgCalculation.adgGramPerHari} g/hari
                </span>
              </div>
            </div>
          </div>

          {/* SEKSI PAKAN TERHUBUNG LANGSUNG DENGAN PENIMBANGAN */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5 text-emerald-700" />
                Catatan Asupan Pakan Harian Terhubung
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                Analisis Efisiensi (FCR)
              </span>
            </div>

            {/* Hijauan & Konsentrat Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200/80 space-y-1.5">
                <label className="font-bold text-slate-800 block text-[11px]">
                  🌿 Jenis & Takaran Hijauan Segar
                </label>
                <select
                  value={jenisHijauan}
                  onChange={(e) => setJenisHijauan(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                >
                  {PRESET_HIJAUAN.map((h) => (
                    <option key={h.nama} value={h.nama}>
                      {h.nama}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={takaranHijauanKg}
                    onChange={(e) => setTakaranHijauanKg(e.target.value)}
                    className="w-20 font-bold px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  <span className="text-slate-500 font-semibold text-[11px]">kg segar/hari</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 space-y-1.5">
                <label className="font-bold text-slate-800 block text-[11px]">
                  🥣 Jenis & Takaran Konsentrat Penguat
                </label>
                <select
                  value={jenisKonsentrat}
                  onChange={(e) => setJenisKonsentrat(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                >
                  {PRESET_KONSENTRAT.map((k) => (
                    <option key={k.nama} value={k.nama}>
                      {k.nama}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={takaranKonsentratKg}
                    onChange={(e) => setTakaranKonsentratKg(e.target.value)}
                    className="w-20 font-bold px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  <span className="text-slate-500 font-semibold text-[11px]">kg konsentrat/hari</span>
                </div>
              </div>
            </div>

            {/* FCR & Feed Efficiency Result Box */}
            <div className="bg-white/90 p-3 rounded-xl border border-emerald-300/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Efisiensi Pakan Periode Ini ({selisihHari} Hari):
                </span>
                {fcrBahanKering > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    fcrBahanKering <= 6.5
                      ? 'bg-emerald-100 text-emerald-800'
                      : fcrBahanKering <= 8.5
                      ? 'bg-sky-100 text-sky-800'
                      : fcrBahanKering <= 11.0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {fcrBahanKering <= 6.5 ? 'Sangat Efisien' : fcrBahanKering <= 8.5 ? 'Efisien (Standar Baik)' : fcrBahanKering <= 11.0 ? 'Moderat' : 'Boros Pakan'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">Konsumsi BK</span>
                  <span className="font-bold text-slate-800">{totalBkJangkaWaktu} kg</span>
                  <span className="text-[9px] text-slate-400 block">total {selisihHari} hari</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">FCR Bahan Kering</span>
                  <span className="font-black text-emerald-800 text-sm">
                    {fcrBahanKering > 0 ? fcrBahanKering : 'N/A'}
                  </span>
                  <span className="text-[9px] text-slate-400 block">kg BK / kg daging</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">Biaya per kg Gain</span>
                  <span className="font-bold text-slate-800">
                    {biayaPerKgGain > 0 ? formatRupiah(biayaPerKgGain) : 'N/A'}
                  </span>
                  <span className="text-[9px] text-slate-400 block">estimasi biaya</span>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simpanPakanJuga}
                  onChange={(e) => setSimpanPakanJuga(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Simpan juga sebagai entri catatan pakan harian untuk tanggal {tanggal}</span>
              </label>
            </div>
          </div>

          {/* Estimasi Valuasi Harga Jual di Lampung */}
          <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-700" />
                Prediksi Nilai Jual Pasar Hewan Lampung
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {prediksiBaru.kategoriPasar}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] text-slate-500 block">Estimasi Nilai Bobot Baru</span>
                <span className="text-lg font-black text-emerald-900">
                  {formatRupiah(prediksiBaru.estimasiHargaTotal)}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-[10px] text-slate-500 block">Rentang Tawar Pasar</span>
                <span className="font-bold text-slate-700">
                  {formatRupiah(prediksiBaru.rangeHargaMin)} - {formatRupiah(prediksiBaru.rangeHargaMax)}
                </span>
                {selisihHarga !== 0 && (
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    {selisihHarga > 0 ? `+${formatRupiah(selisihHarga)}` : formatRupiah(selisihHarga)} dari bobot lama
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="font-semibold text-slate-600 block mb-1">
              Catatan Penimbangan & Kondisi Ternak
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Penimbangan pagi sebelum pemberian pakan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-amber-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Hasil Penimbangan & Pakan
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

