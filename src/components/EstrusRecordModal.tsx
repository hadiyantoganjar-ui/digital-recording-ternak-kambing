import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Calendar, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  HelpCircle,
  FileCheck2,
  Activity
} from 'lucide-react';
import { GoatRecord, CatatanBirahi, StatusReproduksi } from '../types';
import { hitungPrediksiSiklusBirahi, formatTanggalIndo } from '../utils/livestockScience';
import { playEstrusAlarmSound } from '../utils/storage';

interface EstrusRecordModalProps {
  goat: GoatRecord;
  onClose: () => void;
  onSave: (updatedGoat: GoatRecord) => void;
}

const GEJALA_OPTIONS = [
  'Vulva bengkak, memerah, dan basah',
  'Keluar lendir transparan (bening) elastis',
  'Standing heat (diam dan mau dinaiki pejantan/betina lain)',
  'Ekor mengibas-ngibas aktif (tail flagging)',
  'Gelisah dan sering mengembik mencari pejantan',
  'Nafsu makan sedikit menurun',
  'Menaiki ternak betina lain di dalam kandang',
];

export const EstrusRecordModal: React.FC<EstrusRecordModalProps> = ({
  goat,
  onClose,
  onSave,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [tanggalBirahi, setTanggalBirahi] = useState<string>(todayStr);
  const [intensitasBirahi, setIntensitasBirahi] = useState<CatatanBirahi['intensitasBirahi']>('Sangat Jelas / Kuat');
  const [selectedGejala, setSelectedGejala] = useState<string[]>([
    'Vulva bengkak, memerah, dan basah',
    'Keluar lendir transparan (bening) elastis',
    'Standing heat (diam dan mau dinaiki pejantan/betina lain)',
    'Ekor mengibas-ngibas aktif (tail flagging)',
  ]);
  const [tindakan, setTindakan] = useState<CatatanBirahi['tindakan']>('Dikawinkan Pejantan');
  const [pejantanId, setPejantanId] = useState<string>(goat.nomorPejantan || '');
  const [petugasPengamat, setPetugasPengamat] = useState<string>('Petugas Kandang');
  const [catatan, setCatatan] = useState<string>('');
  const [statusReproduksiBaru, setStatusReproduksiBaru] = useState<StatusReproduksi>(
    goat.statusReproduksi || 'Siap Kawin / Siklus Aktif'
  );

  const toggleGejala = (g: string) => {
    if (selectedGejala.includes(g)) {
      setSelectedGejala(selectedGejala.filter((item) => item !== g));
    } else {
      setSelectedGejala([...selectedGejala, g]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: CatatanBirahi = {
      id: `birahi-${Date.now()}`,
      tanggalBirahi,
      gejalaKlinis: selectedGejala,
      intensitasBirahi,
      tindakan,
      pejantanId: tindakan === 'Dikawinkan Pejantan' || tindakan === 'Inseminasi Buatan (IB)' ? pejantanId : undefined,
      petugasPengamat,
      catatan,
    };

    const existingRiwayat = goat.riwayatBirahi ? [...goat.riwayatBirahi] : [];
    const updatedRiwayat = [newRecord, ...existingRiwayat];

    // Ambil tanggal terbaru dari riwayat
    const sorted = [...updatedRiwayat].sort(
      (a, b) => new Date(b.tanggalBirahi).getTime() - new Date(a.tanggalBirahi).getTime()
    );
    const newestDate = sorted[0].tanggalBirahi;

    const updatedGoat: GoatRecord = {
      ...goat,
      statusReproduksi: statusReproduksiBaru,
      tanggalBirahiTerakhir: newestDate,
      riwayatBirahi: updatedRiwayat,
      nomorPejantan: pejantanId || goat.nomorPejantan,
      updatedAt: new Date().toISOString(),
    };

    // Bunyikan nada konfirmasi
    playEstrusAlarmSound();
    onSave(updatedGoat);
  };

  // Preview Prediksi Real-time Berdasarkan Tanggal yang Dipilih di Form
  const tempGoatForPreview: GoatRecord = {
    ...goat,
    statusReproduksi: statusReproduksiBaru,
    tanggalBirahiTerakhir: tanggalBirahi,
  };
  const previewPrediksi = hitungPrediksiSiklusBirahi(tempGoatForPreview);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-rose-900 text-white p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                <Heart className="w-6 h-6 text-rose-200 fill-rose-300" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Catat Siklus Birahi & Reproduksi
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-rose-100">
                  <span className="font-semibold bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-600/50">
                    Eartag #{goat.nomorEartag}
                  </span>
                  <span>{goat.bangsaTernak}</span>
                  <span>•</span>
                  <span>Bobot: {goat.bobotBadan} kg</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Status Reproduksi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Reproduksi Ternak
            </label>
            <select
              value={statusReproduksiBaru}
              onChange={(e) => setStatusReproduksiBaru(e.target.value as StatusReproduksi)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            >
              <option value="Siap Kawin / Siklus Aktif">Siap Kawin / Siklus Aktif (Normal Berahi)</option>
              <option value="Dara (Belum Dikawinkan)">Dara (Belum Dikawinkan)</option>
              <option value="Bunting">Bunting (Gestasi Aktif)</option>
              <option value="Laktasi / Menyusui">Laktasi / Menyusui</option>
              <option value="Afkir / Tidak Produktif">Afkir / Tidak Produktif</option>
            </select>
          </div>

          {/* Tanggal Birahi Teramati */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Tanggal Pengamatan Birahi Terakhir</span>
              <span className="text-[11px] font-normal text-rose-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Hari Ini: {formatTanggalIndo(todayStr)}
              </span>
            </label>
            <input
              type="date"
              value={tanggalBirahi}
              onChange={(e) => setTanggalBirahi(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              *Masukkan tanggal kapan gejala estrus/birahi pertama kali diamati di kandang.
            </p>
          </div>

          {/* Intensitas Birahi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Intensitas / Kejelasan Tanda Birahi
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['Sangat Jelas / Kuat', 'Sedang', 'Lemah / Tenang (Silent Heat)'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensitasBirahi(lvl)}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                    intensitasBirahi === lvl
                      ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-200'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Gejala Klinis Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Gejala Klinis Teramati di Kandang
            </label>
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-40 overflow-y-auto">
              {GEJALA_OPTIONS.map((gejala) => {
                const isChecked = selectedGejala.includes(gejala);
                return (
                  <label
                    key={gejala}
                    className={`flex items-start gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isChecked ? 'bg-rose-100/60 text-rose-950 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleGejala(gejala)}
                      className="mt-0.5 rounded-sm text-rose-600 focus:ring-rose-500"
                    />
                    <span>{gejala}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tindakan & Pejantan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tindakan Perkawinan
              </label>
              <select
                value={tindakan}
                onChange={(e) => setTindakan(e.target.value as CatatanBirahi['tindakan'])}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="Dikawinkan Pejantan">Dikawinkan Pejantan (Alami)</option>
                <option value="Inseminasi Buatan (IB)">Inseminasi Buatan (IB)</option>
                <option value="Hanya Dicatat (Tidak Dikawinkan)">Hanya Dicatat (Tidak Dikawinkan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor Pejantan / Straw IB
              </label>
              <input
                type="text"
                value={pejantanId}
                onChange={(e) => setPejantanId(e.target.value)}
                placeholder="Contoh: 0100 (PE) atau Boer-01"
                className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Pengamat & Catatan Tambahan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Petugas Pengamat
              </label>
              <input
                type="text"
                value={petugasPengamat}
                onChange={(e) => setPetugasPengamat(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Tambahan
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan kondisi estrus..."
                className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Real-time Preview Kalkulasi Prediksi */}
          <div className="p-3.5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-900">
                Pratinjau Prediksi Siklus Ilmiah Real-Time
              </span>
            </div>

            {previewPrediksi.isEligible ? (
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status Siklus:</span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${previewPrediksi.badgeColor}`}>
                    {previewPrediksi.badgeLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hari dalam Siklus (1 - 21):</span>
                  <span className="font-bold text-slate-900">Hari ke-{previewPrediksi.hariKeDalamSiklus} / 21</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Prediksi Birahi Berikutnya:</span>
                  <span className="font-bold text-rose-800">
                    {formatTanggalIndo(previewPrediksi.tanggalPerkiraanBirahiBerikutnya)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 bg-white/70 p-2 rounded-xl border border-rose-100">
                  <strong>Waktu Kawin Terbaik:</strong> {previewPrediksi.waktuKawinTerbaik}
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-700 font-medium">
                {previewPrediksi.alasanIneligible}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              Simpan & Aktifkan Prediksi
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
