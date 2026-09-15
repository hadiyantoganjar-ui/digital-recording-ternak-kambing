import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  X, 
  HardDrive, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Layers,
  Trash2
} from 'lucide-react';
import { OfflineQueueItem } from '../services/offlineSync';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  pendingCount: number;
  queue: OfflineQueueItem[];
  isSyncing: boolean;
  lastSyncTime: string | null;
  onSyncNow: () => void;
  onClearHistory: () => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  pendingCount,
  queue,
  isSyncing,
  lastSyncTime,
  onSyncNow,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const pendingItems = queue.filter((item) => !item.synced);
  const syncedItems = queue.filter((item) => item.synced);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-4 sm:p-5 text-white flex items-center justify-between ${
          isOnline ? 'bg-gradient-to-r from-emerald-700 to-teal-800' : 'bg-gradient-to-r from-amber-600 to-orange-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-white" />
              ) : (
                <WifiOff className="w-5 h-5 text-white animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {isOnline ? 'Status Online & Sinkronisasi' : 'Mode Offline Lapangan'}
                </h3>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                  isOnline ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/40' : 'bg-white/20 text-white border border-white/30'
                }`}>
                  {isOnline ? 'Terhubung' : 'Blank Spot'}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                PWA Caching & Mekanisme Penyimpanan Offline Terintegrasi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Status Banner */}
          <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
            isOnline 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="mt-0.5 shrink-0">
              {isOnline ? (
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              ) : (
                <HardDrive className="w-4 h-4 text-amber-700" />
              )}
            </div>
            <div className="space-y-1">
              <span className="font-bold block">
                {isOnline
                  ? 'Koneksi internet aktif. Data lapangan tersinkronisasi otomatis.'
                  : 'Anda berada di area tanpa sinyal (offline/blank spot kandang).'}
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Aplikasi tetap berfungsi 100% secara lokal. Seluruh pendaftaran RFID baru, input bobot, diagnosis kesehatan, pakan, dan siklus birahi disimpan di memori perangkat dan otomatis disinkronkan saat koneksi kembali.
              </p>
            </div>
          </div>

          {/* Sync Trigger Action */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {pendingCount > 0 
                  ? `${pendingCount} Catatan Menunggu Sinkronisasi` 
                  : 'Semua Data Telah Tersinkron'}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                {lastSyncTime 
                  ? `Terakhir sinkron: ${new Date(lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` 
                  : 'Sinkronisasi otomatis aktif'}
              </span>
            </div>

            <button
              type="button"
              disabled={isSyncing || !isOnline || pendingCount === 0}
              onClick={onSyncNow}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                pendingCount > 0 && isOnline
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>

          {/* Pending Changes List */}
          {pendingItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Antrean Input Lapangan ({pendingItems.length})
                </span>
                <span className="text-[10px] text-slate-400">Tersimpan lokal</span>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {pendingItems.map((item) => (
                  <div key={item.id} className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="font-mono text-emerald-800">#{item.nomorEartag}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">
                          {item.action.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 truncate max-w-[260px]">{item.deskripsi}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synced History */}
          {syncedItems.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Riwayat Tersinkronisasi ({syncedItems.length})
                </span>
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  title="Bersihkan riwayat tersinkron"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Bersihkan</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {syncedItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="font-mono font-bold text-slate-700">#{item.nomorEartag}</span>
                      <span className="text-slate-500 ml-1.5">{item.deskripsi}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold shrink-0">✓ Sinkron</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PWA Info Card */}
          <div className="p-3 bg-slate-100 rounded-2xl text-[11px] text-slate-600 space-y-1 border border-slate-200/80">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              Teknologi Offline PWA & Service Worker
            </span>
            <p>
              Halaman aplikasi, skrip, dan aset antarmuka telah dicache oleh Service Worker ke penyimpanan browser. Anda dapat membuka dan menjalankan aplikasi ini kapan saja sekalipun perangkat dimatikan atau berada di pelosok tanpa jaringan.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
