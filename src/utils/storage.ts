import { GoatRecord, UmurKategori, JenisKelamin, StatusKesehatanUtama } from '../types';
import { parseInitialData } from '../data/initialData';

const STORAGE_KEY = 'ternak_kambing_rfid_v3';
const LEGACY_STORAGE_KEYS = ['ternak_kambing_rfid_v2', 'ternak_kambing_rfid_v1'];

export function loadGoats(): GoatRecord[] {
  try {
    let saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const found = localStorage.getItem(legacyKey);
        if (found) {
          saved = found;
          break;
        }
      }
    }

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Hapus permanen data yang berasal dari lokasi Datarajan jika ada di cache
        let filtered = parsed.filter(
          (g) => (g.lokasi || '').trim().toLowerCase() !== 'datarajan'
        );

        // Pastikan kambing memiliki field reproduksi terbaru jika belum ada
        const initialSample = parseInitialData();
        const initialMap = new Map(initialSample.map((g) => [g.nomorEartag, g]));

        filtered = filtered.map((g) => {
          const sample = initialMap.get(g.nomorEartag);
          if (sample && !g.tanggalBirahiTerakhir && sample.tanggalBirahiTerakhir) {
            return {
              ...g,
              statusReproduksi: g.statusReproduksi || sample.statusReproduksi,
              tanggalBirahiTerakhir: sample.tanggalBirahiTerakhir,
              riwayatBirahi: sample.riwayatBirahi,
              riwayatKebuntingan: sample.riwayatKebuntingan,
            };
          }
          return g;
        });

        saveGoats(filtered);
        return filtered;
      }
    }
  } catch (e) {
    console.error('Failed to load goats from localStorage', e);
  }

  const initial = parseInitialData();
  saveGoats(initial);
  return initial;
}

export function saveGoats(goats: GoatRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goats));
  } catch (e) {
    console.error('Failed to save goats to localStorage', e);
  }
}

export function resetToInitialData(): GoatRecord[] {
  const initial = parseInitialData();
  saveGoats(initial);
  return initial;
}

export function playBeepSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime); // 1.8kHz clean high beep
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // ignore audio block
  }
}

/**
 * Audio Alarm Notifikasi Siklus Birahi Ternak Kambing
 * Tiga nada harmoni bersih (A5 -> D6 -> E6) untuk menarik perhatian peternak saat alarm birahi aktif
 */
export function playEstrusAlarmSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.18);
    playTone(1174, now + 0.14, 0.18);
    playTone(1318, now + 0.28, 0.35);
  } catch {
    // ignore audio restriction
  }
}

export function exportGoatsToCSV(goats: GoatRecord[]): void {
  const headers = [
    'Nomor RFID',
    'Nomor Eartag',
    'Jenis Kelamin',
    'Umur',
    'Bangsa Ternak',
    'Bobot Badan (kg)',
    'Status Kesehatan',
    'Nama Peternak',
    'Lokasi',
    'Timestamp',
    'Nomor Pejantan',
    'Nomor Induk',
    'Jenis Pakan',
    'Riwayat Penyakit Terakhir',
    'Pengobatan Terakhir',
  ];

  const rows = goats.map((g) => {
    const lastHealth = g.riwayatKesehatan && g.riwayatKesehatan.length > 0 ? g.riwayatKesehatan[g.riwayatKesehatan.length - 1] : null;
    return [
      `"${g.nomorRfid}"`,
      `"${g.nomorEartag}"`,
      `"${g.jenisKelamin}"`,
      `"${g.umur}"`,
      `"${g.bangsaTernak}"`,
      g.bobotBadan,
      `"${g.statusKesehatan}"`,
      `"${g.namaPeternak}"`,
      `"${g.lokasi}"`,
      `"${g.timestampAwal || ''}"`,
      `"${g.nomorPejantan || ''}"`,
      `"${g.nomorInduk || ''}"`,
      `"${g.pakan?.jenisPakan || ''}"`,
      `"${lastHealth ? lastHealth.jenisPenyakit : ''}"`,
      `"${lastHealth ? lastHealth.pengobatanDiberikan : ''}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `data_digital_recording_kambing_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
