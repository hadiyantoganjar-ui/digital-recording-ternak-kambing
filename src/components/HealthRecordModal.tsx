import React, { useState } from 'react';
import { GoatRecord, CatatanKesehatan, StatusKesehatanUtama } from '../types';
import { X, HeartPulse, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface HealthRecordModalProps {
  goat: GoatRecord | null;
  onClose: () => void;
  onSaveHealthRecord: (goatId: string, record: CatatanKesehatan, newStatus: StatusKesehatanUtama) => void;
}

export const HealthRecordModal: React.FC<HealthRecordModalProps> = ({
  goat,
  onClose,
  onSaveHealthRecord,
}) => {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jenisPenyakit, setJenisPenyakit] = useState('');
  const [pengobatan, setPengobatan] = useState('');
  const [kondisi, setKondisi] = useState<'Sakit' | 'Membaik' | 'Sembuh'>('Membaik');
  const [petugas, setPetugas] = useState('Petugas Kesehatan Hewan Lapangan');
  const [catatan, setCatatan] = useState('');

  if (!goat) return null;

  const quickDiseases = [
    'Scabies (Kudis telinga/tubuh)',
    'ORF / Ecthyma (Keropeng mulut)',
    'Kembung / Bloat (Tympani akut)',
    'Diare / Enteritis bakterial',
    'Cacingan (Parasit lambung/usus)',
    'Pemeriksaan Rutin & Vitaminasi',
    'Infeksi Mata / Pinkeye',
    'Luka / Radang Kuku (Foot rot)',
  ];

  const quickTreatments: Record<string, string> = {
    'Scabies (Kudis telinga/tubuh)': 'Injeksi Ivermectin 1ml s.c. & salep belerang',
    'ORF / Ecthyma (Keropeng mulut)': 'Olesan Gentian Violet 1% + Injeksi Biodin / ATP',
    'Kembung / Bloat (Tympani akut)': 'Minyak kelapa/nabati 60ml + Bloat Stop oral + Vitamin B-Kompleks',
    'Diare / Enteritis bakterial)': 'Antibiotik Sulfa/Enrofloxacin oral + Larutan Elektrolit',
    'Cacingan (Parasit lambung/usus)': 'Drenching Albendazole suspensi 10% sesuai bobot',
    'Pemeriksaan Rutin & Vitaminasi': 'Injeksi Vitamin ADE + B-Kompleks 2ml & mineral blok',
    'Infeksi Mata / Pinkeye': 'Tetes mata Gentamicin & salep mata Terramycin',
    'Luka / Radang Kuku (Foot rot)': 'Pembersihan kuku + spray oxytetracycline biru',
  };

  const selectQuickDisease = (disease: string) => {
    setJenisPenyakit(disease);
    if (quickTreatments[disease]) {
      setPengobatan(quickTreatments[disease]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisPenyakit.trim() || !pengobatan.trim()) return;

    const newRecord: CatatanKesehatan = {
      id: `health-${Date.now()}`,
      tanggalPemeriksaan: tanggal,
      jenisPenyakit: jenisPenyakit.trim(),
      pengobatanDiberikan: pengobatan.trim(),
      kondisiSaatIni: kondisi,
      petugas: petugas.trim(),
      catatan: catatan.trim() || undefined,
    };

    let newStatus: StatusKesehatanUtama = 'Sehat';
    if (kondisi === 'Sakit') newStatus = 'Sakit';
    else if (kondisi === 'Membaik') newStatus = 'Dalam Perawatan';
    else if (kondisi === 'Sembuh') newStatus = 'Sehat';

    onSaveHealthRecord(goat.id, newRecord, newStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-800 to-red-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Catat Pemeriksaan Kesehatan</h3>
              <p className="text-xs text-rose-200">
                Eartag #{goat.nomorEartag} • Peternak: {goat.namaPeternak}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-rose-300 hover:text-white hover:bg-rose-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Tanggal Pemeriksaan */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tanggal Pemeriksaan *</label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-none"
            />
          </div>

          {/* Quick presets for common diseases */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Pilih Penyakit Cepat (Atau ketik sendiri):</label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {quickDiseases.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => selectQuickDisease(d)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    jenisPenyakit === d
                      ? 'bg-rose-700 text-white shadow-2xs font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-rose-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Jenis Penyakit Input */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Jenis Penyakit / Diagnosa Klinis *</label>
            <input
              type="text"
              required
              value={jenisPenyakit}
              onChange={(e) => setJenisPenyakit(e.target.value)}
              placeholder="Contoh: Scabies telinga, Kembung, ORF, dll"
              className="w-full font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-none"
            />
          </div>

          {/* Pengobatan yang Diberikan */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Pengobatan yang Diberikan *</label>
            <textarea
              rows={2}
              required
              value={pengobatan}
              onChange={(e) => setPengobatan(e.target.value)}
              placeholder="Nama obat, dosis, dan cara pemberian (contoh: Injeksi Ivermectin 1ml s.c. & salep)"
              className="w-full font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-none"
            />
          </div>

          {/* Kondisi Ternak Saat Ini */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Kondisi Saat Ini</label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value as 'Sakit' | 'Membaik' | 'Sembuh')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:border-rose-600 focus:outline-none"
              >
                <option value="Sakit">Masih Sakit</option>
                <option value="Membaik">Membaik / Perawatan</option>
                <option value="Sembuh">Sembuh Total</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Petugas Pemeriksa</label>
              <input
                type="text"
                value={petugas}
                onChange={(e) => setPetugas(e.target.value)}
                placeholder="Drh. / Mantri / Petugas PPL"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Catatan Khusus */}
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Catatan Tambahan</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Jadwalkan penyuntikan ulang 7 hari ke depan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
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
              className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Rekam Medis
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
