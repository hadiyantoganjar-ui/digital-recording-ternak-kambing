import React, { useState, useMemo, useEffect } from 'react';
import { GoatRecord, RiwayatBobot } from '../types';
import { 
  X, 
  Scale, 
  Save, 
  Calendar, 
  Ruler, 
  Wheat, 
  User, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { hitungAdgAntarTimbang } from '../utils/livestockScience';

interface EditWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  goat: GoatRecord;
  initialRecord: RiwayatBobot | null; // null jika mode tambah
  recordIndex: number | null; // index di goat.riwayatBobot
  onSaveRecord: (goatId: string, record: RiwayatBobot, recordIndex?: number) => void;
}

export const EditWeightModal: React.FC<EditWeightModalProps> = ({
  isOpen,
  onClose,
  goat,
  initialRecord,
  recordIndex,
  onSaveRecord,
}) => {
  const isEditMode = initialRecord !== null && recordIndex !== null;

  const [tanggal, setTanggal] = useState<string>(
    initialRecord?.tanggal || new Date().toISOString().slice(0, 10)
  );
  const [bobot, setBobot] = useState<string>(
    initialRecord ? String(initialRecord.bobot) : String(goat.bobotBadan)
  );
  const [lingkarDada, setLingkarDada] = useState<string>(
    initialRecord?.lingkarDadaCm ? String(initialRecord.lingkarDadaCm) : ''
  );
  const [pakanSaatTimbang, setPakanSaatTimbang] = useState<string>(
    initialRecord?.pakanSaatTimbang || ''
  );
  const [petugasPenimbang, setPetugasPenimbang] = useState<string>(
    initialRecord?.petugasPenimbang || 'Petugas Recording Lapangan'
  );
  const [catatan, setCatatan] = useState<string>(
    initialRecord?.catatan || ''
  );

  // Sync state whenever modal opens or initialRecord changes
  useEffect(() => {
    if (isOpen) {
      if (initialRecord) {
        setTanggal(initialRecord.tanggal);
        setBobot(String(initialRecord.bobot));
        setLingkarDada(initialRecord.lingkarDadaCm ? String(initialRecord.lingkarDadaCm) : '');
        setPakanSaatTimbang(initialRecord.pakanSaatTimbang || '');
        setPetugasPenimbang(initialRecord.petugasPenimbang || 'Petugas Recording Lapangan');
        setCatatan(initialRecord.catatan || '');
      } else {
        setTanggal(new Date().toISOString().slice(0, 10));
        setBobot(String(goat.bobotBadan));
        setLingkarDada('');
        setPakanSaatTimbang('');
        setPetugasPenimbang('Petugas Recording Lapangan');
        setCatatan('Penimbangan berkala monitoring pertumbuhan');
      }
    }
  }, [isOpen, initialRecord, goat.bobotBadan]);

  // Cari record sebelum tanggal ini untuk menghitung proyeksi ADG
  const adgPreview = useMemo(() => {
    const bobotNum = parseFloat(bobot);
    if (isNaN(bobotNum) || bobotNum <= 0 || !tanggal) return null;

    const allHistory = goat.riwayatBobot || [];
    // Urutkan kecuali record yang sedang diedit
    const otherRecords = allHistory
      .filter((_, idx) => !isEditMode || idx !== recordIndex)
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    // Cari data terdekat sebelum tanggal input
    const prevRecords = otherRecords.filter(
      (r) => new Date(r.tanggal).getTime() < new Date(tanggal).getTime()
    );

    if (prevRecords.length > 0) {
      const prev = prevRecords[prevRecords.length - 1];
      const res = hitungAdgAntarTimbang(bobotNum, tanggal, prev.bobot, prev.tanggal);
      return {
        ...res,
        prevTanggal: prev.tanggal,
        prevBobot: prev.bobot,
      };
    }

    return null;
  }, [bobot, tanggal, goat.riwayatBobot, isEditMode, recordIndex]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bobotNum = parseFloat(bobot);
    if (isNaN(bobotNum) || bobotNum <= 0) return;

    const ldNum = lingkarDada ? parseFloat(lingkarDada) : undefined;

    const updatedRecord: RiwayatBobot = {
      id: initialRecord?.id || `wt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tanggal,
      bobot: Math.round(bobotNum * 10) / 10,
      pakanSaatTimbang: pakanSaatTimbang.trim() || undefined,
      lingkarDadaCm: ldNum && !isNaN(ldNum) ? Math.round(ldNum * 10) / 10 : undefined,
      petugasPenimbang: petugasPenimbang.trim() || undefined,
      catatan: catatan.trim() || undefined,
    };

    onSaveRecord(goat.id, updatedRecord, isEditMode && recordIndex !== null ? recordIndex : undefined);
    onClose();
  };

  const presetPakanOptions = [
    'Rumput Odot (3.0 kg) + Konsentrat Dedak Bungkil (0.4 kg)',
    'Rumput Pakchong (3.5 kg) + Konsentrat Penggemukan (0.5 kg)',
    'Daun Indigofera (3.0 kg) + Formulasi Riset Unila (0.6 kg)',
    'Rumput Gajah (3.5 kg) + Dedak Padi Halus (0.4 kg)',
    'Rumput Lapang Alami Segar (Ad Libitum)',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isEditMode 
            ? 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800' 
            : 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {isEditMode ? 'Edit Data Penimbangan Bobot' : 'Tambah Data Penimbangan Baru'}
              </h3>
              <p className="text-xs text-white/80">
                Eartag #{goat.nomorEartag} • {goat.bangsaTernak} ({goat.jenisKelamin})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Tanggal & Bobot Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Tanggal Penimbangan *</span>
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
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bobot Timbangan (kg) *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="150"
                  required
                  value={bobot}
                  onChange={(e) => setBobot(e.target.value)}
                  placeholder="Contoh: 32.5"
                  className="w-full font-black text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none pr-10"
                />
                <span className="absolute right-3 top-2.5 font-bold text-slate-400">kg</span>
              </div>
            </div>
          </div>

          {/* Lingkar Dada & Petugas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-slate-500" />
                <span>Lingkar Dada (cm) <span className="text-slate-400 font-normal">(opsional)</span></span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="150"
                  value={lingkarDada}
                  onChange={(e) => setLingkarDada(e.target.value)}
                  placeholder="Contoh: 72.5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none pr-10"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 font-semibold">cm</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Petugas Penimbang</span>
              </label>
              <input
                type="text"
                value={petugasPenimbang}
                onChange={(e) => setPetugasPenimbang(e.target.value)}
                placeholder="Nama petugas lapangan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Pakan saat Penimbangan */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5 text-amber-600" />
                <span>Ransum Pakan Saat Timbang</span>
              </span>
              <span className="text-[10px] text-slate-400">Untuk analisis efisiensi FCR</span>
            </label>
            <input
              type="text"
              value={pakanSaatTimbang}
              onChange={(e) => setPakanSaatTimbang(e.target.value)}
              placeholder="Contoh: Rumput Odot (3 kg) + Dedak Bungkil (0.4 kg)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {presetPakanOptions.slice(0, 3).map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setPakanSaatTimbang(preset)}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded-md border border-slate-200 transition-colors text-left truncate max-w-full"
                >
                  + {preset.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Catatan / Keterangan Kondisi</span>
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Penimbangan pagi sebelum pakan, nafsu makan bagus"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* ADG Live Calculation Preview Card */}
          {adgPreview && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold ${
                  adgPreview.adgGramPerHari > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {adgPreview.adgGramPerHari > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : adgPreview.adgGramPerHari < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Korelasi dengan data sebelumnya ({adgPreview.prevTanggal} • {adgPreview.prevBobot} kg):
                  </span>
                  <span className="font-bold text-slate-800">
                    Selisih {adgPreview.selisihKg > 0 ? `+${adgPreview.selisihKg}` : adgPreview.selisihKg} kg ({adgPreview.selisihHari} hari)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Laju PBBH (ADG)</span>
                <span className={`font-black text-xs ${
                  adgPreview.adgGramPerHari > 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {adgPreview.adgGramPerHari > 0 ? `+${adgPreview.adgGramPerHari}` : adgPreview.adgGramPerHari} g/hari
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 font-bold text-white rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-colors ${
                isEditMode
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Simpan Perubahan Bobot' : 'Simpan Data Penimbangan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
