import React from 'react';
import { 
  Radio, 
  Plus, 
  Download, 
  RotateCcw, 
  BarChart3, 
  ListOrdered, 
  Layers, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'data' | 'analytics';
  setActiveTab: (tab: 'data' | 'analytics') => void;
  onOpenRfidScanner: () => void;
  onOpenAddModal: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
  totalGoats: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenRfidScanner,
  onOpenAddModal,
  onExportCsv,
  onResetData,
  totalGoats,
}) => {
  return (
    <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand & App Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-700 border border-emerald-500/40 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <span className="font-black text-xl tracking-tighter">🐐</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
                  DigiKambing <span className="text-emerald-300 font-semibold text-xs sm:text-sm">RFID</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-800/80 border border-emerald-600/40 px-2 py-0.5 rounded-full text-emerald-200">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  RFID Terhubung
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/80 line-clamp-1">
                Digital Recording Lapangan • {totalGoats} Ekor Terdaftar
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <div className="hidden sm:flex items-center bg-emerald-950/60 p-1 rounded-xl border border-emerald-700/50">
            <button
              id="tab-data-ternak"
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'data'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              Data Ternak
            </button>
            <button
              id="tab-analisis-data"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Olah & Analisis Data
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Scan RFID Button */}
            <button
              id="btn-scan-rfid"
              onClick={onOpenRfidScanner}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
              title="Pindai RFID Lapangan"
            >
              <Radio className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Scan</span> RFID
            </button>

            {/* Tambah Ternak */}
            <button
              id="btn-tambah-ternak"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Tambah</span> Ternak
            </button>

            {/* More / Export */}
            <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-emerald-700/50">
              <button
                id="btn-export-csv"
                onClick={onExportCsv}
                className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
                title="Export Data CSV"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                id="btn-reset-data"
                onClick={onResetData}
                className="p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
                title="Muat Ulang Data Asli"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="sm:hidden border-t border-emerald-800/80 bg-emerald-950/90 px-4 py-1.5 flex items-center justify-around text-xs">
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-md font-medium ${
            activeTab === 'data' ? 'bg-emerald-700 text-white' : 'text-emerald-300'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          Data Ternak
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-md font-medium ${
            activeTab === 'analytics' ? 'bg-emerald-700 text-white' : 'text-emerald-300'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Olah Data
        </button>
        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-md text-emerald-300"
          title="Export CSV"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
    </header>
  );
};
