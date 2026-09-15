import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CloudOff } from 'lucide-react';

interface OfflineSyncIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onOpenModal: () => void;
  variant?: 'navbar' | 'floating';
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({
  isOnline,
  pendingCount,
  isSyncing,
  onOpenModal,
  variant = 'navbar',
}) => {
  if (variant === 'navbar') {
    return (
      <button
        type="button"
        onClick={onOpenModal}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
          !isOnline
            ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30'
            : pendingCount > 0
            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
            : 'bg-emerald-900/40 text-emerald-200 border-emerald-700/50 hover:bg-emerald-800/50'
        }`}
        title={
          !isOnline
            ? 'Mode Offline Lapangan (Tanpa Sinyal) - Klik untuk info sinkronisasi'
            : pendingCount > 0
            ? `${pendingCount} data siap disinkronkan`
            : 'Sistem Terhubung Online & Caching PWA Aktif'
        }
      >
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
        ) : !isOnline ? (
          <WifiOff className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        )}

        <span className="hidden md:inline">
          {!isOnline
            ? 'Offline'
            : pendingCount > 0
            ? `${pendingCount} Antrean`
            : 'Online'}
        </span>

        {pendingCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
            {pendingCount}
          </span>
        )}
      </button>
    );
  }

  // Floating banner for field view when offline or when queue exists
  if (isOnline && pendingCount === 0) return null;

  return (
    <aside
      role="status"
      aria-label="Status sinkronisasi offline"
      onClick={onOpenModal}
      className={`fixed bottom-4 left-4 z-40 max-w-sm rounded-2xl p-3 shadow-xl border backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3 ${
        !isOnline
          ? 'bg-amber-950/90 text-amber-100 border-amber-500/60'
          : 'bg-slate-900/90 text-white border-emerald-500/50'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        !isOnline ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
      }`}>
        {isSyncing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : !isOnline ? (
          <CloudOff className="w-4 h-4" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xs">
            {!isOnline ? 'Mode Lapangan (Tanpa Sinyal)' : 'Koneksi Pulih'}
          </span>
          {pendingCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 rounded bg-amber-400 text-slate-950">
              {pendingCount} Data
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-300 truncate mt-0.5">
          {!isOnline
            ? 'Input tetap tersimpan lokal & siap disinkronkan'
            : 'Klik untuk proses sinkronisasi sekarang'}
        </p>
      </div>
    </aside>
  );
};
