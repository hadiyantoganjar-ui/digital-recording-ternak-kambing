import { useState, useEffect } from 'react';
import { JenisKelamin, UmurKategori } from '../types';

export interface PasarHewanLampungArea {
  id: string;
  namaPasar: string;
  wilayah: string;
  lokasiSpesifik: string;
  hariPasaran: string;
  statusBursa: 'Bursa Aktif' | 'Pasaran Ramai' | 'Tawar Menawar Pagi' | 'Aktivitas Normal';
  hargaTimbangJantanKurban: number; // Rp/kg bobot hidup
  hargaTimbangJantanBakalan: number;
  hargaTimbangBetinaInduk: number;
  hargaTimbangBetinaDara: number;
  faktorPremiumArea: number; // Pengali pasar lokal vs rata-rata
  perubahanHariIni: number; // Rp delta hari ini
  persenPerubahan: number; // % delta
  tren: 'naik' | 'turun' | 'stabil';
  volumeHarianEkor: number;
  komoditasPopuler: string[];
  catatanPasar: string;
  lastUpdated: string;
}

export interface TransaksiPasarTerkini {
  id: string;
  timestamp: number;
  waktuText: string;
  pasarId: string;
  namaPasar: string;
  detailTernak: string;
  bobotKg: number;
  hargaDeal: number;
  tipeDeal: 'Timbang Hidup' | 'Jogrogan / Ekor' | 'Borongan Bakalan';
  status: 'Deal / Terjual' | 'Tawar Menawar';
}

export interface RealtimeMarketState {
  markets: PasarHewanLampungArea[];
  selectedMarketId: string; // 'all' or market.id
  transactions: TransaksiPasarTerkini[];
  isAutoUpdateActive: boolean;
  updateIntervalSeconds: number;
  lastUpdatedTime: string;
  secondsUntilNextTick: number;
}

