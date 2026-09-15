import React, { useState, useMemo } from 'react';
import { GoatRecord, CatatanKesehatan, RiwayatBobot, CatatanPakanHarian } from '../types';
import { 
  X, 
  Scale, 
  HeartPulse, 
  Wheat, 
  Dna, 
  Calendar, 
  User, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Printer,
  Copy,
  Radio,
  Coins,
  Sparkles,
  BookOpen,
  ArrowRight,
  Zap,
  Info,
  Pencil,
  Trash2
} from 'lucide-react';
import { 
  hitungAdgAntarTimbang, 
  hitungPrediksiHargaKambing, 
  hitungKebutuhanPakanHarian,
  hitungEfisiensiPakanAntarTimbang,
  formatRupiah 
} from '../utils/livestockScience';
import { WeightTrendChart } from './WeightTrendChart';
import { EditWeightModal } from './EditWeightModal';

interface GoatDetailModalProps {
  goat: GoatRecord | null;
  onClose: () => void;
  onOpenQuickWeight: (goat: GoatRecord) => void;
  onOpenQuickHealth: (goat: GoatRecord) => void;
  onOpenFeedRecord?: (goat: GoatRecord) => void;
  onEditGoat: (goat: GoatRecord) => void;
  onSaveWeightRecord?: (goatId: string, record: RiwayatBobot, recordIndex?: number) => void;
  onDeleteWeightRecord?: (goatId: string, recordIndex: number) => void;
}

