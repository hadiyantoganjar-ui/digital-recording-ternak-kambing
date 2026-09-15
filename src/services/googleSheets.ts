import { GoatRecord, UmurKategori, JenisKelamin, StatusKesehatanUtama, RiwayatBobot } from '../types';

export interface GoogleSpreadsheetItem {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: {
    sheetId: number;
    title: string;
    index: number;
  }[];
}

const STORAGE_CONNECTED_SHEET = 'ternak_kambing_connected_sheet';

export function getConnectedSheetConfig(): { id: string; title: string; url: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_CONNECTED_SHEET);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse connected sheet info', e);
  }
  return null;
}

export function saveConnectedSheetConfig(config: { id: string; title: string; url: string } | null) {
  try {
    if (config) {
      localStorage.setItem(STORAGE_CONNECTED_SHEET, JSON.stringify(config));
    } else {
      localStorage.removeItem(STORAGE_CONNECTED_SHEET);
    }
  } catch (e) {
    console.error('Failed to save connected sheet info', e);
  }
}

/**
 * Extract spreadsheet ID from standard URL or clean string
 */
export function extractSpreadsheetId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;
  // Match https://docs.google.com/spreadsheets/d/{ID}/edit...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If user pasted raw ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Fetch spreadsheet metadata to get actual sheet/tab titles
 */
export async function getSpreadsheetMetadata(accessToken: string, spreadsheetId: string): Promise<SheetMetadata> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengambil info spreadsheet (${res.status})`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Spreadsheet Ternak',
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties?.sheetId,
      title: s.properties?.title,
      index: s.properties?.index,
    })),
  };
}

/**
 * List recent spreadsheets from Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<GoogleSpreadsheetItem[]> {
  try {
    const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const fields = encodeURIComponent('files(id,name,modifiedTime,webViewLink)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime%20desc&pageSize=15&fields=${fields}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.warn('Drive file list failed with status:', res.status);
      return [];
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.warn('Failed to query user spreadsheets from Drive', err);
    return [];
  }
}

/**
 * Create a brand new Google Spreadsheet configured with two tabs
 */
export async function createGoatSpreadsheet(
  accessToken: string,
  goats: GoatRecord[],
  title: string = 'Digital Recording Ternak Kambing RFID'
): Promise<{ id: string; url: string; title: string }> {
  const createPayload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Master Data Ternak',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'Riwayat Penimbangan',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat Google Spreadsheet baru (${res.status})`);
  }

  const created = await res.json();
  const spreadsheetId = created.spreadsheetId;
  const webViewUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Populate initial rows
  await syncDataToSpreadsheet(accessToken, spreadsheetId, goats, {
    masterTabTitle: 'Master Data Ternak',
    weightTabTitle: 'Riwayat Penimbangan',
  });

  return {
    id: spreadsheetId,
    url: webViewUrl,
    title: created.properties?.title || title,
  };
}

/**
 * Format headers and sync all goats & weight histories into a spreadsheet
 */