// Data awal pasar hewan rujukan utama di Provinsi Lampung
export const INITIAL_LAMPUNG_MARKETS: PasarHewanLampungArea[] = [
  {
    id: 'sukoharjo',
    namaPasar: 'Pasar Hewan Sukoharjo',
    wilayah: 'Kab. Pringsewu',
    lokasiSpesifik: 'Kec. Sukoharjo, Pringsewu (Sentra Rujukan PE & Saburai Barat)',
    hariPasaran: 'Senin & Kliwon',
    statusBursa: 'Pasaran Ramai',
    hargaTimbangJantanKurban: 86500,
    hargaTimbangJantanBakalan: 81000,
    hargaTimbangBetinaInduk: 72500,
    hargaTimbangBetinaDara: 68000,
    faktorPremiumArea: 1.025,
    perubahanHariIni: 1000,
    persenPerubahan: 1.17,
    tren: 'naik',
    volumeHarianEkor: 480,
    komoditasPopuler: ['Kambing PE Super', 'Kambing Saburai', 'Bakalan Gemuk'],
    catatanPasar: 'Bursa tawar-menawar ramai peternak binaan Pringsewu & Pesawaran. Permintaan pejantan kurban tinggi.',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
  },
  {
    id: 'sukanegara',
    namaPasar: 'Pasar Hewan Sukanegara',
    wilayah: 'Kab. Tanggamus / Lamteng',
    lokasiSpesifik: 'Perbatasan Sukanegara - Bangunrejo (Basis Peternak Saburai Tanggamus)',
    hariPasaran: 'Rabu & Sabtu (Pon/Wage)',
    statusBursa: 'Bursa Aktif',
    hargaTimbangJantanKurban: 84500,
    hargaTimbangJantanBakalan: 79500,
    hargaTimbangBetinaInduk: 70500,
    hargaTimbangBetinaDara: 66500,
    faktorPremiumArea: 1.0,
    perubahanHariIni: 500,
    persenPerubahan: 0.6,
    tren: 'naik',
    volumeHarianEkor: 520,
    komoditasPopuler: ['Kambing Saburai Asli', 'Boerawa', 'Jawa Randu Unggul'],
    catatanPasar: 'Peternak rakyat lereng Tanggamus menjual langsung. Basis timbang hidup terpercaya dan harga kompetitif.',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
  },
  {
    id: 'kalirejo',
    namaPasar: 'Pasar Hewan Kalirejo',
    wilayah: 'Kab. Lampung Tengah',
    lokasiSpesifik: 'Kec. Kalirejo (Hub Pengumpul & Blantik Lintas Kabupaten)',
    hariPasaran: 'Kamis & Minggu (Pahing/Legi)',
    statusBursa: 'Pasaran Ramai',
    hargaTimbangJantanKurban: 85500,
    hargaTimbangJantanBakalan: 80500,
    hargaTimbangBetinaInduk: 71500,
    hargaTimbangBetinaDara: 67000,
    faktorPremiumArea: 1.015,
    perubahanHariIni: 0,
    persenPerubahan: 0.0,
    tren: 'stabil',
    volumeHarianEkor: 650,
    komoditasPopuler: ['Kambing Kurban Standar', 'Bakalan Penggemukan', 'Boer Cross'],
    catatanPasar: 'Arus transaksi tinggi pedagang luar daerah. Permintaan serapan daging potong dan bakalan stabil.',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
  },
  {
    id: 'sidomulyo',
    namaPasar: 'Pasar Hewan Sidomulyo',
    wilayah: 'Kab. Lampung Selatan',
    lokasiSpesifik: 'Kec. Sidomulyo (Jalur Logistik Bakauheni - Jawa)',
    hariPasaran: 'Senin & Kamis (Pon/Pahing)',
    statusBursa: 'Bursa Aktif',
    hargaTimbangJantanKurban: 87500,
    hargaTimbangJantanBakalan: 82000,
    hargaTimbangBetinaInduk: 73000,
    hargaTimbangBetinaDara: 68500,
    faktorPremiumArea: 1.04,
    perubahanHariIni: 1500,
    persenPerubahan: 1.74,
    tren: 'naik',
    volumeHarianEkor: 410,
    komoditasPopuler: ['Kambing Bobot 35kg+ Kirim Jawa', 'Rambon Super', 'Pejantan Akikah'],
    catatanPasar: 'Didominasi pembeli borongan untuk ekspedisi pelabuhan Bakauheni ke DKI Jakarta & Banten.',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
  },
  {
    id: 'sribhawono',
    namaPasar: 'Pasar Hewan Bandar Sribhawono',
    wilayah: 'Kab. Lampung Timur',
    lokasiSpesifik: 'Kec. Bandar Sribhawono (Pusat Jalur Lintas Pantai Timur)',
    hariPasaran: 'Selasa & Jumat (Wage/Kliwon)',
    statusBursa: 'Aktivitas Normal',
    hargaTimbangJantanKurban: 83500,
    hargaTimbangJantanBakalan: 78500,
    hargaTimbangBetinaInduk: 69500,
    hargaTimbangBetinaDara: 65500,
    faktorPremiumArea: 0.985,
    perubahanHariIni: -500,
    persenPerubahan: -0.6,
    tren: 'turun',
    volumeHarianEkor: 390,
    komoditasPopuler: ['Jawa Randu', 'Kambing Kacang Lokal', 'Indukan Bibit'],
    catatanPasar: 'Pasokan hijauan & limbah jagung melimpah di Lamtim, harga bibit bakalan ekonomis bagi peternak lokal.',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
  },
  {
    id: 'bandar_lampung',
    namaPasar: 'Sentra Hewan Tugu & Way Halim',
    wilayah: 'Kota Bandar Lampung',
    lokasiSpesifik: 'Pusat Perdagangan Agribisnis Ternak Perkotaan Kota Bandar Lampung',
    hariPasaran: 'Setiap Hari (Puncak Jumat - Minggu)',
    statusBursa: 'Tawar Menawar Pagi',
    hargaTimbangJantanKurban: 89500,
    hargaTimbangJantanBakalan: 84000,
    hargaTimbangBetinaInduk: 75000,
    hargaTimbangBetinaDara: 70000,
    faktorPremiumArea: 1.065,
    perubahanHariIni: 1200,
    persenPerubahan: 1.36,
    tren: 'naik',
    volumeHarianEkor: 280,
    komoditasPopuler: ['Kambing Akikah Siap Potong', 'Kambing Qurban Premium', 'Paket Antar Kandang'],
    catatanPasar: 'Konsumen akhir rumah tangga & katering aqiqah. Harga tertinggi dengan toleransi tawar menawar moderat.',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
  },
];

