import React, { useState, useMemo } from 'react';
import { GoatRecord, FilterOptions } from '../types';
import { 
  Search, 
  Filter, 
  Radio, 
  ChevronRight, 
  Scale, 
  HeartPulse, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Wheat,
  Copy,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  Coins,
  Plus
} from 'lucide-react';
import { 
  hitungAdgAntarTimbang, 
  hitungPrediksiHargaKambing, 
  formatRupiah 
} from '../utils/livestockScience';

interface GoatTableProps {
  goats: GoatRecord[];
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onSelectGoat: (goat: GoatRecord) => void;
  onEditGoat: (goat: GoatRecord) => void;
  onDeleteGoat: (id: string) => void;
  onOpenQuickWeight: (goat: GoatRecord) => void;
  onOpenQuickHealth: (goat: GoatRecord) => void;
  onOpenFeedRecord?: (goat: GoatRecord) => void;
}

export const GoatTable: React.FC<GoatTableProps> = ({
  goats,
  filterOptions,
  setFilterOptions,
  onSelectGoat,
  onEditGoat,
  onDeleteGoat,
  onOpenQuickWeight,
  onOpenQuickHealth,
  onOpenFeedRecord,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique filter lists
  const bangsaList = useMemo(() => {
    return Array.from(new Set(goats.map((g) => g.bangsaTernak).filter(Boolean))).sort();
  }, [goats]);

  const peternakList = useMemo(() => {
    return Array.from(new Set(goats.map((g) => g.namaPeternak.trim()).filter(Boolean))).sort();
  }, [goats]);

  const lokasiList = useMemo(() => {
    return Array.from(new Set(goats.map((g) => g.lokasi.trim()).filter(Boolean))).sort();
  }, [goats]);

  // Filter logic
  const filteredGoats = useMemo(() => {
    return goats.filter((goat) => {
      // Search query
      if (filterOptions.searchQuery) {
        const query = filterOptions.searchQuery.toLowerCase().trim();
        const matchRfid = goat.nomorRfid.toLowerCase().includes(query);
        const matchEartag = goat.nomorEartag.toLowerCase().includes(query);
        const matchPeternak = goat.namaPeternak.toLowerCase().includes(query);
        const matchBangsa = goat.bangsaTernak.toLowerCase().includes(query);
        const matchLokasi = goat.lokasi.toLowerCase().includes(query);
        if (!matchRfid && !matchEartag && !matchPeternak && !matchBangsa && !matchLokasi) {
          return false;
        }
      }

      // Bangsa filter
      if (filterOptions.bangsa && goat.bangsaTernak !== filterOptions.bangsa) {
        return false;
      }

      // Kelamin filter
      if (filterOptions.jenisKelamin && goat.jenisKelamin !== filterOptions.jenisKelamin) {
        return false;
      }

      // Umur filter
      if (filterOptions.umur && goat.umur !== filterOptions.umur) {
        return false;
      }

      // Status Kesehatan filter
      if (filterOptions.statusKesehatan && goat.statusKesehatan !== filterOptions.statusKesehatan) {
        return false;
      }

      // Lokasi filter
      if (filterOptions.lokasi && goat.lokasi !== filterOptions.lokasi) {
        return false;
      }

      // Peternak filter
      if (filterOptions.peternak && goat.namaPeternak !== filterOptions.peternak) {
        return false;
      }

      return true;
    });
  }, [goats, filterOptions]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredGoats.length / itemsPerPage) || 1;
  const paginatedGoats = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGoats.slice(start, start + itemsPerPage);
  }, [filteredGoats, currentPage, itemsPerPage]);

  const copyRfid = (rfid: string) => {
    navigator.clipboard.writeText(rfid);
    setCopiedId(rfid);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const resetFilters = () => {
    setFilterOptions({
      searchQuery: '',
      peternak: '',
      lokasi: '',
      bangsa: '',
      jenisKelamin: '',
      umur: '',
      statusKesehatan: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    filterOptions.searchQuery || 
    filterOptions.peternak || 
    filterOptions.lokasi || 
    filterOptions.bangsa || 
    filterOptions.jenisKelamin || 
    filterOptions.umur || 
    filterOptions.statusKesehatan;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              value={filterOptions.searchQuery}
              onChange={(e) => {
                setFilterOptions((prev) => ({ ...prev, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Cari RFID, Eartag, Nama Peternak, Lokasi..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {filterOptions.searchQuery && (
              <button
                onClick={() => setFilterOptions((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Counts and reset */}
          <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-slate-600">
            <span>
              Menampilkan <strong className="text-slate-900 font-bold">{filteredGoats.length}</strong> dari {goats.length} ekor
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdown Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {/* Bangsa */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Bangsa</label>
            <select
              value={filterOptions.bangsa}
              onChange={(e) => {
                setFilterOptions((prev) => ({ ...prev, bangsa: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">Semua Bangsa</option>
              {bangsaList.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Kelamin */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Kelamin</label>
            <select
              value={filterOptions.jenisKelamin}
              onChange={(e) => {
                setFilterOptions((prev) => ({ ...prev, jenisKelamin: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">Semua Kelamin</option>
              <option value="Jantan">Jantan</option>
              <option value="Betina">Betina</option>
            </select>
          </div>

          {/* Umur */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Umur (Gigi)</label>
            <select
              value={filterOptions.umur}
              onChange={(e) => {
                setFilterOptions((prev) => ({ ...prev, umur: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">Semua Umur</option>
              <option value="I0">I0 (&lt; 1 th / Gigi Susu)</option>
              <option value="I1">I1 (1-1.5 th / Poel 1 pasang)</option>
              <option value="I2">I2 (1.5-2 th / Poel 2 pasang)</option>
              <option value="I3">I3 (2-3 th / Poel 3 pasang)</option>
              <option value="I4">I4 (&gt; 3 th / Poel Rata)</option>
            </select>
          </div>

          {/* Kesehatan */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Kesehatan</label>
            <select
              value={filterOptions.statusKesehatan}
              onChange={(e) => {
                setFilterOptions((prev) => ({ ...prev, statusKesehatan: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">Semua Kondisi</option>
              <option value="Sehat">Sehat</option>
              <option value="Dalam Perawatan">Dalam Perawatan</option>
              <option value="Sakit">Sakit</option>
            </select>
          </div>

          {/* Lokasi */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Lokasi</label>
            <select
              value={filterOptions.lokasi}
              onChange={(e) => {
                setFilterOptions((prev) => ({ ...prev, lokasi: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">Semua Lokasi</option>
              {lokasiList.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Peternak */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Peternak</label>
            <select
              value={filterOptions.peternak}
              onChange={(e) => {
                setFilterOptions((prev) => ({ ...prev, peternak: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">Semua Peternak</option>
              {peternakList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <th className="py-3 px-4">Identitas & RFID</th>
              <th className="py-3 px-3">Bangsa & Kelamin</th>
              <th className="py-3 px-3">Umur Gigi</th>
              <th className="py-3 px-3">Penimbangan Berkala & ADG</th>
              <th className="py-3 px-3">Prediksi Harga (Lampung)</th>
              <th className="py-3 px-3">Peternak & Lokasi</th>
              <th className="py-3 px-3">Pakan Diberikan</th>
              <th className="py-3 px-3">Status Kesehatan</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedGoats.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Radio className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">Tidak ada data ternak yang cocok</p>
                    <button
                      onClick={resetFilters}
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      Bersihkan filter pencarian
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedGoats.map((goat) => {
                const lastHealth = goat.riwayatKesehatan && goat.riwayatKesehatan.length > 0
                  ? goat.riwayatKesehatan[goat.riwayatKesehatan.length - 1]
                  : null;

                // Hitung ADG antara 2 penimbangan terakhir jika ada
                let latestAdg: { adgGramPerHari: number; selisihHari: number; selisihKg: number } | null = null;
                if (goat.riwayatBobot && goat.riwayatBobot.length >= 2) {
                  const sorted = [...goat.riwayatBobot].sort(
                    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
                  );
                  const pen1 = sorted[sorted.length - 2];
                  const pen2 = sorted[sorted.length - 1];
                  latestAdg = hitungAdgAntarTimbang(pen2.bobot, pen2.tanggal, pen1.bobot, pen1.tanggal);
                }

                // Prediksi Harga Jual di Lampung
                const prediksiHarga = hitungPrediksiHargaKambing(
                  goat.bobotBadan,
                  goat.jenisKelamin,
                  goat.bangsaTernak,
                  goat.umur
                );

                return (
                  <tr 
                    key={goat.id} 
                    className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectGoat(goat)}
                  >
                    {/* RFID & Eartag */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          #{goat.nomorEartag}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            Eartag: {goat.nomorEartag}
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                            <span>{goat.nomorRfid}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyRfid(goat.nomorRfid);
                              }}
                              className="text-slate-400 hover:text-emerald-600 p-0.5 rounded"
                              title="Salin Nomor RFID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === goat.nomorRfid && (
                              <span className="text-[10px] text-emerald-600 font-sans font-bold">Disalin</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Bangsa & Kelamin */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{goat.bangsaTernak}</div>
                      <span className={`inline-block px-1.5 py-0.2 rounded font-bold text-[10px] mt-0.5 ${
                        goat.jenisKelamin === 'Jantan'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {goat.jenisKelamin}
                      </span>
                    </td>

                    {/* Umur */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 font-mono text-xs font-bold" title={`Kategori gigi seri: ${goat.umur}`}>
                        {goat.umur}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {goat.umur === 'I0' && '< 1 th'}
                        {goat.umur === 'I1' && '1-1.5 th'}
                        {goat.umur === 'I2' && '1.5-2 th'}
                        {goat.umur === 'I3' && '2-3 th'}
                        {goat.umur === 'I4' && '> 3 th'}
                      </div>
                    </td>

                    {/* Penimbangan Berkala & ADG */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-slate-900 text-sm">{goat.bobotBadan}</span>
                            <span className="text-slate-500 text-[10px]">kg</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {goat.riwayatBobot?.length || 1}x catat
                          </div>
                        </div>

                        {/* Direct periodic weigh button */}
                        <button
                          type="button"
                          onClick={() => onOpenQuickWeight(goat)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                          title="Tambah Hasil Penimbangan Baru"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Timbang</span>
                        </button>
                      </div>

                      {/* ADG Indicator if recorded */}
                      {latestAdg ? (
                        <div className="mt-1 flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            latestAdg.adgGramPerHari > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            PBBH: {latestAdg.adgGramPerHari > 0 ? `+${latestAdg.adgGramPerHari}` : latestAdg.adgGramPerHari} g/hr
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 mt-0.5 italic">
                          Baseline awal
                        </div>
                      )}
                    </td>

                    {/* Prediksi Harga (Lampung) */}
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                        {formatRupiah(prediksiHarga.estimasiHargaTotal)}
                      </div>
                      <span className="inline-block text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                        {prediksiHarga.kategoriPasar}
                      </span>
                    </td>

                    {/* Peternak & Lokasi */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{goat.namaPeternak}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span>{goat.lokasi}</span>
                      </div>
                    </td>

                    {/* Pakan */}
                    <td className="py-3 px-3 max-w-[150px]">
                      <div className="flex items-center justify-between gap-1">
                        <div className="truncate">
                          <div className="text-[11px] text-slate-700 font-medium truncate" title={goat.pakan?.komposisiPakan || goat.pakan?.jenisPakan}>
                            {goat.pakan?.jenisPakan || 'Hijauan Segar'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {goat.riwayatPakanHarian && goat.riwayatPakanHarian.length > 0
                              ? `${goat.riwayatPakanHarian.length}x log pakan`
                              : (goat.pakan?.frekuensiPemberian || '2x Sehari')}
                          </div>
                        </div>
                        {onOpenFeedRecord && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenFeedRecord(goat);
                            }}
                            className="p-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex-shrink-0"
                            title="Catat Pakan Harian Terperinci"
                          >
                            <Wheat className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status Kesehatan */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          goat.statusKesehatan === 'Sehat'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {goat.statusKesehatan === 'Sehat' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          {goat.statusKesehatan}
                        </span>
                      </div>
                      {lastHealth && lastHealth.jenisPenyakit && (
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]" title={`${lastHealth.jenisPenyakit}: ${lastHealth.pengobatanDiberikan}`}>
                          {lastHealth.jenisPenyakit}
                        </div>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenQuickHealth(goat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Catat Rekam Medis"
                        >
                          <HeartPulse className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditGoat(goat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Edit Data Ternak"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectGoat(goat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Lihat Detail Profil"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Optimized for Smartphone) */}
      <div className="md:hidden divide-y divide-slate-100">
        {paginatedGoats.length === 0 ? (
          <div className="py-12 text-center text-slate-400 p-4">
            <p className="text-sm font-semibold text-slate-600">Tidak ada data ditemukan</p>
            <button onClick={resetFilters} className="text-xs text-emerald-600 mt-2 underline">
              Reset filter
            </button>
          </div>
        ) : (
          paginatedGoats.map((goat) => {
            const prediksiHarga = hitungPrediksiHargaKambing(
              goat.bobotBadan,
              goat.jenisKelamin,
              goat.bangsaTernak,
              goat.umur
            );

            let latestAdg: { adgGramPerHari: number; selisihHari: number; selisihKg: number } | null = null;
            if (goat.riwayatBobot && goat.riwayatBobot.length >= 2) {
              const sorted = [...goat.riwayatBobot].sort(
                (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
              );
              const pen1 = sorted[sorted.length - 2];
              const pen2 = sorted[sorted.length - 1];
              latestAdg = hitungAdgAntarTimbang(pen2.bobot, pen2.tanggal, pen1.bobot, pen1.tanggal);
            }

            return (
              <div
                key={goat.id}
                onClick={() => onSelectGoat(goat)}
                className="p-3.5 active:bg-slate-50 transition-colors flex flex-col gap-2.5"
              >
                {/* Header Line */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
                      #{goat.nomorEartag}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          {goat.bangsaTernak}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          goat.jenisKelamin === 'Jantan'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {goat.jenisKelamin}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        RFID: {goat.nomorRfid}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-slate-900 text-base">
                      {goat.bobotBadan} kg
                    </div>
                    <div className="text-xs font-bold text-emerald-800">
                      {formatRupiah(prediksiHarga.estimasiHargaTotal)}
                    </div>
                  </div>
                </div>

                {/* Detail meta */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">PETERNAK & LOKASI</span>
                    <span className="font-semibold text-slate-800 truncate block">{goat.namaPeternak}</span>
                    <span className="text-[11px] text-slate-500">{goat.lokasi}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">UMUR & ADG TERAKHIR</span>
                    <span className="font-bold text-slate-800">{goat.umur}</span>
                    {latestAdg ? (
                      <span className="text-[11px] text-emerald-700 font-bold block">
                        PBBH: +{latestAdg.adgGramPerHari} g/hr
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block">1x timbang</span>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                  <div className="text-[11px] text-emerald-800 font-medium truncate max-w-[160px]">
                    🏷️ {prediksiHarga.kategoriPasar}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onOpenFeedRecord && (
                      <button
                        type="button"
                        onClick={() => onOpenFeedRecord(goat)}
                        className="px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1"
                        title="Catat Pakan Harian"
                      >
                        <Wheat className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Pakan</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenQuickWeight(goat)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>+ Timbang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenQuickHealth(goat)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-800 font-semibold text-xs flex items-center gap-1"
                    >
                      <HeartPulse className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectGoat(goat)}
                      className="p-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Tampilkan per halaman:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-emerald-600"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="hidden sm:inline">
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            title="Halaman Pertama"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            title="Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg">
            {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            title="Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            title="Halaman Terakhir"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
