import React from 'react';
import { 
  X, 
  Heart, 
  Volume2, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { GoatRecord, HasilPrediksiBirahi } from '../types';
import { hitungPrediksiSiklusBirahi, formatTanggalIndo } from '../utils/livestockScience';
import { playEstrusAlarmSound } from '../utils/storage';

interface EstrusAlarmCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  goats: GoatRecord[];
  onSelectGoat: (goat: GoatRecord) => void;
  onOpenRecordEstrus: (goat: GoatRecord) => void;
}

export const EstrusAlarmCenterModal: React.FC<EstrusAlarmCenterModalProps> = ({
  isOpen,
  onClose,
  goats,
  onSelectGoat,
  onOpenRecordEstrus,
}) => {
  if (!isOpen) return null;

  // Evaluasi semua kambing betina
  const femaleGoats = goats.filter((g) => g.jenisKelamin === 'Betina');
  
  const evaluatedGoats = femaleGoats.map((g) => ({
    goat: g,
    prediksi: hitungPrediksiSiklusBirahi(g),
  }));

  // Kelompokkan berdasarkan urgensi
  const birahiAktifList = evaluatedGoats.filter(
    (item) => item.prediksi.isEligible && item.prediksi.statusFase === 'BIRAHI_AKTIF'
  );

  const siagaProestrusList = evaluatedGoats.filter(
    (item) => item.prediksi.isEligible && item.prediksi.statusFase === 'SIAGA_PROESTRUS'
  );

  const evaluasiList = evaluatedGoats.filter(
    (item) => item.prediksi.isEligible && item.prediksi.statusFase === 'TERLEWAT_EVALUASI'
  );

  const totalAlarmCount = birahiAktifList.length + siagaProestrusList.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-900 text-white p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-700/80 border border-rose-400/40 flex items-center justify-center text-rose-200 shadow-inner flex-shrink-0">
                <Flame className="w-6 h-6 text-rose-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">
                    Pusat Alarm Siklus Birahi Ternak
                  </h3>
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Real-Time
                  </span>
                </div>
                <p className="text-xs text-rose-200 mt-0.5">
                  Deteksi dini puncak estrus (standing heat) & siaga proestrus 21 hari kambing betina
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => playEstrusAlarmSound()}
                className="p-2 bg-white/10 hover:bg-white/20 text-rose-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Uji Bunyi Audio Alarm"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Uji Alarm</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-rose-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Alarm Summary */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-rose-700/60 text-center">
            <div className="bg-rose-950/40 rounded-xl p-2 border border-rose-600/40">
              <span className="text-[10px] text-rose-300 uppercase block font-semibold">Puncak Birahi Hari Ini</span>
              <span className="text-lg font-black text-rose-200">{birahiAktifList.length} Ekor</span>
            </div>
            <div className="bg-rose-950/40 rounded-xl p-2 border border-rose-600/40">
              <span className="text-[10px] text-rose-300 uppercase block font-semibold">Siaga (H-1 s.d H-3)</span>
              <span className="text-lg font-black text-amber-300">{siagaProestrusList.length} Ekor</span>
            </div>
            <div className="bg-rose-950/40 rounded-xl p-2 border border-rose-600/40">
              <span className="text-[10px] text-rose-300 uppercase block font-semibold">Total Betina Terpantau</span>
              <span className="text-lg font-black text-white">{femaleGoats.length} Ekor</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto space-y-4">
          
          {/* Section 1: ALARM BIRAHI AKTIF (PUNCAK HARI INI) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Alarm Puncak Birahi (Standing Heat / Siap Kawin Hari Ini)
                </h4>
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                {birahiAktifList.length} Ternak
              </span>
            </div>

            {birahiAktifList.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500">
                Tidak ada kambing betina yang sedang dalam puncak birahi hari ini.
              </div>
            ) : (
              <div className="space-y-2.5">
                {birahiAktifList.map(({ goat, prediksi }) => (
                  <div 
                    key={goat.id}
                    className="p-3.5 bg-gradient-to-r from-rose-50 via-pink-50 to-white rounded-2xl border-2 border-rose-400/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Eartag #{goat.nomorEartag}
                        </span>
                        <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          {goat.bangsaTernak} ({goat.umur})
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Bobot: {goat.bobotBadan} kg
                        </span>
                      </div>
                      <p className="text-xs text-rose-900 font-bold flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                        {prediksi.pesanAlarm}
                      </p>
                      <div className="text-[11px] text-slate-600">
                        <strong>Waktu Kawin Optimal:</strong> {prediksi.waktuKawinTerbaik}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Peternak: <strong>{goat.namaPeternak}</strong></span>
                        <span>•</span>
                        <span>Lokasi: <strong>{goat.lokasi}</strong></span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectGoat(goat);
                        }}
                        className="w-full px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        Detail Ternak
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenRecordEstrus(goat);
                        }}
                        className="w-full px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Catat Kawin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: SIAGA PROESTRUS (H-1 s.d H-3) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Siaga Birahi (Fase Proestrus H-1 s.d H-3 Menuju Puncak)
                </h4>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {siagaProestrusList.length} Ternak
              </span>
            </div>

            {siagaProestrusList.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500">
                Tidak ada kambing betina dalam masa siaga proestrus saat ini.
              </div>
            ) : (
              <div className="space-y-2.5">
                {siagaProestrusList.map(({ goat, prediksi }) => (
                  <div 
                    key={goat.id}
                    className="p-3.5 bg-gradient-to-r from-amber-50/70 to-white rounded-2xl border border-amber-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Eartag #{goat.nomorEartag}
                        </span>
                        <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                          {goat.bangsaTernak}
                        </span>
                        <span className="text-xs font-bold text-amber-800">
                          Sisa {prediksi.sisaHariMenujuBirahi} Hari
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        {prediksi.pesanAlarm}
                      </p>
                      <div className="text-[11px] text-slate-500">
                        Perkiraan Tanggal Birahi: <strong>{formatTanggalIndo(prediksi.tanggalPerkiraanBirahiBerikutnya)}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectGoat(goat);
                      }}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs flex-shrink-0"
                    >
                      Buka Profil
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edukasi Singkat Siklus Birahi */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Panduan Ilmiah Perkawinan Optimal (Fapet Unila & Standar Balitnak)</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Siklus birahi normal kambing berulang setiap <strong>21 hari</strong> (kisaran 18-24 hari). Ovulasi terjadi 24-36 jam setelah tanda estrus pertama. 
              Waktu terbaik mengawinkan (Golden Window) adalah <strong>12 s/d 24 jam</strong> sejak standing heat teramati, dengan rasio 1 pejantan untuk 20-25 betina.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            DigiKambing Real-Time Estrus Monitor
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
