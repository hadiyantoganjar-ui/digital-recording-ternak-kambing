import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Jika sudah terinstall standalone, sembunyikan tombol
  if (isInstalled) {
    return null;
  }

  // Alur Browser Chromium / Android / Desktop
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${
          compact
            ? 'p-2 bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs'
            : 'px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs'
        }`}
        title="Install Aplikasi ke HP/Laptop (PWA)"
      >
        <Download className="w-3.5 h-3.5" />
        <span className={compact ? 'hidden lg:inline' : 'inline'}>Install App</span>
      </button>
    );
  }

  // Alur iOS Safari (tidak mendukung beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl font-bold transition-all ${
            compact
              ? 'p-2 bg-white/15 hover:bg-white/25 text-white text-xs'
              : 'px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs'
          }`}
          title="Install di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className={compact ? 'hidden lg:inline' : 'inline'}>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <h3>Pasang di iPhone / iPad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Buka di browser <strong>Safari</strong> lalu ketuk tombol <strong>Share / Bagikan</strong> (ikon kotak dengan panah ke atas di bilah bawah).</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Gulir ke bawah menu opsi dan pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon aplikasi siap dibuka secara mandiri tanpa browser.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