const INITIAL_TRANSACTIONS: TransaksiPasarTerkini[] = [
  {
    id: 'tx-1',
    timestamp: Date.now() - 35000,
    waktuText: 'Baru saja',
    pasarId: 'sukoharjo',
    namaPasar: 'Pasar Sukoharjo (Pringsewu)',
    detailTernak: 'Kambing Saburai Jantan (Poel 1 pasang)',
    bobotKg: 34.8,
    hargaDeal: 3050000,
    tipeDeal: 'Timbang Hidup',
    status: 'Deal / Terjual',
  },
  {
    id: 'tx-2',
    timestamp: Date.now() - 95000,
    waktuText: '1 mnt lalu',
    pasarId: 'sidomulyo',
    namaPasar: 'Pasar Sidomulyo (Lamsel)',
    detailTernak: 'Pejantan Boer Cross Super (Ekspedisi Jakarta)',
    bobotKg: 42.0,
    hargaDeal: 3900000,
    tipeDeal: 'Timbang Hidup',
    status: 'Deal / Terjual',
  },
  {
    id: 'tx-3',
    timestamp: Date.now() - 180000,
    waktuText: '3 mnt lalu',
    pasarId: 'sukanegara',
    namaPasar: 'Pasar Sukanegara (Tanggamus)',
    detailTernak: '3 Ekor Bakalan Jantan Saburai (Borongan)',
    bobotKg: 78.5,
    hargaDeal: 6200000,
    tipeDeal: 'Borongan Bakalan',
    status: 'Deal / Terjual',
  },
  {
    id: 'tx-4',
    timestamp: Date.now() - 270000,
    waktuText: '5 mnt lalu',
    pasarId: 'bandar_lampung',
    namaPasar: 'Sentra Way Halim (Balam)',
    detailTernak: 'Kambing PE Akikah Siap Olah',
    bobotKg: 26.5,
    hargaDeal: 2450000,
    tipeDeal: 'Jogrogan / Ekor',
    status: 'Deal / Terjual',
  },
];

// Transaction generator templates
const SAMPLE_DEALS = [
  { pasarId: 'sukoharjo', namaPasar: 'Pasar Sukoharjo (Pringsewu)', detailTernak: 'Kambing PE Jantan Kelas Kontes/Bibit', minKg: 35, maxKg: 45, tipe: 'Jogrogan / Ekor' as const },
  { pasarId: 'sukanegara', namaPasar: 'Pasar Sukanegara (Tanggamus)', detailTernak: 'Kambing Saburai Jantan Kurban', minKg: 28, maxKg: 38, tipe: 'Timbang Hidup' as const },
  { pasarId: 'kalirejo', namaPasar: 'Pasar Kalirejo (Lamteng)', detailTernak: 'Jawa Randu Jantan Akikah', minKg: 22, maxKg: 28, tipe: 'Timbang Hidup' as const },
  { pasarId: 'sidomulyo', namaPasar: 'Pasar Sidomulyo (Lamsel)', detailTernak: 'Boerawa Jantan Pengiriman Bakauheni', minKg: 36, maxKg: 48, tipe: 'Timbang Hidup' as const },
  { pasarId: 'sribhawono', namaPasar: 'Pasar Bandar Sribhawono (Lamtim)', detailTernak: 'Indukan Rambon Bunting 2 Bulan', minKg: 27, maxKg: 33, tipe: 'Jogrogan / Ekor' as const },
  { pasarId: 'bandar_lampung', namaPasar: 'Sentra Tugu Way Halim (Balam)', detailTernak: 'Kambing Jantan Kurban I1', minKg: 29, maxKg: 36, tipe: 'Timbang Hidup' as const },
];