export async function syncDataToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  goats: GoatRecord[],
  tabOptions?: { masterTabTitle?: string; weightTabTitle?: string }
): Promise<void> {
  // 1. Get metadata to confirm tab names
  const metadata = await getSpreadsheetMetadata(accessToken, spreadsheetId);
  const masterTitle =
    tabOptions?.masterTabTitle ||
    metadata.sheets.find((s) => s.title.toLowerCase().includes('ternak') || s.title.toLowerCase().includes('data'))?.title ||
    metadata.sheets[0]?.title ||
    'Sheet1';

  // 2. Prepare Master Data rows
  const masterHeader = [
    'Nomor RFID',
    'Nomor Eartag',
    'Nama Peternak',
    'Lokasi / Kandang',
    'Bangsa Ternak',
    'Bobot Terkini (kg)',
    'Kategori Umur',
    'Jenis Kelamin',
    'Status Kesehatan',
    'Nomor Pejantan',
    'Nomor Induk',
    'Tanggal Registrasi Awal',
    'Pakan Harian',
    'Terakhir Diperbarui',
  ];

  const masterRows = goats.map((g) => [
    g.nomorRfid || '',
    g.nomorEartag || '',
    g.namaPeternak || '',
    g.lokasi || '',
    g.bangsaTernak || '',
    g.bobotBadan || 0,
    g.umur || '',
    g.jenisKelamin || '',
    g.statusKesehatan || '',
    g.nomorPejantan || '',
    g.nomorInduk || '',
    g.timestampAwal || '',
    g.pakan?.jenisPakan || '',
    g.updatedAt || new Date().toISOString(),
  ]);

  const masterValues = [masterHeader, ...masterRows];

  // 3. Clear and write Master Sheet
  await clearSheetValues(accessToken, spreadsheetId, `${masterTitle}!A1:Z${masterRows.length + 50}`);
  await writeSheetValues(accessToken, spreadsheetId, `${masterTitle}!A1`, masterValues);

  // 4. Check if second sheet exists for Riwayat Penimbangan
  const weightSheet = metadata.sheets.find(
    (s) => s.title.toLowerCase().includes('timbang') || s.title.toLowerCase().includes('bobot') || s.title.toLowerCase().includes('weight')
  );

  if (weightSheet) {
    const weightHeader = [
      'Nomor RFID',
      'Nomor Eartag',
      'Nama Peternak',
      'Tanggal Penimbangan',
      'Bobot Timbang (kg)',
      'Lingkar Dada (cm)',
      'Jenis Ransum Pakan',
      'Petugas Penimbang',
      'Catatan Lapangan',
    ];

    const weightRows: any[][] = [];
    goats.forEach((g) => {
      (g.riwayatBobot || []).forEach((rw) => {
        weightRows.push([
          g.nomorRfid || '',
          g.nomorEartag || '',
          g.namaPeternak || '',
          rw.tanggal || '',
          rw.bobot || 0,
          rw.lingkarDadaCm || '',
          rw.pakanSaatTimbang || '',
          rw.petugasPenimbang || '',
          rw.catatan || '',
        ]);
      });
    });

    const weightValues = [weightHeader, ...weightRows];
    await clearSheetValues(accessToken, spreadsheetId, `${weightSheet.title}!A1:Z${weightRows.length + 50}`);
    await writeSheetValues(accessToken, spreadsheetId, `${weightSheet.title}!A1`, weightValues);
  }
}

/**
 * Clear range before rewriting
 */
async function clearSheetValues(accessToken: string, spreadsheetId: string, range: string): Promise<void> {
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (err) {
    console.warn('Clear range ignored:', err);
  }
}

/**
 * Write values to range
 */
