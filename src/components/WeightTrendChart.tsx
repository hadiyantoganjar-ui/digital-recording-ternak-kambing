import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { RiwayatBobot, JenisKelamin } from '../types';
import { hitungAdgAntarTimbang } from '../utils/livestockScience';
import { TrendingUp, Scale, Plus, Calendar, Activity, Info, Sparkles } from 'lucide-react';

interface WeightTrendChartProps {
  riwayatBobot: RiwayatBobot[];
  bangsaTernak?: string;
  jenisKelamin?: JenisKelamin;
  onOpenAddWeight?: () => void;
}

export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  riwayatBobot,
  bangsaTernak = 'Kambing',
  jenisKelamin = 'Jantan',
  onOpenAddWeight,
}) => {
  const [chartMode, setChartMode] = useState<'bobot' | 'adg'>('bobot');

  // Urutkan riwayat penimbangan kronologis
  const sortedRecords = useMemo(() => {
    if (!riwayatBobot || riwayatBobot.length === 0) return [];
    return [...riwayatBobot].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );
  }, [riwayatBobot]);

  // Transformasi data untuk Recharts
  const chartData = useMemo(() => {
    if (sortedRecords.length === 0) return [];
    const baseline = sortedRecords[0].bobot;

    return sortedRecords.map((item, idx) => {
      let adgGram = 0;
      let diffPrevKg = 0;
      let daysFromPrev = 0;

      if (idx > 0) {
        const prev = sortedRecords[idx - 1];
        const res = hitungAdgAntarTimbang(item.bobot, item.tanggal, prev.bobot, prev.tanggal);
        adgGram = res.adgGramPerHari;
        diffPrevKg = res.selisihKg;
        daysFromPrev = res.selisihHari;
      }

      // Format tanggal pendek: "03 Des 25"
      const dateObj = new Date(item.tanggal);
      const formattedDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })
        : item.tanggal;

      return {
        id: idx,
        rawTanggal: item.tanggal,
        tanggalLabel: formattedDate,
        bobot: item.bobot,
        totalGain: Math.round((item.bobot - baseline) * 10) / 10,
        diffPrevKg,
        daysFromPrev,
        adgGram,
        pakan: item.pakanSaatTimbang || item.catatan || 'Penimbangan rutin',
        lingkarDada: item.lingkarDadaCm,
        petugas: item.petugasPenimbang,
      };
    });
  }, [sortedRecords]);

  // Statistik ringkasan
  const stats = useMemo(() => {
    if (sortedRecords.length === 0) return null;
    const initialWeight = sortedRecords[0].bobot;
    const currentWeight = sortedRecords[sortedRecords.length - 1].bobot;
    const totalGain = Math.round((currentWeight - initialWeight) * 10) / 10;

    let totalAdg = 0;
    let totalDays = 0;
    if (sortedRecords.length >= 2) {
      const firstDate = new Date(sortedRecords[0].tanggal).getTime();
      const lastDate = new Date(sortedRecords[sortedRecords.length - 1].tanggal).getTime();
      totalDays = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
      totalAdg = Math.round((totalGain * 1000) / totalDays);
    }

    // Hitung min & max bobot untuk domain Y Axis
    const weights = sortedRecords.map((r) => r.bobot);
    const minW = Math.floor(Math.min(...weights) - 2);
    const maxW = Math.ceil(Math.max(...weights) + 3);

    return {
      initialWeight,
      currentWeight,
      totalGain,
      totalDays,
      totalAdg,
      yMin: Math.max(0, minW),
      yMax: maxW,
      count: sortedRecords.length,
    };
  }, [sortedRecords]);

  if (!stats || sortedRecords.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
        <Scale className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-600">Belum ada riwayat penimbangan tersimpan.</p>
        {onOpenAddWeight && (
          <button
            type="button"
            onClick={onOpenAddWeight}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mulai Penimbangan Pertama</span>
          </button>
        )}
      </div>
    );
  }

  // Jika hanya ada 1 data (penimbangan baseline awal)
  const isSingleRecord = sortedRecords.length === 1;

  // Custom Tooltip Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-[240px]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1 font-mono text-[11px] text-slate-300">
            <span>{data.rawTanggal}</span>
            <span className="font-bold text-amber-400">Timbang #{data.id + 1}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400">Bobot Badan:</span>
            <span className="font-black text-white text-base">{data.bobot} kg</span>
          </div>
          {data.id > 0 && (
            <>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Selisih Kenaikan:</span>
                <span className={`font-bold ${data.diffPrevKg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.diffPrevKg > 0 ? `+${data.diffPrevKg}` : data.diffPrevKg} kg ({data.daysFromPrev} hr)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Laju PBBH / ADG:</span>
                <span className={`font-bold ${data.adgGram >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.adgGram > 0 ? `+${data.adgGram}` : data.adgGram} g/hari
                </span>
              </div>
            </>
          )}
          {data.lingkarDada && (
            <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5 border-t border-slate-800">
              <span>Lingkar Dada (LD):</span>
              <span className="font-semibold">{data.lingkarDada} cm</span>
            </div>
          )}
          {data.pakan && (
            <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800 leading-tight">
              Pakan: {data.pakan}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header Visualisasi Grafik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm sm:text-base">
                Grafik Tren Kenaikan Bobot Badan
              </h4>
              <p className="text-[11px] text-slate-500">
                Visualisasi dinamika pertumbuhan berkala & laju pertambahan bobot harian (ADG)
              </p>
            </div>
          </div>
        </div>

        {/* Action / Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {sortedRecords.length >= 2 && (
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setChartMode('bobot')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMode === 'bobot'
                    ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kurva Bobot (kg)
              </button>
              <button
                type="button"
                onClick={() => setChartMode('adg')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMode === 'adg'
                    ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Laju ADG (g/hr)
              </button>
            </div>
          )}

          {onOpenAddWeight && (
            <button
              type="button"
              onClick={onOpenAddWeight}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-xl flex items-center gap-1 shadow-2xs transition-colors"
              title="Input Penimbangan Baru"
            >
              <Plus className="w-3 h-3" />
              <span>+ Timbang</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bobot Awal</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-black text-slate-800 text-sm sm:text-base">{stats.initialWeight}</span>
            <span className="text-slate-500 text-[10px]">kg</span>
          </div>
          <span className="text-[9px] text-slate-400 block truncate">{sortedRecords[0].tanggal}</span>
        </div>

        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bobot Terkini</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-black text-emerald-800 text-sm sm:text-base">{stats.currentWeight}</span>
            <span className="text-slate-500 text-[10px]">kg</span>
          </div>
          <span className="text-[9px] text-slate-400 block truncate">
            {sortedRecords[sortedRecords.length - 1].tanggal}
          </span>
        </div>

        <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Total Kenaikan</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-black text-emerald-900 text-sm sm:text-base">
              {stats.totalGain > 0 ? `+${stats.totalGain}` : stats.totalGain}
            </span>
            <span className="text-emerald-700 text-[10px]">kg</span>
          </div>
          <span className="text-[9px] text-emerald-700 block">
            {stats.totalDays > 0 ? `dalam ${stats.totalDays} hari` : `${stats.count}x penimbangan`}
          </span>
        </div>

        <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
          <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">Rerata PBBH (ADG)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-black text-amber-950 text-sm sm:text-base">
              {stats.totalAdg > 0 ? `+${stats.totalAdg}` : stats.totalAdg}
            </span>
            <span className="text-amber-800 text-[10px]">g / hari</span>
          </div>
          <span className="text-[9px] text-amber-700 block">
            {stats.totalAdg >= 120
              ? 'Pertumbuhan Cepat'
              : stats.totalAdg >= 70
              ? 'Pertumbuhan Standar'
              : 'Perlu Tambah Konsentrat'}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-56 sm:h-64 pt-2 min-w-0">
        {isSingleRecord ? (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-2">
              <Scale className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-slate-800 text-xs sm:text-sm">
              Tercatat 1 Data Bobot Baseline ({stats.currentWeight} kg)
            </h5>
            <p className="text-[11px] text-slate-500 max-w-sm mt-1 leading-relaxed">
              Kambing ini baru memiliki 1 data penimbangan awal ({sortedRecords[0].tanggal}). Tambahkan minimal 1 kali penimbangan berkala lagi untuk menggambar garis kurva pertumbuhan dan laju ADG.
            </p>
            {onOpenAddWeight && (
              <button
                type="button"
                onClick={onOpenAddWeight}
                className="mt-3 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Hasil Penimbangan Ke-2</span>
              </button>
            )}
          </div>
        ) : chartMode === 'bobot' ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="tanggalLabel"
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[stats.yMin, stats.yMax]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit=" kg"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={stats.initialWeight}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{ value: `Awal: ${stats.initialWeight}kg`, position: 'insideTopLeft', fill: '#94a3b8', fontSize: 9 }}
              />
              <Area
                type="monotone"
                dataKey="bobot"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorWeight)"
                activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
                dot={{ r: 4, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <LineChart data={chartData.slice(1)} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="tanggalLabel"
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit=" g"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={100}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{ value: 'Target ADG 100g/hr', position: 'insideTopRight', fill: '#d97706', fontSize: 9 }}
              />
              <Line
                type="monotone"
                dataKey="adgGram"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#b45309', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insight Footer */}
      {!isSingleRecord && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1 text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Korelasi pertumbuhan normal kambing {bangsaTernak} ({jenisKelamin})</span>
          </span>
          <span className="font-mono text-slate-400">
            Total {stats.count} titik timbang
          </span>
        </div>
      )}
    </div>
  );
};
