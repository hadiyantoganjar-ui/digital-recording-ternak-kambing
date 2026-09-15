import React, { useState, useEffect, useRef } from 'react';
import { GoatRecord } from '../types';
import { playBeepSound } from '../utils/storage';
import { 
  Radio, 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  HeartPulse, 
  User, 
  MapPin, 
  ArrowRight, 
  PlusCircle, 
  Sparkles,
  Zap,
  Wheat,
  Heart
} from 'lucide-react';

interface RfidScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  goats: GoatRecord[];
  onSelectGoat: (goat: GoatRecord) => void;
  onOpenQuickWeight: (goat: GoatRecord) => void;
  onOpenQuickHealth: (goat: GoatRecord) => void;
  onOpenFeedRecord?: (goat: GoatRecord) => void;
  onOpenEstrusRecord?: (goat: GoatRecord) => void;
  onRegisterNewRfid: (rfidNumber: string) => void;
}

export const RfidScannerModal: React.FC<RfidScannerModalProps> = ({
  isOpen,
  onClose,
  goats,
  onSelectGoat,
  onOpenQuickWeight,
  onOpenQuickHealth,
  onOpenFeedRecord,
  onOpenEstrusRecord,
  onRegisterNewRfid,
}) => {
  const [scannedCode, setScannedCode] = useState('');
  const [matchedGoat, setMatchedGoat] = useState<GoatRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [scanAnimation, setScanAnimation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample real RFIDs from the dataset for 1-tap simulation
  const sampleRfids = [
    { rfid: '112025180600004', eartag: '0004', desc: 'PE Betina I0 (Purwanto)' },
    { rfid: '112025180600008', eartag: '0008', desc: 'Boer Betina I3 (Lukman)' },
    { rfid: '112025180600017', eartag: '0017', desc: 'Saburai Betina I4 (Lukman)' },
    { rfid: '112025180600313', eartag: '0313', desc: 'Cros Boer Betina I2 35kg (Fajar)' },
    { rfid: '112025180600291', eartag: '0291', desc: 'PE Betina I4 (Suroto)' },
    { rfid: '112025180600100', eartag: '0100', desc: 'PE Jantan I3 (Purnomo)' },
  ];

  useEffect(() => {
    if (isOpen) {
      setScannedCode('');
      setMatchedGoat(null);
      setNotFound(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerScan = (codeToSearch: string) => {
    const trimmed = codeToSearch.trim();
    if (!trimmed) return;

    setScanAnimation(true);
    playBeepSound();

    // Look up by RFID or Eartag
    const found = goats.find(
      (g) => g.nomorRfid === trimmed || g.nomorEartag.toLowerCase() === trimmed.toLowerCase()
    );

    setTimeout(() => {
      setScanAnimation(false);
      if (found) {
        setMatchedGoat(found);
        setNotFound(false);
      } else {
        setMatchedGoat(null);
        setNotFound(true);
      }
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerScan(scannedCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Pindai RFID Lapangan</h3>
                <p className="text-xs text-emerald-200">
                  Koneksi reader RFID nirkabel & input cepat
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Scanner Input / Wedge Receiver */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Nomor Tag RFID / Eartag</span>
              <span className="text-[11px] font-normal text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Reader Siap Menerima Input
              </span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={scannedCode}
                onChange={(e) => {
                  setScannedCode(e.target.value);
                  setNotFound(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Tempel tag RFID atau ketik nomor..."
                className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 font-mono font-bold text-base focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Radio className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => triggerScan(scannedCode)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Scan
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              *Jika menggunakan scanner USB/Bluetooth di lapangan, arahkan ke eartag ternak, hasil scan otomatis terbaca.
            </p>
          </div>

          {/* Quick Simulation Tags for testing */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-600">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulasi Uji Tag Lapangan (Klik untuk scan):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sampleRfids.map((s) => (
                <button
                  key={s.rfid}
                  type="button"
                  onClick={() => {
                    setScannedCode(s.rfid);
                    triggerScan(s.rfid);
                  }}
                  className="text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all text-[11px]"
                >
                  <div className="font-mono font-bold text-slate-800">Tag #{s.eartag}</div>
                  <div className="text-[10px] text-slate-500 truncate">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scan Animation effect */}
          {scanAnimation && (
            <div className="flex items-center justify-center py-6">
              <div className="flex flex-col items-center gap-2 text-emerald-700 font-semibold text-sm">
                <Radio className="w-8 h-8 animate-spin text-emerald-600" />
                <span>Membaca sinyal RFID...</span>
              </div>
            </div>
          )}

          {/* Result Card: Matched Goat */}
          {matchedGoat && !scanAnimation && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 transition-all">
              <div className="flex items-start justify-between pb-3 border-b border-emerald-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    🐐
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900">
                        Eartag #{matchedGoat.nomorEartag}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        matchedGoat.jenisKelamin === 'Jantan'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {matchedGoat.jenisKelamin}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      RFID: {matchedGoat.nomorRfid}
                    </div>
                  </div>
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  matchedGoat.statusKesehatan === 'Sehat'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {matchedGoat.statusKesehatan}
                </span>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-3 text-xs">
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">BANGSA & UMUR</span>
                  <span className="font-bold text-slate-800">{matchedGoat.bangsaTernak}</span>
                  <span className="text-slate-500 ml-1">({matchedGoat.umur})</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">BOBOT TERAKHIR</span>
                  <span className="font-extrabold text-slate-900 text-sm">{matchedGoat.bobotBadan} kg</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">PETERNAK</span>
                  <span className="font-semibold text-slate-800 truncate block">{matchedGoat.namaPeternak}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">LOKASI KANDANG</span>
                  <span className="font-semibold text-slate-800 truncate block">{matchedGoat.lokasi}</span>
                </div>
              </div>

              {/* Quick Actions On Field */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectGoat(matchedGoat);
                  }}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Buka Profil Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQuickWeight(matchedGoat);
                  }}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center gap-1 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  <span>Update Bobot</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQuickHealth(matchedGoat);
                  }}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center gap-1 transition-colors"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  <span>Catat Medis</span>
                </button>
                {onOpenFeedRecord && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFeedRecord(matchedGoat);
                    }}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center gap-1 transition-colors"
                  >
                    <Wheat className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Catat Pakan</span>
                  </button>
                )}
                {onOpenEstrusRecord && matchedGoat.jenisKelamin === 'Betina' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEstrusRecord(matchedGoat);
                    }}
                    className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                    <span>Pantau Birahi</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Not Found State */}
          {notFound && !scanAnimation && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Nomor RFID Belum Terdaftar</h4>
              <p className="text-xs text-slate-600 mt-1">
                Tag <span className="font-mono font-bold text-amber-900">{scannedCode}</span> belum ada di database digital recording.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRegisterNewRfid(scannedCode);
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Daftarkan Ternak Baru dengan RFID Ini
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