async function writeSheetValues(accessToken: string, spreadsheetId: string, range: string, values: any[][]): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal menulis data ke spreadsheet (${res.status})`);
  }
}

/**
 * Read and import goat records from a Google Spreadsheet
 */
export async function importGoatsFromSpreadsheet(accessToken: string, spreadsheetId: string): Promise<GoatRecord[]> {
  const metadata = await getSpreadsheetMetadata(accessToken, spreadsheetId);
  const masterTitle =
    metadata.sheets.find((s) => s.title.toLowerCase().includes('ternak') || s.title.toLowerCase().includes('data'))?.title ||
    metadata.sheets[0]?.title;

  if (!masterTitle) {
    throw new Error('Spreadsheet tidak memiliki lembar sheet yang valid');
  }

  // 1. Read master sheet
  const masterRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(masterTitle)}!A1:Z1000`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!masterRes.ok) {
    const err = await masterRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membaca lembar data ternak (${masterRes.status})`);
  }

  const masterJson = await masterRes.json();
  const rows: string[][] = masterJson.values || [];

  if (rows.length < 2) {
    throw new Error('Spreadsheet kosong atau belum memiliki baris data.');
  }

  const headerRow = rows[0].map((h) => (h || '').toString().trim().toLowerCase());

  // Find column indices dynamically
  const colRfid = headerRow.findIndex((h) => h.includes('rfid'));
  const colEartag = headerRow.findIndex((h) => h.includes('eartag') || h.includes('tag'));
  const colPeternak = headerRow.findIndex((h) => h.includes('peternak') || h.includes('pemilik'));
  const colLokasi = headerRow.findIndex((h) => h.includes('lokasi') || h.includes('kandang') || h.includes('desa'));
  const colBangsa = headerRow.findIndex((h) => h.includes('bangsa') || h.includes('ras') || h.includes('breed'));
  const colBobot = headerRow.findIndex((h) => h.includes('bobot') || h.includes('berat'));
  const colUmur = headerRow.findIndex((h) => h.includes('umur'));
  const colKelamin = headerRow.findIndex((h) => h.includes('kelamin') || h.includes('sex'));
  const colKesehatan = headerRow.findIndex((h) => h.includes('kesehatan') || h.includes('status'));
  const colPejantan = headerRow.findIndex((h) => h.includes('pejantan') || h.includes('bapak') || h.includes('sire'));
  const colInduk = headerRow.findIndex((h) => h.includes('induk') || h.includes('ibu') || h.includes('dam'));
  const colTanggalReg = headerRow.findIndex((h) => h.includes('registrasi') || h.includes('tanggal'));

  // 2. Read secondary sheet for weight history if exists
  const weightSheet = metadata.sheets.find(
    (s) => s.title.toLowerCase().includes('timbang') || s.title.toLowerCase().includes('bobot') || s.title.toLowerCase().includes('weight')
  );

  const weightByRfidOrTag = new Map<string, RiwayatBobot[]>();

  if (weightSheet) {
    try {
      const wRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(weightSheet.title)}!A1:Z2000`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (wRes.ok) {
        const wData = await wRes.json();
        const wRows: string[][] = wData.values || [];
        if (wRows.length > 1) {
          const wHeaders = wRows[0].map((h) => (h || '').toString().trim().toLowerCase());
          const wColRfid = wHeaders.findIndex((h) => h.includes('rfid'));
          const wColEartag = wHeaders.findIndex((h) => h.includes('eartag'));
          const wColTgl = wHeaders.findIndex((h) => h.includes('tanggal') || h.includes('tgl'));
          const wColBobot = wHeaders.findIndex((h) => h.includes('bobot') || h.includes('berat'));
          const wColLd = wHeaders.findIndex((h) => h.includes('lingkar') || h.includes('dada'));
          const wColPakan = wHeaders.findIndex((h) => h.includes('pakan') || h.includes('ransum'));
          const wColPetugas = wHeaders.findIndex((h) => h.includes('petugas'));
          const wColCatatan = wHeaders.findIndex((h) => h.includes('catatan') || h.includes('ket'));

          for (let i = 1; i < wRows.length; i++) {
            const r = wRows[i];
            const rfid = (wColRfid >= 0 ? r[wColRfid] : '')?.trim();
            const eartag = (wColEartag >= 0 ? r[wColEartag] : '')?.trim();
            const key = rfid || eartag;
            if (!key) continue;

            const tgl = (wColTgl >= 0 ? r[wColTgl] : '')?.trim() || new Date().toISOString().split('T')[0];
            const bbt = parseFloat((wColBobot >= 0 ? r[wColBobot] : '')?.toString().replace(',', '.')) || 0;
            const ld = parseFloat((wColLd >= 0 ? r[wColLd] : '')?.toString().replace(',', '.')) || undefined;
            const pkn = (wColPakan >= 0 ? r[wColPakan] : '')?.trim() || undefined;
            const ptg = (wColPetugas >= 0 ? r[wColPetugas] : '')?.trim() || undefined;
            const cttn = (wColCatatan >= 0 ? r[wColCatatan] : '')?.trim() || undefined;

            const record: RiwayatBobot = {
              id: `w-imp-${Date.now()}-${i}`,
              tanggal: tgl,
              bobot: bbt,
              lingkarDadaCm: ld,
              pakanSaatTimbang: pkn,
              petugasPenimbang: ptg,
              catatan: cttn,
            };

            if (!weightByRfidOrTag.has(key)) {
              weightByRfidOrTag.set(key, []);
            }
            weightByRfidOrTag.get(key)!.push(record);
          }
        }
      }
    } catch (e) {
      console.warn('Could not read weight sheet', e);
    }
  }

  // 3. Construct GoatRecords
  const importedGoats: GoatRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row.some((cell) => cell && cell.trim())) continue;

    const nomorRfid = (colRfid >= 0 ? row[colRfid] : '')?.trim() || `RFID-IMP-${i}`;
    const nomorEartag = (colEartag >= 0 ? row[colEartag] : '')?.trim() || `ET-${i}`;
    const namaPeternak = (colPeternak >= 0 ? row[colPeternak] : '')?.trim() || 'Peternak Mitra';
    const lokasi = (colLokasi >= 0 ? row[colLokasi] : '')?.trim() || 'Sukamaju';
    const bangsaTernak = (colBangsa >= 0 ? row[colBangsa] : '')?.trim() || 'PE';

    const rawBobot = parseFloat((colBobot >= 0 ? row[colBobot] : '')?.toString().replace(',', '.')) || 25.0;

    let umur: UmurKategori = 'I0';
    const rawUmur = (colUmur >= 0 ? row[colUmur] : '')?.trim().toUpperCase();
    if (['I0', 'I1', 'I2', 'I3', 'I4'].includes(rawUmur)) {
      umur = rawUmur as UmurKategori;
    }

    let jenisKelamin: JenisKelamin = 'Betina';
    const rawSex = (colKelamin >= 0 ? row[colKelamin] : '')?.trim().toLowerCase();
    if (rawSex.startsWith('j') || rawSex === 'male' || rawSex === 'jantan') {
      jenisKelamin = 'Jantan';
    }

    let statusKesehatan: StatusKesehatanUtama = 'Sehat';
    const rawKes = (colKesehatan >= 0 ? row[colKesehatan] : '')?.trim().toLowerCase();
    if (rawKes.includes('sakit')) {
      statusKesehatan = 'Sakit';
    } else if (rawKes.includes('rawat')) {
      statusKesehatan = 'Dalam Perawatan';
    }

    const nomorPejantan = (colPejantan >= 0 ? row[colPejantan] : '')?.trim() || undefined;
    const nomorInduk = (colInduk >= 0 ? row[colInduk] : '')?.trim() || undefined;
    const timestampAwal = (colTanggalReg >= 0 ? row[colTanggalReg] : '')?.trim() || new Date().toISOString().split('T')[0];

    // Riwayat bobot
    const matchedWeights = weightByRfidOrTag.get(nomorRfid) || weightByRfidOrTag.get(nomorEartag) || [];
    const riwayatBobot: RiwayatBobot[] =
      matchedWeights.length > 0
        ? matchedWeights
        : [
            {
              id: `w-init-${i}`,
              tanggal: timestampAwal,
              bobot: rawBobot,
              catatan: 'Penimbangan awal tercatat',
            },
          ];

    const latestWeight = riwayatBobot[riwayatBobot.length - 1].bobot || rawBobot;

    importedGoats.push({
      id: nomorRfid,
      nomorRfid,
      nomorEartag,
      namaPeternak,
      lokasi,
      bangsaTernak,
      bobotBadan: latestWeight,
      umur,
      jenisKelamin,
      statusKesehatan,
      riwayatKesehatan: [],
      riwayatBobot,
      riwayatPakanHarian: [],
      pakan: {
        jenisPakan: 'Hijauan Segar + Konsentrat Penguat',
        komposisiPakan: 'Rumput Odot 65% + Legum Indigofera 20% + Konsentrat 15%',
        frekuensiPemberian: '2x Sehari (Pagi & Sore)',
        jumlahHarianKg: 3.5,
      },
      nomorPejantan,
      nomorInduk,
      timestampAwal,
      updatedAt: new Date().toISOString(),
    });
  }

  return importedGoats;
}
