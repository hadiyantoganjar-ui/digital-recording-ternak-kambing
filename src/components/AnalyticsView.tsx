import React, { useState, useMemo } from 'react';
import { GoatRecord, JenisKelamin, UmurKategori } from '../types';
import { 
  BarChart3, 
  Scale, 
  Users, 
  HeartPulse, 
  Wheat, 
  TrendingUp, 
  MapPin, 
  Activity,
  CheckCircle2,
  AlertCircle,
  Coins,
  BookOpen,
  Sparkles,
  Calculator,
  Sliders,
  DollarSign,
  Info
} from 'lucide-react';
import { 
  MODEL_NUTRISI_ADG, 
  HARGA_PASAR_LAMPUNG, 
  hitungPrediksiHargaKambing, 
  formatRupiah 
} from '../utils/livestockScience';

interface AnalyticsViewProps {
  goats: GoatRecord[];
  onFilterByBangsa?: (bangsa: string) => void;
  onFilterByPeternak?: (peternak: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  goats,
  onFilterByBangsa,
  onFilterByPeternak,
}) => {
  const total = goats.length;

  // Interactive Simulator State for Price & Nutrition Prediction
  const [simBobot, setSimBobot] = useState<number>(30);
  const [simKelamin, setSimKelamin] = useState<JenisKelamin>('Jantan');
  const [simBangsa, setSimBangsa] = useState<string>('Kambing Saburai');
  const [simUmur, setSimUmur] = useState<UmurKategori>('I1');

  // Interactive Calculator output
  const simResult = useMemo(() => {
    return hitungPrediksiHargaKambing(simBobot, simKelamin, simBangsa, simUmur);
  }, [simBobot, simKelamin, simBangsa, simUmur]);

  // 1. Valuasi Total Populasi Ternak di Lampung
  const marketValuation = useMemo(() => {
    let totalValuation = 0;
    const categoryCount: Record<string, number> = {
      'Kurban Super/Premium': 0,
      'Kurban Standar': 0,
      'Akikah Standar': 0,
      'Bibit/Bakalan': 0,
    };

    goats.forEach((g) => {
      const pred = hitungPrediksiHargaKambing(g.bobotBadan, g.jenisKelamin, g.bangsaTernak, g.umur);
      totalValuation += pred.estimasiHargaTotal;
      if (categoryCount[pred.kategoriPasar] !== undefined) {
        categoryCount[pred.kategoriPasar]++;
      } else {
        categoryCount['Bibit/Bakalan']++;
      }
    });

    const avgPrice = total > 0 ? Math.round(totalValuation / total) : 0;

    return {
      totalValuation,
      avgPrice,
      categoryCount,
    };
  }, [goats, total]);

  // 2. Bangsa stats
  const bangsaStats = useMemo(() => {
    const map: Record<string, { count: number; totalBobot: number; jantan: number; betina: number }> = {};
    goats.forEach((g) => {
      const b = g.bangsaTernak || 'Lainnya';
      if (!map[b]) {
        map[b] = { count: 0, totalBobot: 0, jantan: 0, betina: 0 };
      }
      map[b].count++;
      map[b].totalBobot += g.bobotBadan || 0;
      if (g.jenisKelamin === 'Jantan') map[b].jantan++;
      else map[b].betina++;
    });

    return Object.entries(map)
      .map(([bangsa, stat]) => ({
        bangsa,
        count: stat.count,
        percent: Math.round((stat.count / total) * 100),
        avgBobot: Math.round((stat.totalBobot / stat.count) * 10) / 10,
        jantan: stat.jantan,
        betina: stat.betina,
      }))
      .sort((a, b) => b.count - a.count);
  }, [goats, total]);

  // 3. Umur & Bobot stats
  const umurStats = useMemo(() => {
    const order = ['I0', 'I1', 'I2', 'I3', 'I4'];
    const map: Record<string, { count: number; totalBobot: number; jantan: number; betina: number }> = {
      I0: { count: 0, totalBobot: 0, jantan: 0, betina: 0 },
      I1: { count: 0, totalBobot: 0, jantan: 0, betina: 0 },
      I2: { count: 0, totalBobot: 0, jantan: 0, betina: 0 },
      I3: { count: 0, totalBobot: 0, jantan: 0, betina: 0 },
      I4: { count: 0, totalBobot: 0, jantan: 0, betina: 0 },
    };

    goats.forEach((g) => {
      const u = g.umur in map ? g.umur : 'I0';
      map[u].count++;
      map[u].totalBobot += g.bobotBadan || 0;
      if (g.jenisKelamin === 'Jantan') map[u].jantan++;
      else map[u].betina++;
    });

    return order.map((u) => {
      const stat = map[u];
      return {
        umur: u,
        label: 
          u === 'I0' ? 'I0 (< 1 th / Gigi Susu)' :
          u === 'I1' ? 'I1 (1-1.5 th / Poel 1 pasang)' :
          u === 'I2' ? 'I2 (1.5-2 th / Poel 2 pasang)' :
          u === 'I3' ? 'I3 (2-3 th / Poel 3 pasang)' :
          'I4 (> 3 th / Poel Rata)',
        count: stat.count,
        percent: total > 0 ? Math.round((stat.count / total) * 100) : 0,
        avgBobot: stat.count > 0 ? Math.round((stat.totalBobot / stat.count) * 10) / 10 : 0,
      };
    });
  }, [goats, total]);

  // 4. Peternak Leaderboard
  const peternakStats = useMemo(() => {
    const map: Record<string, { count: number; lokasi: string; totalBobot: number }> = {};
    goats.forEach((g) => {
      const p = g.namaPeternak.trim() || 'Peternak';
      if (!map[p]) {
        map[p] = { count: 0, lokasi: g.lokasi, totalBobot: 0 };
      }
      map[p].count++;
      map[p].totalBobot += g.bobotBadan || 0;
    });

    return Object.entries(map)
      .map(([nama, stat]) => ({
        nama,
        lokasi: stat.lokasi,
        count: stat.count,
        avgBobot: Math.round((stat.totalBobot / stat.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  }, [goats]);

  // 5. Health Summary
  const healthStats = useMemo(() => {
    const cases: Array<{ goat: GoatRecord; penyakit: string; obat: string; tanggal: string; kondisi: string }> = [];
    goats.forEach((g) => {
      if (g.riwayatKesehatan && g.riwayatKesehatan.length > 0) {
        g.riwayatKesehatan.forEach((med) => {
          if (med.jenisPenyakit && !med.jenisPenyakit.toLowerCase().includes('rutin')) {
            cases.push({
              goat: g,
              penyakit: med.jenisPenyakit,
              obat: med.pengobatanDiberikan,
              tanggal: med.tanggalPemeriksaan,
              kondisi: med.kondisiSaatIni || 'Dalam Perawatan',
            });
          }
        });
      }
    });
    return cases;
  }, [goats]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Total Valuasi Populasi & Aset Ternak */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-emerald-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                Valuasi Pasar Hewan Lampung
              </span>
              <span className="text-xs text-emerald-300 font-mono">
                {HARGA_PASAR_LAMPUNG.tanggalUpdate}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Total Estimasi Aset: {formatRupiah(marketValuation.totalValuation)}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              Dihitung berdasarkan model regresi korelasi bobot badan (r ≈ 0.82) dan harga timbang hidup rata-rata di Pasar Hewan Sukanegara & Sukoharjo Lampung.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-emerald-200 font-medium block">Rata-rata / Ekor</span>
              <span className="text-sm sm:text-base font-black text-amber-300">
                {formatRupiah(marketValuation.avgPrice)}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-emerald-200 font-medium block">Kurban Super</span>
              <span className="text-base sm:text-lg font-black text-white">
                {marketValuation.categoryCount['Kurban Super/Premium']} ekor
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-emerald-200 font-medium block">Kurban Standar</span>
              <span className="text-base sm:text-lg font-black text-white">
                {marketValuation.categoryCount['Kurban Standar']} ekor
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-emerald-200 font-medium block">Akikah / Bakalan</span>
              <span className="text-base sm:text-lg font-black text-white">
                {marketValuation.categoryCount['Akikah Standar'] + marketValuation.categoryCount['Bibit/Bakalan']} ekor
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Scientific Literature on Nutrition (Hijauan vs Konsentrat) & ADG */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                Hubungan Nutrisi Hijauan & Konsentrat Terhadap PBBH (ADG)
              </h3>
              <p className="text-xs text-slate-500">
                Berdasarkan data literatur ilmiah terpublikasi (Unila Fapet Lampung, Balitnak Bogor, & JITV)
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            Metode Ilmiah Terverifikasi
          </span>
        </div>

        {/* 4 Literature Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {MODEL_NUTRISI_ADG.map((m, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                idx === 2 
                  ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400/20' 
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Model #{idx + 1}
                  </span>
                  {idx === 2 && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                      Rekomendasi Unila
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-slate-900 text-xs leading-snug">
                  {m.kategoriRansum}
                </h4>

                {/* Progress bar Hijauan vs Konsentrat */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                    <span>Hijauan: {m.persentaseHijauan}%</span>
                    <span>Konsentrat: {m.persentaseKonsentrat}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full" 
                      style={{ width: `${m.persentaseHijauan}%` }} 
                      title={`Hijauan ${m.persentaseHijauan}%`}
                    />
                    <div 
                      className="bg-amber-500 h-full" 
                      style={{ width: `${m.persentaseKonsentrat}%` }} 
                      title={`Konsentrat ${m.persentaseKonsentrat}%`}
                    />
                  </div>
                </div>

                {/* Nutrients & PBBH */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-center">
                  <div className="p-1.5 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[9px] text-slate-400 block font-medium">Protein Kasar (PK)</span>
                    <span className="font-bold text-slate-800 text-xs">{m.estimasiProteinKasar}%</span>
                  </div>
                  <div className="p-1.5 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[9px] text-slate-400 block font-medium">TDN (Energi)</span>
                    <span className="font-bold text-slate-800 text-xs">{m.estimasiTDN}%</span>
                  </div>
                </div>

                {/* PBBH Highlight */}
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">Laju Pertumbuhan (ADG)</span>
                  <span className="font-black text-sm text-emerald-800">
                    +{m.kisaranAdgGramPerHari[0]} - {m.kisaranAdgGramPerHari[1]} g/hari
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    FCR perkiraan: ~{m.rasioKonversiPakan}
                  </span>
                </div>
              </div>

              {/* Scientific reference note */}
              <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-200/70 italic leading-relaxed">
                {m.referensiIlmiah}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex items-start gap-2 text-xs text-amber-950">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Kesimpulan Ilmiah:</strong> Pemberian konsentrat penguat 30% pada ransum hijauan mampu melipatgandakan PBBH dari <strong>~35 g/hari menjadi &gt; 110 g/hari</strong> pada kambing persilangan di Lampung (Saburai &amp; Boerawa). Pada peternak rakyat yang hanya mengandalkan rumput lapangan tanpa konsentrat atau legum, ternak cenderung mengalami defisit energi dan protein.
          </p>
        </div>
      </div>

      {/* SECTION 2: Simulator Prediksi Bobot Badan & Harga Jual Ternak (Regresi Ilmiah) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Simulator Box (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Simulator Prediksi Harga Jual di Lampung
                </h3>
                <p className="text-xs text-slate-500">
                  Model Regresi Ilmiah (r = 0.82) Bobot Badan terhadap Nilai Pasar Ternak
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Interaktif
            </span>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Slider Bobot */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="font-bold text-slate-800 text-xs">
                  Bobot Badan Ternak (kg)
                </label>
                <span className="font-black text-2xl text-emerald-800">
                  {simBobot} <span className="text-sm font-semibold text-slate-500">kg</span>
                </span>
              </div>
              <input 
                type="range" 
                min="12" 
                max="65" 
                step="0.5"
                value={simBobot} 
                onChange={(e) => setSimBobot(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>12 kg (Cempe/Bakalan)</span>
                <span>30 kg (Standar Qurban)</span>
                <span>65 kg (Pejantan Super)</span>
              </div>
            </div>

            {/* Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Jenis Kelamin */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kelamin</label>
                <select
                  value={simKelamin}
                  onChange={(e) => setSimKelamin(e.target.value as JenisKelamin)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Jantan">Jantan (Favorit Kurban/Akikah)</option>
                  <option value="Betina">Betina (Induk / Bibit)</option>
                </select>
              </div>

              {/* Bangsa */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bangsa Ternak</label>
                <select
                  value={simBangsa}
                  onChange={(e) => setSimBangsa(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Boer">Kambing Boer Murni</option>
                  <option value="Kambing Saburai">Kambing Saburai (Lampung)</option>
                  <option value="Boer Cross">Boer Cross / Boerawa</option>
                  <option value="Peranakan Etawah (PE)">Peranakan Etawah (PE)</option>
                  <option value="Jawa Randu">Jawa Randu / Rambon</option>
                  <option value="Kambing Kacang">Kambing Kacang Lokal</option>
                </select>
              </div>

              {/* Umur Gigi */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Umur Gigi (Poel)</label>
                <select
                  value={simUmur}
                  onChange={(e) => setSimUmur(e.target.value as UmurKategori)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="I0">I0 (&lt; 1 th / Gigi Susu)</option>
                  <option value="I1">I1 (1-1.5 th / Poel 1 pasang - Sah Qurban)</option>
                  <option value="I2">I2 (1.5-2 th / Poel 2 pasang)</option>
                  <option value="I3">I3 (2-3 th / Poel 3 pasang)</option>
                  <option value="I4">I4 (&gt; 3 th / Poel Rata)</option>
                </select>
              </div>
            </div>

            {/* Hasil Prediksi Box */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs">
                  Hasil Estimasi Nilai Jual di Pasar Lampung
                </span>
                <span className="text-xs font-bold text-white bg-emerald-700 px-3 py-0.5 rounded-full shadow-2xs">
                  {simResult.kategoriPasar}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Estimasi Harga Jual</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-900">
                    {formatRupiah(simResult.estimasiHargaTotal)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Rentang Tawar Menawar</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatRupiah(simResult.rangeHargaMin)} - {formatRupiah(simResult.rangeHargaMax)}
                  </span>
                </div>
              </div>

              {/* Rincian Formula Faktor */}
              <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-600 bg-white/80 p-2 rounded-xl border border-emerald-100 text-center">
                <div>Dasar: <strong>~{formatRupiah(simResult.hargaDasarPerKg)}/kg</strong></div>
                <div>Faktor Sex: <strong>{simResult.faktorKelamin}x</strong></div>
                <div>Faktor Bangsa: <strong>{simResult.faktorBangsa}x</strong></div>
                <div>Kelayakan: <strong>{simResult.faktorKelayakan}x</strong></div>
              </div>
            </div>

          </div>
        </div>

        {/* Data Gambaran Harga Pasar Lampung (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Gambaran Harga Pasar Hewan Lampung
              </h3>
              <p className="text-xs text-slate-500">
                Data lapangan: Sukanegara, Sukoharjo, Tanggamus
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Live weight per kg */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-800 block text-[11px]">
                ⚖️ Acuan Timbang Hidup per Kg (Live Weight)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Jantan Kurban/Aqiqah</span>
                  <span className="font-black text-emerald-800">Rp 80.000 - Rp 95.000</span>
                  <span className="text-[9px] text-slate-400 block">per kg bobot hidup</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Betina / Indukan</span>
                  <span className="font-black text-slate-800">Rp 65.000 - Rp 75.000</span>
                  <span className="text-[9px] text-slate-400 block">per kg bobot hidup</span>
                </div>
              </div>
            </div>

            {/* Per head market classes */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block text-[11px]">
                🏷️ Acuan Harga Jogrogan Per Ekor
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {HARGA_PASAR_LAMPUNG.hargaJogroganPerEkor.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{item.kategori}</div>
                      <div className="text-[10px] text-slate-500">Bobot {item.bobotRentang}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-emerald-800 text-xs">{item.kisaranHarga}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: Populasi Demografi & Bangsa Ternak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Bangsa Ternak Breakdown */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Distribusi Bangsa Ternak
                </h3>
                <p className="text-xs text-slate-500">Komposisi ras dan rata-rata bobot</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">{bangsaStats.length} Bangsa</span>
          </div>

          <div className="space-y-3">
            {bangsaStats.map((item) => (
              <div 
                key={item.bangsa}
                onClick={() => onFilterByBangsa && onFilterByBangsa(item.bangsa)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900">{item.bangsa}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-800">{item.count} ekor</span>
                    <span className="text-slate-400">({item.percent}%)</span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Rata-rata Bobot: <strong className="text-slate-800">{item.avgBobot} kg</strong></span>
                  <span className="flex items-center gap-1 font-mono">
                    <span className="text-sky-700">♂ {item.jantan}</span>
                    <span>•</span>
                    <span className="text-rose-700">♀ {item.betina}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Umur Gigi (Dental Age) & Kelayakan Kurban */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Struktur Umur Gigi (Poel)
                </h3>
                <p className="text-xs text-slate-500">Kelompok umur dan kesiapan kurban / bibit</p>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              Gigi Seri
            </span>
          </div>

          <div className="space-y-3">
            {umurStats.map((item) => (
              <div key={item.umur} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                      {item.umur}
                    </span>
                    <span className="font-semibold text-slate-800">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.count} ekor</span>
                </div>

                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-600 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Porsi Populasi: {item.percent}%</span>
                  <span>Rerata Bobot: <strong className="text-slate-800">{item.avgBobot} kg</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 4: Peternak & Kesehatan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Leaderboard Peternak */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Kepemilikan Peternak
                </h3>
                <p className="text-xs text-slate-500">Distribusi ternak terdata per peternak</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500">{peternakStats.length} Peternak</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {peternakStats.map((p, idx) => (
              <div 
                key={p.nama}
                onClick={() => onFilterByPeternak && onFilterByPeternak(p.nama)}
                className="p-3 bg-slate-50 hover:bg-amber-50/60 rounded-2xl border border-slate-200 flex items-center justify-between transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{p.nama}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{p.lokasi}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-slate-900">{p.count} ekor</div>
                  <div className="text-[10px] text-slate-400">Rerata {p.avgBobot} kg</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kasus Kesehatan Terakhir */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Monitoring Rekam Medis & Kesehatan
                </h3>
                <p className="text-xs text-slate-500">Kasus penyakit ternak dan riwayat obat</p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
              {healthStats.length} Kasus Tercatat
            </span>
          </div>

          {healthStats.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">Kondisi Koloni Baik</p>
              <p className="text-[11px]">Belum ada laporan penyakit aktif.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {healthStats.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      {c.penyakit}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{c.tanggal}</span>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-slate-200/80 text-[11px] text-slate-700">
                    <strong className="text-slate-900 font-semibold block text-[10px] text-slate-400 uppercase">Pengobatan:</strong>
                    {c.obat}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Eartag #{c.goat.nomorEartag} ({c.goat.namaPeternak})</span>
                    <span className="font-bold text-emerald-700">Kondisi: {c.kondisi}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