// Singleton store in memory
class LampungMarketStore {
  private state: RealtimeMarketState = {
    markets: [...INITIAL_LAMPUNG_MARKETS],
    selectedMarketId: 'all',
    transactions: [...INITIAL_TRANSACTIONS],
    isAutoUpdateActive: true,
    updateIntervalSeconds: 5,
    lastUpdatedTime: new Date().toLocaleTimeString('id-ID'),
    secondsUntilNextTick: 5,
  };

  private listeners = new Set<(state: RealtimeMarketState) => void>();
  private tickTimer: any = null;
  private countdownTimer: any = null;

  constructor() {
    this.startTimers();
  }

  public getState(): RealtimeMarketState {
    return this.state;
  }

  public subscribe(listener: (state: RealtimeMarketState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  public setSelectedMarketId(id: string) {
    this.state = {
      ...this.state,
      selectedMarketId: id,
    };
    this.notify();
  }

  public toggleAutoUpdate() {
    const nextActive = !this.state.isAutoUpdateActive;
    this.state = {
      ...this.state,
      isAutoUpdateActive: nextActive,
      secondsUntilNextTick: nextActive ? this.state.updateIntervalSeconds : 0,
    };
    this.notify();
  }

  public manualRefresh() {
    this.executeMarketTick();
    this.state = {
      ...this.state,
      secondsUntilNextTick: this.state.updateIntervalSeconds,
    };
    this.notify();
  }

  private startTimers() {
    // 1-second countdown timer for UI responsiveness
    this.countdownTimer = setInterval(() => {
      if (!this.state.isAutoUpdateActive) return;

      if (this.state.secondsUntilNextTick <= 1) {
        this.executeMarketTick();
        this.state = {
          ...this.state,
          secondsUntilNextTick: this.state.updateIntervalSeconds,
        };
      } else {
        this.state = {
          ...this.state,
          secondsUntilNextTick: this.state.secondsUntilNextTick - 1,
        };
      }
      this.notify();
    }, 1000);
  }

  private executeMarketTick() {
    const nowStr = new Date().toLocaleTimeString('id-ID');

    // 1. Pick 1 to 3 random markets to slightly fluctuate
    const updatedMarkets = this.state.markets.map((market) => {
      const shouldFluctuate = Math.random() > 0.4;
      if (!shouldFluctuate) return market;

      // Fluctuations in increments of Rp 250 - 500 (micro trading steps)
      const possibleDeltas = [-500, -250, 0, 250, 500, 750];
      const delta = possibleDeltas[Math.floor(Math.random() * possibleDeltas.length)];

      const newJantanKurban = Math.max(81000, Math.min(96000, market.hargaTimbangJantanKurban + delta));
      const newJantanBakalan = Math.max(76000, Math.min(88000, market.hargaTimbangJantanBakalan + Math.round(delta * 0.9)));
      const newBetinaInduk = Math.max(66000, Math.min(78000, market.hargaTimbangBetinaInduk + Math.round(delta * 0.7)));
      const newBetinaDara = Math.max(62000, Math.min(74000, market.hargaTimbangBetinaDara + Math.round(delta * 0.6)));

      const totalDelta = market.perubahanHariIni + delta;
      const pct = parseFloat(((totalDelta / market.hargaTimbangJantanKurban) * 100).toFixed(2));
      const tren = totalDelta > 200 ? 'naik' : totalDelta < -200 ? 'turun' : 'stabil';

      return {
        ...market,
        hargaTimbangJantanKurban: newJantanKurban,
        hargaTimbangJantanBakalan: newJantanBakalan,
        hargaTimbangBetinaInduk: newBetinaInduk,
        hargaTimbangBetinaDara: newBetinaDara,
        perubahanHariIni: totalDelta,
        persenPerubahan: pct,
        tren: tren as 'naik' | 'turun' | 'stabil',
        volumeHarianEkor: market.volumeHarianEkor + Math.floor(Math.random() * 5),
        lastUpdated: nowStr,
      };
    });

    // 2. Generate a fresh trade for the live transaction ticker
    const sample = SAMPLE_DEALS[Math.floor(Math.random() * SAMPLE_DEALS.length)];
    const matchedMarket = updatedMarkets.find((m) => m.id === sample.pasarId) || updatedMarkets[0];
    const weight = parseFloat((sample.minKg + Math.random() * (sample.maxKg - sample.minKg)).toFixed(1));
    const ratePerKg = matchedMarket.hargaTimbangJantanKurban;
    const rawPrice = weight * ratePerKg * (sample.tipe === 'Jogrogan / Ekor' ? 1.08 : 1.0);
    const roundedPrice = Math.round(rawPrice / 25000) * 25000;

    const newTx: TransaksiPasarTerkini = {
      id: `tx-${Date.now()}`,
      timestamp: Date.now(),
      waktuText: 'Baru saja',
      pasarId: sample.pasarId,
      namaPasar: sample.namaPasar,
      detailTernak: sample.detailTernak,
      bobotKg: weight,
      hargaDeal: roundedPrice,
      tipeDeal: sample.tipe,
      status: 'Deal / Terjual',
    };

    // Update relative time strings for previous transactions
    const updatedTxList = [newTx, ...this.state.transactions.slice(0, 9)].map((tx, idx) => {
      if (idx === 0) return tx;
      const secAgo = Math.floor((Date.now() - tx.timestamp) / 1000);
      let timeText = 'Baru saja';
      if (secAgo >= 60) {
        timeText = `${Math.floor(secAgo / 60)} mnt lalu`;
      } else if (secAgo > 10) {
        timeText = `${secAgo} dtk lalu`;
      }
      return { ...tx, waktuText: timeText };
    });

    this.state = {
      ...this.state,
      markets: updatedMarkets,
      transactions: updatedTxList,
      lastUpdatedTime: nowStr,
    };
  }
}

export const lampungMarketStore = new LampungMarketStore();

/**
 * React Hook to subscribe to real-time Lampung Animal Market updates
 */
export function useLampungMarketRealtime() {
  const [state, setState] = useState<RealtimeMarketState>(lampungMarketStore.getState());

  useEffect(() => {
    const unsubscribe = lampungMarketStore.subscribe((nextState) => {
      setState(nextState);
    });
    return () => unsubscribe();
  }, []);

  const setSelectedMarketId = (id: string) => lampungMarketStore.setSelectedMarketId(id);
  const toggleAutoUpdate = () => lampungMarketStore.toggleAutoUpdate();
  const manualRefresh = () => lampungMarketStore.manualRefresh();

  // Calculate Provincial Average
  const averageJantanKurban = Math.round(
    state.markets.reduce((acc, m) => acc + m.hargaTimbangJantanKurban, 0) / state.markets.length
  );
  const averageBetinaInduk = Math.round(
    state.markets.reduce((acc, m) => acc + m.hargaTimbangBetinaInduk, 0) / state.markets.length
  );

  const selectedMarket =
    state.selectedMarketId === 'all'
      ? null
      : state.markets.find((m) => m.id === state.selectedMarketId) || null;

  return {
    ...state,
    selectedMarket,
    averageJantanKurban,
    averageBetinaInduk,
    setSelectedMarketId,
    toggleAutoUpdate,
    manualRefresh,
  };
}

/**
 * Hitung prediksi harga ternak terintegrasi secara real-time dengan area pasar Lampung
 */
export function hitungPrediksiHargaRealtimeArea(
  bobotKg: number,
  jenisKelamin: JenisKelamin,
  bangsa: string,
  umur: UmurKategori,
  marketArea: PasarHewanLampungArea | null,
  provincialAverageJantan: number = 85500,
  provincialAverageBetina: number = 71500
) {
  // 1. Harga Dasar Real-time per Kg
  let hargaDasarPerKg = jenisKelamin === 'Jantan' ? provincialAverageJantan : provincialAverageBetina;
  let faktorArea = 1.0;
  let namaArea = 'Rata-rata Pasar Hewan Provinsi Lampung';

  if (marketArea) {
    hargaDasarPerKg =
      jenisKelamin === 'Jantan'
        ? marketArea.hargaTimbangJantanKurban
        : marketArea.hargaTimbangBetinaInduk;
    faktorArea = marketArea.faktorPremiumArea;
    namaArea = `${marketArea.namaPasar} (${marketArea.wilayah})`;
  }

  // 2. Faktor Kelamin
  const faktorKelamin = jenisKelamin === 'Jantan' ? 1.15 : 0.95;

  // 3. Faktor Bangsa
  let faktorBangsa = 1.0;
  const bLower = bangsa.toLowerCase();
  if (bLower.includes('boer') && !bLower.includes('cross')) {
    faktorBangsa = 1.18;
  } else if (bLower.includes('boer cross') || bLower.includes('bx') || bLower.includes('saburai')) {
    faktorBangsa = 1.12;
  } else if (bLower.includes('pe') || bLower.includes('ettawa')) {
    faktorBangsa = 1.06;
  } else if (bLower.includes('jawa randu') || bLower.includes('rambon')) {
    faktorBangsa = 1.0;
  } else if (bLower.includes('kacang')) {
    faktorBangsa = 0.95;
  }

  // 4. Faktor Kelayakan / Poel
  let faktorKelayakan = 1.0;
  if (umur === 'I1' || umur === 'I2') {
    faktorKelayakan = jenisKelamin === 'Jantan' ? 1.1 : 1.02;
  } else if (umur === 'I3') {
    faktorKelayakan = 1.05;
  } else if (umur === 'I4') {
    faktorKelayakan = 0.97;
  } else if (umur === 'I0') {
    faktorKelayakan = 0.92;
  }

  // Perhitungan total estimasi
  const rawPrice = bobotKg * hargaDasarPerKg * faktorKelamin * faktorBangsa * faktorKelayakan;
  const estimasiHargaTotal = Math.round(rawPrice / 25000) * 25000;

  // Rentang tawar menawar pasar (±7%)
  const rangeHargaMin = Math.round((estimasiHargaTotal * 0.93) / 25000) * 25000;
  const rangeHargaMax = Math.round((estimasiHargaTotal * 1.07) / 25000) * 25000;

  // Kategori Pasar
  let kategoriPasar: 'Bibit/Bakalan' | 'Akikah Standar' | 'Kurban Standar' | 'Kurban Super/Premium' = 'Bibit/Bakalan';
  if (jenisKelamin === 'Jantan') {
    if (bobotKg >= 38) {
      kategoriPasar = 'Kurban Super/Premium';
    } else if (bobotKg >= 26 && (umur === 'I1' || umur === 'I2' || umur === 'I3')) {
      kategoriPasar = 'Kurban Standar';
    } else if (bobotKg >= 20) {
      kategoriPasar = 'Akikah Standar';
    } else {
      kategoriPasar = 'Bibit/Bakalan';
    }
  }

  // Hitung selisih vs rata-rata provinsi
  const provincialBase = jenisKelamin === 'Jantan' ? provincialAverageJantan : provincialAverageBetina;
  const rawProvincial = bobotKg * provincialBase * faktorKelamin * faktorBangsa * faktorKelayakan;
  const estimasiProvinsi = Math.round(rawProvincial / 25000) * 25000;
  const selisihVsProvinsi = estimasiHargaTotal - estimasiProvinsi;

  return {
    bobotKg,
    hargaDasarPerKg,
    faktorKelamin,
    faktorBangsa,
    faktorKelayakan,
    faktorArea,
    namaAreaPasar: namaArea,
    estimasiHargaTotal,
    rangeHargaMin,
    rangeHargaMax,
    kategoriPasar,
    selisihVsProvinsi,
  };
}
