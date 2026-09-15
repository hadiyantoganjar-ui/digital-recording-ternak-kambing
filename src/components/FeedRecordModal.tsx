import React, { useState, useMemo } from 'react';
import { GoatRecord, CatatanPakanHarian } from '../types';
import { 
  X, 
  Wheat, 
  Save, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Scale, 
  Coins, 
  Info,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  PRESET_HIJAUAN, 
  PRESET_KONSENTRAT, 
  hitungKebutuhanPakanHarian, 
  formatRupiah 
} from '../utils/livestockScience';

interface FeedRecordModalProps {
  goat: GoatRecord | null;
  onClose: () => void;
  onSaveFeedRecord: (goatId: string, record: CatatanPakanHarian) => void;
  onDeleteFeedRecord?: (goatId: string, recordId: string) => void;
}

export const FeedRecordModal: React.FC<FeedRecordModalProps> = ({
  goat,
  onClose,
  onSaveFeedRecord,
  onDeleteFeedRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'tambah' | 'riwayat'>('tambah');
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().slice(0, 10));
  
  // Default values based on goat weight
  const defaultNeeds = useMemo(() => {
    return hitungKebutuhanPakanHarian(goat?.bobotBadan || 25);
  }, [goat?.bobotBadan]);

  const [jenisHijauan, setJenisHijauan] = useState<string>(
    PRESET_HIJAUAN[0].nama
  );
  const [takaranHijauanKg, setTakaranHijauanKg] = useState<string>(
    String(defaultNeeds.hijauanSegarKg)
  );

  const [jenisKonsentrat, setJenisKonsentrat] = useState<string>(
    PRESET_KONSENTRAT[0].nama
  );
  const [takaranKonsentratKg, setTakaranKonsentratKg] = useState<string>(
    String(defaultNeeds.konsentratKg)
  );

  const [frekuensi, setFrekuensi] = useState<string>('2x Sehari (Pagi 07.30 & Sore 16.00 WIB)');
  const [suplemenMineral, setSuplemenMineral] = useState<string>('Premix Mineral + Garam Dapur');
  const [nafsuMakan, setNafsuMakan] = useState<CatatanPakanHarian['nafsuMakan']>('Sangat Lahap (Habis)');
  const [petugas, setPetugas] = useState<string>('Petugas Lapangan');
  const [catatan, setCatatan] = useState<string>('');

  // Hitung estimasi biaya harian secara otomatis
  const hijauanNum = parseFloat(takaranHijauanKg) || 0;
  const konsentratNum = parseFloat(takaranKonsentratKg) || 0;

  const selectedHijauanMeta = PRESET_HIJAUAN.find((h) => h.nama === jenisHijauan) || {
    nama: jenisHijauan,
    bkPersen: 22,
    pkPersen: 12,
    hargaPerKg: 350,
  };
  const selectedKonsentratMeta = PRESET_KONSENTRAT.find((k) => k.nama === jenisKonsentrat) || {
    nama: jenisKonsentrat,
    bkPersen: 88,
    pkPersen: 15,
    hargaPerKg: 4200,
  };

  const autoBiayaHarian = Math.round(
    (hijauanNum * selectedHijauanMeta.hargaPerKg) + 
    (konsentratNum * selectedKonsentratMeta.hargaPerKg)
  );

  const [biayaHarianInput, setBiayaHarianInput] = useState<string>(String(autoBiayaHarian));

  // Sync auto biaya jika takaran berubah
  const handleTakaranHijauanChange = (val: string) => {
    setTakaranHijauanKg(val);
    const h = parseFloat(val) || 0;
    const k = parseFloat(takaranKonsentratKg) || 0;
    setBiayaHarianInput(String(Math.round(h * selectedHijauanMeta.hargaPerKg + k * selectedKonsentratMeta.hargaPerKg)));
  };

  const handleTakaranKonsentratChange = (val: string) => {
    setTakaranKonsentratKg(val);
    const h = parseFloat(takaranHijauanKg) || 0;
    const k = parseFloat(val) || 0;
    setBiayaHarianInput(String(Math.round(h * selectedHijauanMeta.hargaPerKg + k * selectedKonsentratMeta.hargaPerKg)));
  };

  if (!goat) return null;

  // Real-time nutrition balance
  const totalPakanSegar = Math.round((hijauanNum + konsentratNum) * 100) / 100;
  const rasioKonsentrat = totalPakanSegar > 0 ? Math.round((konsentratNum / totalPakanSegar) * 100) : 0;
  const rasioHijauan = 100 - rasioKonsentrat;

  const konsumsiBkHijauan = hijauanNum * (selectedHijauanMeta.bkPersen / 100);
  const konsumsiBkKonsentrat = konsentratNum * (selectedKonsentratMeta.bkPersen / 100);
  const totalBkKg = Math.round((konsumsiBkHijauan + konsumsiBkKonsentrat) * 100) / 100;
  const persenBkDariBb = Math.round((totalBkKg / goat.bobotBadan) * 100 * 10) / 10;

  // Estimasi Rata-rata PK Ransum
  const estimasiPkRansum = totalBkKg > 0 
    ? Math.round(((konsumsiBkHijauan * selectedHijauanMeta.pkPersen + konsumsiBkKonsentrat * selectedKonsentratMeta.pkPersen) / totalBkKg) * 10) / 10
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hijauanNum <= 0 && konsentratNum <= 0) return;

    const record: CatatanPakanHarian = {
      id: `feed-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tanggal,
      jenisHijauan,
      takaranHijauanKg: hijauanNum,
      jenisKonsentrat,
      takaranKonsentratKg: konsentratNum,
      frekuensi,
      suplemenMineral,
      nafsuMakan,
      biayaPakanHarianRp: parseFloat(biayaHarianInput) || autoBiayaHarian,
      petugas,
      catatan,
    };

    onSaveFeedRecord(goat.id, record);
    setActiveTab('riwayat');
  };

  const feedHistory = [...(goat.riwayatPakanHarian || [])].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
              <Wheat className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                Catat Pakan Harian Terperinci
              </h3>
              <p className="text-xs text-emerald-100">
                Eartag #{goat.nomorEartag} • {goat.bangsaTernak} ({goat.bobotBadan} kg) • Peternak: {goat.namaPeternak}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('tambah')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'tambah'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Form Input Pakan Harian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'riwayat'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Riwayat Log Pakan ({feedHistory.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto text-xs space-y-4">
          
          {activeTab === 'tambah' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Tanggal & Petugas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tanggal Pemberian Pakan *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Petugas / Pemberi Pakan
                  </label>
                  <input
                    type="text"
                    value={petugas}
                    onChange={(e) => setPetugas(e.target.value)}
                    placeholder="Nama petugas lapangan / peternak"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* SEKSI 1: Hijauan */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Wheat className="w-3.5 h-3.5 text-emerald-700" />
                    Komponen Hijauan Segar (Forage)
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold">
                    Kadar BK ~{selectedHijauanMeta.bkPersen}% • PK ~{selectedHijauanMeta.pkPersen}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Jenis Hijauan Utama *
                    </label>
                    <select
                      value={jenisHijauan}
                      onChange={(e) => {
                        setJenisHijauan(e.target.value);
                        const found = PRESET_HIJAUAN.find((h) => h.nama === e.target.value);
                        if (found) {
                          const h = parseFloat(takaranHijauanKg) || 0;
                          const k = parseFloat(takaranKonsentratKg) || 0;
                          setBiayaHarianInput(String(Math.round(h * found.hargaPerKg + k * selectedKonsentratMeta.hargaPerKg)));
                        }
                      }}
                      className="w-full font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none"
                    >
                      {PRESET_HIJAUAN.map((h) => (
                        <option key={h.nama} value={h.nama}>
                          {h.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Takaran Hijauan *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="25"
                        required
                        value={takaranHijauanKg}
                        onChange={(e) => handleTakaranHijauanChange(e.target.value)}
                        className="w-full font-extrabold text-base px-3 py-2 bg-white border-2 border-emerald-500/70 rounded-xl text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        kg/hari
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-[10px] text-slate-500">Pilihan cepat:</span>
                  {[2.0, 2.5, 3.0, 3.5, 4.5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleTakaranHijauanChange(String(val))}
                      className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 hover:bg-emerald-100 font-bold text-[10px] text-emerald-800"
                    >
                      {val} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* SEKSI 2: Konsentrat */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-700" />
                    Komponen Konsentrat / Penguat
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold">
                    Kadar BK ~{selectedKonsentratMeta.bkPersen}% • PK ~{selectedKonsentratMeta.pkPersen}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Jenis Konsentrat / Ransum Penguat *
                    </label>
                    <select
                      value={jenisKonsentrat}
                      onChange={(e) => {
                        setJenisKonsentrat(e.target.value);
                        const found = PRESET_KONSENTRAT.find((k) => k.nama === e.target.value);
                        if (found) {
                          const h = parseFloat(takaranHijauanKg) || 0;
                          const k = parseFloat(takaranKonsentratKg) || 0;
                          setBiayaHarianInput(String(Math.round(h * selectedHijauanMeta.hargaPerKg + k * found.hargaPerKg)));
                        }
                      }}
                      className="w-full font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-amber-600 focus:outline-none"
                    >
                      {PRESET_KONSENTRAT.map((k) => (
                        <option key={k.nama} value={k.nama}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Takaran Konsentrat *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        required
                        value={takaranKonsentratKg}
                        onChange={(e) => handleTakaranKonsentratChange(e.target.value)}
                        className="w-full font-extrabold text-base px-3 py-2 bg-white border-2 border-amber-500/70 rounded-xl text-slate-900 focus:border-amber-600 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        kg/hari
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-[10px] text-slate-500">Pilihan cepat:</span>
                  {[0.25, 0.4, 0.5, 0.75, 1.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleTakaranKonsentratChange(String(val))}
                      className="px-2 py-0.5 rounded-md bg-white border border-amber-300 hover:bg-amber-100 font-bold text-[10px] text-amber-800"
                    >
                      {val} kg ({val * 1000}g)
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-Time Ransum Balance & Nutrient Card */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Keseimbangan Nutrisi Ransum Harian
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Total Segar: <strong className="text-white">{totalPakanSegar} kg/hari</strong>
                  </span>
                </div>

                {/* Progress bar Hijauan vs Konsentrat */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                    <span>Hijauan: {rasioHijauan}% ({hijauanNum} kg)</span>
                    <span>Konsentrat: {rasioKonsentrat}% ({konsentratNum} kg)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all" 
                      style={{ width: `${rasioHijauan}%` }} 
                      title={`Hijauan ${rasioHijauan}%`}
                    />
                    <div 
                      className="bg-amber-500 h-full transition-all" 
                      style={{ width: `${rasioKonsentrat}%` }} 
                      title={`Konsentrat ${rasioKonsentrat}%`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium">Bahan Kering (BK)</span>
                    <span className="font-bold text-emerald-300 text-xs">{totalBkKg} kg</span>
                    <span className="text-[9px] text-slate-400 block">({persenBkDariBb}% BB)</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium">Protein Kasar (PK)</span>
                    <span className="font-bold text-amber-300 text-xs">~{estimasiPkRansum}%</span>
                    <span className="text-[9px] text-slate-400 block">{estimasiPkRansum >= 14 ? 'Memenuhi Standar' : 'Perlu Tambahan PK'}</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium">Prediksi ADG</span>
                    <span className="font-black text-white text-xs">
                      {rasioKonsentrat >= 40 ? '+140-200 g' : rasioKonsentrat >= 20 ? '+95-140 g' : '+40-80 g'}
                    </span>
                    <span className="text-[9px] text-slate-400 block">/hari</span>
                  </div>
                </div>
              </div>

              {/* Frekuensi, Suplemen, & Biaya Harian */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Frekuensi Pemberian
                  </label>
                  <select
                    value={frekuensi}
                    onChange={(e) => setFrekuensi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none font-medium"
                  >
                    <option value="2x Sehari (Pagi 07.30 & Sore 16.00 WIB)">2x Sehari (Pagi & Sore)</option>
                    <option value="3x Sehari (Pagi, Siang, & Sore)">3x Sehari (Intensif)</option>
                    <option value="1x Sehari (Pagi Saja)">1x Sehari</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nafsu Makan Ternak
                  </label>
                  <select
                    value={nafsuMakan}
                    onChange={(e) => setNafsuMakan(e.target.value as CatatanPakanHarian['nafsuMakan'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none font-medium"
                  >
                    <option value="Sangat Lahap (Habis)">Sangat Lahap (Habis Bersih)</option>
                    <option value="Normal">Normal (Sesuai Porsi)</option>
                    <option value="Sisa Sedikit">Sisa Sedikit (Kenyang)</option>
                    <option value="Kurang Nafsu">Kurang Bernafsu (Perlu Pantau)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Biaya Pakan Harian (Rp)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={biayaHarianInput}
                      onChange={(e) => setBiayaHarianInput(e.target.value)}
                      className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                      Rp/hari
                    </span>
                  </div>
                </div>
              </div>

              {/* Suplemen & Catatan Tambahan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Suplemen / Mineral Tambahan
                  </label>
                  <input
                    type="text"
                    value={suplemenMineral}
                    onChange={(e) => setSuplemenMineral(e.target.value)}
                    placeholder="Misal: Premix mineral, molase, probiotik EM4"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Catatan Khusus Pakan
                  </label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Misal: Hijauan dilayukan 2 jam sebelum diberikan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Catatan Pakan Harian
                </button>
              </div>

            </form>
          ) : (
            /* TAB RIWAYAT LOG PAKAN */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Riwayat Pencatatan Pakan Harian
                  </h4>
                  <p className="text-xs text-slate-500">
                    Log terperinci asupan hijauan dan konsentrat ternak #{goat.nomorEartag}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('tambah')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Input Baru
                </button>
              </div>

              {feedHistory.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <Wheat className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-600 text-xs">Belum ada log harian khusus untuk ternak ini</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Klik tombol "Form Input Pakan Harian" di atas untuk mencatat jenis hijauan dan takaran konsentrat hari ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {feedHistory.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3.5 bg-slate-50 hover:bg-emerald-50/40 transition-colors rounded-2xl border border-slate-200/90 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                              {item.tanggal}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.nafsuMakan?.includes('Lahap') 
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.nafsuMakan?.includes('Kurang')
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              Nafsu Makan: {item.nafsuMakan || 'Normal'}
                            </span>
                          </div>
                        </div>

                        {onDeleteFeedRecord && (
                          <button
                            type="button"
                            onClick={() => onDeleteFeedRecord(goat.id, item.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {/* Hijauan */}
                        <div className="bg-white p-2 rounded-xl border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-800 block">🌿 Hijauan Segar:</span>
                          <div className="font-bold text-slate-800">{item.takaranHijauanKg} kg/hari</div>
                          <div className="text-[10px] text-slate-500 truncate">{item.jenisHijauan}</div>
                        </div>

                        {/* Konsentrat */}
                        <div className="bg-white p-2 rounded-xl border border-amber-100">
                          <span className="text-[10px] font-bold text-amber-800 block">🥣 Konsentrat Penguat:</span>
                          <div className="font-bold text-slate-800">{item.takaranKonsentratKg} kg/hari ({item.takaranKonsentratKg * 1000} g)</div>
                          <div className="text-[10px] text-slate-500 truncate">{item.jenisKonsentrat}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Biaya: <strong>{formatRupiah(item.biayaPakanHarianRp || 0)}/hari</strong></span>
                        {item.suplemenMineral && <span>Mineral: {item.suplemenMineral}</span>}
                        {item.petugas && <span>Petugas: {item.petugas}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