export const GoatDetailModal: React.FC<GoatDetailModalProps> = ({
  goat,
  onClose,
  onOpenQuickWeight,
  onOpenQuickHealth,
  onOpenFeedRecord,
  onEditGoat,
  onSaveWeightRecord,
  onDeleteWeightRecord,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'bobot' | 'kesehatan' | 'pakan' | 'harga'>('profil');
  const [copied, setCopied] = useState(false);

  // State untuk Tambah & Edit Penimbangan
  const [isWeightEditModalOpen, setIsWeightEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<{
    record: RiwayatBobot | null;
    index: number | null;
  }>({
    record: null,
    index: null,
  });

  // State untuk Konfirmasi Hapus Data Penimbangan
  const [recordToDelete, setRecordToDelete] = useState<{
    record: RiwayatBobot;
    originalIndex: number;
  } | null>(null);

  // Sorting riwayat penimbangan kronologis dengan melampirkan originalIndex (dipanggil tanpa syarat sebelum early return)
  const riwayatSorted = useMemo(() => {
    if (!goat) return [];
    return (goat.riwayatBobot || [])
      .map((item, originalIndex) => ({
        ...item,
        originalIndex,
      }))
      .sort(
        (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
      );
  }, [goat?.riwayatBobot]);

  if (!goat) return null;

  const copyRfid = () => {
    navigator.clipboard.writeText(goat.nomorRfid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Prediksi harga jual ternak kambing di Lampung
  const prediksiHarga = hitungPrediksiHargaKambing(
    goat.bobotBadan,
    goat.jenisKelamin,
    goat.bangsaTernak,
    goat.umur
  );

  // Kebutuhan nutrisi pakan harian
  const nutrisiHarian = hitungKebutuhanPakanHarian(goat.bobotBadan);

  // Handler interaksi penimbangan bobot
  const handleOpenAddWeight = () => {
    setRecordToEdit({ record: null, index: null });
    setIsWeightEditModalOpen(true);
  };

  const handleOpenEditWeight = (record: RiwayatBobot, originalIndex: number) => {
    setRecordToEdit({ record, index: originalIndex });
    setIsWeightEditModalOpen(true);
  };

  const handlePromptDeleteWeight = (record: RiwayatBobot, originalIndex: number) => {
    setRecordToDelete({ record, originalIndex });
  };

  const handleConfirmDeleteWeight = () => {
    if (recordToDelete && onDeleteWeightRecord) {
      onDeleteWeightRecord(goat.id, recordToDelete.originalIndex);
    }
    setRecordToDelete(null);
  };

  // Overall ADG jika ada minimal 2 riwayat
  let overallAdg: { adgGramPerHari: number; selisihHari: number; selisihKg: number } | null = null;
  if (riwayatSorted.length >= 2) {
    const awal = riwayatSorted[0];
    const akhir = riwayatSorted[riwayatSorted.length - 1];
    overallAdg = hitungAdgAntarTimbang(akhir.bobot, akhir.tanggal, awal.bobot, awal.tanggal);
  }

  // Analisis Efisiensi Pakan (FCR) Berdasarkan Interval Penimbangan
  const analisisEfisiensiInterval = hitungEfisiensiPakanAntarTimbang(
    goat.riwayatBobot || [],
    goat.riwayatPakanHarian || [],
    goat.pakan,
    goat.bobotBadan
  );

  const feedHistorySorted = [...(goat.riwayatPakanHarian || [])].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                🐐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold tracking-tight">
                    Ternak Eartag #{goat.nomorEartag}
                  </h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    goat.jenisKelamin === 'Jantan'
                      ? 'bg-sky-400/20 text-sky-200 border border-sky-400/40'
                      : 'bg-rose-400/20 text-rose-200 border border-rose-400/40'
                  }`}>
                    {goat.jenisKelamin}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-emerald-200">
                  <span className="font-mono bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-700/50 flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-emerald-400" />
                    RFID: {goat.nomorRfid}
                  </span>
                  <button
                    onClick={copyRfid}
                    className="hover:text-white transition-colors"
                    title="Salin RFID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-300 font-bold">Disalin</span>}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar in Header */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-emerald-700/60 text-center">
            <div className="bg-emerald-950/40 rounded-xl p-2 border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Bobot Terkini</span>
              <span className="text-base sm:text-lg font-black text-white">{goat.bobotBadan} kg</span>
            </div>
            <div className="bg-emerald-950/40 rounded-xl p-2 border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Bangsa</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block">{goat.bangsaTernak}</span>
            </div>
            <div className="bg-emerald-950/40 rounded-xl p-2 border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Umur Gigi</span>
              <span className="text-xs sm:text-sm font-bold text-white">{goat.umur}</span>
            </div>
            <div className="bg-emerald-950/40 rounded-xl p-2 border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Prediksi Harga</span>
              <span className="text-xs sm:text-sm font-black text-amber-300">
                {formatRupiah(prediksiHarga.estimasiHargaTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 text-xs font-semibold text-slate-600 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('profil')}
            className={`py-2 px-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'profil'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Identitas
          </button>
          <button
            onClick={() => setActiveSubTab('bobot')}
            className={`py-2 px-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'bobot'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Tren Bobot & ADG ({riwayatSorted.length})
          </button>
          <button
            onClick={() => setActiveSubTab('harga')}
            className={`py-2 px-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'harga'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Valuasi Pasar Lampung
          </button>
          <button
            onClick={() => setActiveSubTab('pakan')}
            className={`py-2 px-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'pakan'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Wheat className="w-3.5 h-3.5" />
            Nutrisi & Pakan
          </button>
          <button
            onClick={() => setActiveSubTab('kesehatan')}
            className={`py-2 px-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'kesehatan'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Kesehatan ({goat.riwayatKesehatan?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          
          {/* 1. Tab Profil & Silsilah */}
          {activeSubTab === 'profil' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Peternak Pemilik</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{goat.namaPeternak}</div>
                  <span className="text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Kandang: {goat.lokasi}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registrasi Lapangan</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{goat.timestampAwal || '03/12/2025'}</div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Sinkronisasi RFID Lapangan
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nomor Pejantan (Sire)</span>
                  <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                    {goat.nomorPejantan || <span className="text-slate-400 font-normal italic">Tidak tercatat</span>}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nomor Induk (Dam)</span>
                  <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                    {goat.nomorInduk || <span className="text-slate-400 font-normal italic">Tidak tercatat</span>}
                  </div>
                </div>
              </div>

              {/* Dental Age Information Card */}
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900 block mb-1">Informasi Kelompok Umur ({goat.umur}):</span>
                <p className="text-slate-600">
                  {goat.umur === 'I0' && 'I0: Belum poel / masih gigi susu lengkap (Umur di bawah 1 tahun/Cempe-Dara).'}
                  {goat.umur === 'I1' && 'I1: Sudah poel 1 pasang gigi seri permanen (Umur 1 - 1.5 tahun, syarat sah qurban tercapai).'}
                  {goat.umur === 'I2' && 'I2: Sudah poel 2 pasang gigi seri permanen (Umur berkisar 1.5 hingga 2 tahun).'}
                  {goat.umur === 'I3' && 'I3: Sudah poel 3 pasang gigi seri permanen (Umur berkisar 2 hingga 3 tahun).'}
                  {goat.umur === 'I4' && 'I4: Poel rata 4 pasang (Umur dewasa lebih dari 3 tahun).'}
                </p>
              </div>
            </div>
          )}

          {/* 2. Tab Penimbangan Berkala & ADG */}
          {activeSubTab === 'bobot' && (
            <div className="space-y-4">
              {/* Visualisasi Grafik Tren Kenaikan Berat Badan Menggunakan Recharts */}
              <WeightTrendChart
                riwayatBobot={goat.riwayatBobot || []}
                bangsaTernak={goat.bangsaTernak}
                jenisKelamin={goat.jenisKelamin}
                onOpenAddWeight={handleOpenAddWeight}
              />

              {/* Header Tabel Kronologis */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Tabel Riwayat Penimbangan Kronologis
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Catatan detail penimbangan berkala, laju PBBH (ADG), serta opsi tambah, ubah, dan hapus data
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddWeight}
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Penimbangan</span>
                </button>
              </div>

              {/* Chronological Table of Weighing */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Bobot</th>
                      <th className="py-2.5 px-3">PBBH (ADG)</th>
                      <th className="py-2.5 px-3">Pakan & Keterangan</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riwayatSorted.map((item, idx) => {
                      let itemAdg: { adgGramPerHari: number; selisihHari: number; selisihKg: number } | null = null;
                      if (idx > 0) {
                        const prev = riwayatSorted[idx - 1];
                        itemAdg = hitungAdgAntarTimbang(item.bobot, item.tanggal, prev.bobot, prev.tanggal);
                      }

                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                            {item.tanggal}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-black text-slate-900 text-sm">{item.bobot}</span>
                            <span className="text-slate-500 text-[10px] ml-0.5">kg</span>
                            {item.lingkarDadaCm && (
                              <div className="text-[10px] text-slate-400">LD: {item.lingkarDadaCm} cm</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {itemAdg ? (
                              <div>
                                <span className={`font-bold text-[11px] px-1.5 py-0.5 rounded ${
                                  itemAdg.adgGramPerHari > 0
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {itemAdg.adgGramPerHari > 0 ? `+${itemAdg.adgGramPerHari}` : itemAdg.adgGramPerHari} g/hr
                                </span>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {itemAdg.selisihKg > 0 ? `+${itemAdg.selisihKg}` : itemAdg.selisihKg} kg ({itemAdg.selisihHari} hr)
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Penimbangan Awal</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 max-w-[160px]">
                            <div className="text-slate-800 font-medium truncate" title={item.pakanSaatTimbang || item.catatan || 'Penimbangan rutin'}>
                              {item.pakanSaatTimbang || item.catatan || 'Penimbangan rutin'}
                            </div>
                            {item.petugasPenimbang && (
                              <div className="text-[10px] text-slate-400 truncate">Petugas: {item.petugasPenimbang}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditWeight(item, item.originalIndex)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200/60 hover:border-emerald-300 transition-colors"
                                title="Edit data penimbangan ini"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[11px] font-semibold">Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePromptDeleteWeight(item, item.originalIndex)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-300 transition-colors"
                                title="Hapus data penimbangan ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[11px] font-semibold">Hapus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Analisis Efisiensi Pakan (FCR) Terhubung Antar-Penimbangan */}
              {analisisEfisiensiInterval.length > 0 && (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Wheat className="w-3.5 h-3.5 text-emerald-700" />
                        Analisis Efisiensi Pakan (FCR) Terhubung
                      </h5>
                      <p className="text-[11px] text-slate-600">
                        Evaluasi konversi asupan pakan (hijauan + konsentrat) menjadi pertambahan daging
                      </p>
                    </div>
                    {onOpenFeedRecord && (
                      <button
                        type="button"
                        onClick={() => onOpenFeedRecord(goat)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Log Pakan Harian
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {analisisEfisiensiInterval.map((fcrItem, fIdx) => (
                      <div key={fIdx} className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2 shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 text-xs font-mono">
                            Periode: {fcrItem.periode} ({fcrItem.durasiHari} hari)
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            fcrItem.statusEfisiensi === 'Sangat Efisien'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fcrItem.statusEfisiensi === 'Efisien (Standar Baik)'
                              ? 'bg-sky-100 text-sky-800'
                              : fcrItem.statusEfisiensi === 'Cukup / Moderat'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {fcrItem.statusEfisiensi}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] pt-1">
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">Gain / Kenaikan</span>
                            <span className="font-bold text-emerald-800">
                              {fcrItem.pertambahanBobotKg > 0 ? `+${fcrItem.pertambahanBobotKg}` : fcrItem.pertambahanBobotKg} kg
                            </span>
                            <span className="text-[9px] text-slate-500 block">(+{fcrItem.adgGramPerHari} g/hari)</span>
                          </div>

                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">Rerata Pakan/Hari</span>
                            <span className="font-bold text-slate-800">
                              {fcrItem.rerataHijauanKgPerHari} kg H + {fcrItem.rerataKonsentratKgPerHari} kg K
                            </span>
                            <span className="text-[9px] text-slate-500 block">Konsentrat ~{fcrItem.proporsiKonsentratPersen}%</span>
                          </div>

                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">FCR Bahan Kering</span>
                            <span className="font-black text-emerald-900 text-sm">
                              {fcrItem.fcrBahanKering < 900 ? fcrItem.fcrBahanKering : 'N/A'}
                            </span>
                            <span className="text-[9px] text-slate-500 block">kg BK / kg daging</span>
                          </div>

                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">Biaya / kg Gain</span>
                            <span className="font-bold text-slate-800">
                              {fcrItem.biayaPerKgPertambahan > 0 ? formatRupiah(fcrItem.biayaPerKgPertambahan) : 'N/A'}
                            </span>
                            <span className="text-[9px] text-slate-500 block">estimasi pakan</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                          <span>{fcrItem.evaluasiIlmiah}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Tab Valuasi Harga Jual Pasar Lampung */}
          {activeSubTab === 'harga' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-700" />
                    Prediksi Harga Pasar Hewan Lampung
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-700 text-white shadow-2xs">
                    {prediksiHarga.kategoriPasar}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Estimasi Harga Jual</span>
                    <span className="text-xl font-black text-emerald-900 block mt-0.5">
                      {formatRupiah(prediksiHarga.estimasiHargaTotal)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Timbang hidup {goat.bobotBadan} kg @ ~{formatRupiah(prediksiHarga.hargaDasarPerKg)}/kg
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Rentang Tawar Menawar</span>
                    <span className="text-sm font-bold text-slate-800 block mt-0.5">
                      {formatRupiah(prediksiHarga.rangeHargaMin)} - {formatRupiah(prediksiHarga.rangeHargaMax)}
                    </span>
                    <span className="text-[10px] text-slate-400">Toleransi pasar ±7%</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                  <strong className="text-slate-800 block">Faktor Penyesuaian Ilmiah (Regresi Pasar):</strong>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <div>Faktor Kelamin: <strong>{prediksiHarga.faktorKelamin}x</strong> ({goat.jenisKelamin})</div>
                    <div>Faktor Bangsa: <strong>{prediksiHarga.faktorBangsa}x</strong> ({goat.bangsaTernak})</div>
                    <div>Faktor Umur: <strong>{prediksiHarga.faktorKelayakan}x</strong> ({goat.umur})</div>
                  </div>
                </div>
              </div>

              {/* Referensi Pasar Lampung */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block text-[11px]">
                  📌 Acuan Pasar Ternak Lampung (Sukanegara, Sukoharjo, Tanggamus):
                </span>
                <p className="text-[10px]">
                  Kambing jantan kurban hidup di Lampung berkisar <strong>Rp 80.000 - Rp 95.000/kg</strong> bobot hidup, sedangkan kambing betina/indukan berkisar <strong>Rp 65.000 - Rp 75.000/kg</strong>. Ternak jantan yang telah poel (I1 ke atas) dan berbobot di atas 26 kg mendapatkan premi kelayakan kurban.
                </p>
              </div>
            </div>
          )}

          {/* 4. Tab Nutrisi & Pakan */}
          {activeSubTab === 'pakan' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Manajemen Nutrisi & Kebutuhan Pakan</h4>
                  <p className="text-slate-500 text-xs">Rekomendasi kebutuhan nutrisi harian berbasis bobot ({goat.bobotBadan} kg)</p>
                </div>
              </div>

              {/* NRC 2007 Requirement Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Bahan Kering (BK)</span>
                  <span className="text-sm font-black text-emerald-950">{nutrisiHarian.bahanKeringKg} kg</span>
                  <span className="text-[10px] text-emerald-700 block">3.2% Bobot Badan</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Hijauan Segar</span>
                  <span className="text-sm font-black text-emerald-950">{nutrisiHarian.hijauanSegarKg} kg</span>
                  <span className="text-[10px] text-emerald-700 block">10% Bobot Badan</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">Konsentrat</span>
                  <span className="text-sm font-black text-amber-950">{nutrisiHarian.konsentratKg} kg</span>
                  <span className="text-[10px] text-amber-700 block">1.2% Bobot Badan</span>
                </div>
                <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-center">
                  <span className="text-[10px] text-sky-800 font-bold uppercase block">Protein Kasar (PK)</span>
                  <span className="text-sm font-black text-sky-950">{nutrisiHarian.proteinKasarGram} g</span>
                  <span className="text-[10px] text-sky-700 block">Target 14% PK</span>
                </div>
              </div>

              {/* Data Pakan Saat Ini */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 block">Pemberian Pakan di Kandang:</span>
                  {onOpenFeedRecord && (
                    <button
                      type="button"
                      onClick={() => onOpenFeedRecord(goat)}
                      className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Catat Pakan Harian
                    </button>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jenis Pakan</span>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {goat.pakan?.jenisPakan || 'Hijauan Segar (Rumput Odot & Indigofera)'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Komposisi Ransum</span>
                  <p className="text-slate-700 font-medium mt-0.5">
                    {goat.pakan?.komposisiPakan || 'Rumput Odot 70% + Indigofera 20% + Dedak/Konsentrat 10%'}
                  </p>
                </div>
              </div>

              {/* Log Pakan Harian Terperinci */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      Log Asupan Pakan Harian Terperinci ({feedHistorySorted.length})
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Rincian jenis hijauan & takaran konsentrat terhubung ke analisis pertumbuhan bobot
                    </p>
                  </div>
                </div>

                {feedHistorySorted.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-1.5">
                    <Wheat className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 text-xs">Belum ada log pakan harian khusus</p>
                    <p className="text-[11px] text-slate-400">
                      Gunakan tombol "+ Catat Pakan Harian" di atas untuk mendata asupan hari ini secara terperinci.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {feedHistorySorted.map((item) => (
                      <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-mono text-xs">{item.tanggal}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Nafsu: {item.nafsuMakan || 'Normal'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                            <span className="text-[10px] font-bold text-emerald-800 block">Hijauan:</span>
                            <span className="font-bold text-slate-800">{item.takaranHijauanKg} kg/hari</span>
                            <div className="text-[10px] text-slate-500 truncate">{item.jenisHijauan}</div>
                          </div>
                          <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                            <span className="text-[10px] font-bold text-amber-800 block">Konsentrat:</span>
                            <span className="font-bold text-slate-800">{item.takaranKonsentratKg} kg/hari</span>
                            <div className="text-[10px] text-slate-500 truncate">{item.jenisKonsentrat}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>Biaya: <strong className="text-slate-700">{formatRupiah(item.biayaPakanHarianRp || 0)}/hari</strong></span>
                          {item.suplemenMineral && <span>Mineral: {item.suplemenMineral}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Tab Rekam Medis */}
          {activeSubTab === 'kesehatan' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Rekam Medis & Kesehatan</h4>
                  <p className="text-slate-500">
                    Status saat ini: <strong className="text-emerald-700">{goat.statusKesehatan}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenQuickHealth(goat)}
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Catat Pemeriksaan
                </button>
              </div>

              {goat.riwayatKesehatan && goat.riwayatKesehatan.length > 0 ? (
                <div className="space-y-3">
                  {goat.riwayatKesehatan.map((med) => (
                    <div key={med.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <HeartPulse className="w-4 h-4 text-rose-500" />
                          {med.jenisPenyakit}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {med.tanggalPemeriksaan}
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pengobatan yang Diberikan:</span>
                        <p className="text-slate-800 font-medium mt-0.5">{med.pengobatanDiberikan}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Petugas: {med.petugas || 'Petugas Lapangan'}</span>
                        <span className="font-bold text-emerald-700">Kondisi: {med.kondisiSaatIni || 'Selesai'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-700">Ternak Sehat / Belum Pernah Sakit</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Belum ada catatan diagnosa penyakit.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Kartu
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEditGoat(goat)}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
            >
              Edit Data
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>

      {/* Modal Edit / Tambah Penimbangan Bobot */}
      <EditWeightModal
        isOpen={isWeightEditModalOpen}
        onClose={() => {
          setIsWeightEditModalOpen(false);
          setRecordToEdit({ record: null, index: null });
        }}
        goat={goat}
        initialRecord={recordToEdit.record}
        recordIndex={recordToEdit.index}
        onSaveRecord={(goatId, record, recordIndex) => {
          if (onSaveWeightRecord) {
            onSaveWeightRecord(goatId, record, recordIndex);
          }
        }}
      />

      {/* Modal Dialog Konfirmasi Hapus Data Penimbangan */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Hapus Data Penimbangan?</h3>
                  <p className="text-[11px] text-white/80">Eartag #{goat.nomorEartag} • {goat.bangsaTernak}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">
                Apakah Anda yakin ingin menghapus catatan penimbangan tanggal berikut?
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Timbang:</span>
                  <span className="font-bold text-slate-800">{recordToDelete.record.tanggal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bobot Timbangan:</span>
                  <span className="font-black text-rose-600 text-sm">{recordToDelete.record.bobot} kg</span>
                </div>
                {recordToDelete.record.lingkarDadaCm && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lingkar Dada:</span>
                    <span className="font-semibold text-slate-700">{recordToDelete.record.lingkarDadaCm} cm</span>
                  </div>
                )}
                {recordToDelete.record.pakanSaatTimbang && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ransum Pakan:</span>
                    <span className="text-slate-700 truncate max-w-[200px]">{recordToDelete.record.pakanSaatTimbang}</span>
                  </div>
                )}
                {recordToDelete.record.petugasPenimbang && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Petugas:</span>
                    <span className="text-slate-700">{recordToDelete.record.petugasPenimbang}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Grafik tren bobot, estimasi laju PBBH (ADG), serta nilai bobot terkini kambing akan dikalkulasi ulang secara otomatis setelah data ini dihapus.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteWeight}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
