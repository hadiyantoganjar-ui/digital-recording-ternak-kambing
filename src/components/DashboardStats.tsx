import React from 'react';
import { GoatRecord } from '../types';
import { 
  Users, 
  Activity, 
  Scale, 
  HeartPulse, 
  MapPin, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

interface DashboardStatsProps {
  goats: GoatRecord[];
  onSelectQuickFilter?: (filterType: string, value: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  goats,
  onSelectQuickFilter,
}) => {
  const total = goats.length;
  const jantan = goats.filter((g) => g.jenisKelamin === 'Jantan').length;
  const betina = goats.filter((g) => g.jenisKelamin === 'Betina').length;

  const totalBobot = goats.reduce((acc, g) => acc + (g.bobotBadan || 0), 0);
  const avgBobot = total > 0 ? (totalBobot / total).toFixed(1) : '0';

  const sehat = goats.filter((g) => g.statusKesehatan === 'Sehat').length;
  const sakitOrPerawatan = goats.filter((g) => g.statusKesehatan !== 'Sehat').length;

  const peternakSet = new Set(goats.map((g) => g.namaPeternak.trim()).filter(Boolean));
  const lokasiSet = new Set(goats.map((g) => g.lokasi.trim()).filter(Boolean));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Total Populasi */}
      <div 
        onClick={() => onSelectQuickFilter && onSelectQuickFilter('all', '')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ternak</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</span>
          <span className="text-xs font-medium text-slate-500">ekor</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{peternakSet.size} Peternak terdata</span>
        </div>
      </div>

      {/* 2. Jenis Kelamin */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rasio Kelamin</span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onSelectQuickFilter && onSelectQuickFilter('jenisKelamin', 'Jantan')}
            className="text-left hover:text-sky-600 transition-colors"
          >
            <span className="text-xs text-slate-500 block">Jantan</span>
            <span className="text-xl font-extrabold text-sky-900">{jantan}</span>
            <span className="text-[10px] text-slate-400 ml-1 font-medium">({total > 0 ? Math.round((jantan / total) * 100) : 0}%)</span>
          </button>
          <span className="text-slate-300 font-light text-xl">/</span>
          <button 
            onClick={() => onSelectQuickFilter && onSelectQuickFilter('jenisKelamin', 'Betina')}
            className="text-right hover:text-rose-600 transition-colors"
          >
            <span className="text-xs text-slate-500 block">Betina</span>
            <span className="text-xl font-extrabold text-rose-800">{betina}</span>
            <span className="text-[10px] text-slate-400 ml-1 font-medium">({total > 0 ? Math.round((betina / total) * 100) : 0}%)</span>
          </button>
        </div>
        <div className="mt-2 h-1.5 w-full bg-rose-100 rounded-full overflow-hidden flex">
          <div 
            className="bg-sky-500 h-full" 
            style={{ width: `${total > 0 ? (jantan / total) * 100 : 50}%` }}
          />
          <div 
            className="bg-rose-400 h-full" 
            style={{ width: `${total > 0 ? (betina / total) * 100 : 50}%` }}
          />
        </div>
      </div>

      {/* 3. Rata-Rata Bobot */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rerata Bobot</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{avgBobot}</span>
          <span className="text-xs font-medium text-slate-500">kg / ekor</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          Total biomassa: {(totalBobot / 1000).toFixed(2)} ton
        </div>
      </div>

      {/* 4. Status Kesehatan */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kondisi Kesehatan</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <HeartPulse className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectQuickFilter && onSelectQuickFilter('statusKesehatan', 'Sehat')}
            className="text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sehat</span>
            </div>
            <span className="text-xl font-extrabold text-emerald-900">{sehat}</span>
          </button>
          <button
            onClick={() => onSelectQuickFilter && onSelectQuickFilter('statusKesehatan', 'Dalam Perawatan')}
            className="text-right hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-1 text-amber-700 text-xs font-semibold justify-end">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Perawatan</span>
            </div>
            <span className="text-xl font-extrabold text-amber-800">{sakitOrPerawatan}</span>
          </button>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Tingkat Sehat</span>
          <span className="font-semibold text-emerald-700">
            {total > 0 ? Math.round((sehat / total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 5. Wilayah / Lokasi */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Wilayah Lapangan</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {Array.from(lokasiSet).map((loc) => {
            const count = goats.filter((g) => g.lokasi === loc).length;
            return (
              <button
                key={loc}
                onClick={() => onSelectQuickFilter && onSelectQuickFilter('lokasi', loc)}
                className="text-[11px] font-medium bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>{loc}</span>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 rounded-full border border-slate-200">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          {lokasiSet.size} desa / sentra ternak
        </div>
      </div>

    </div>
  );
};
