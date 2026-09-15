import React, { useState, useEffect } from 'react';
import { GoatRecord, UmurKategori, JenisKelamin, StatusKesehatanUtama } from '../types';
import { X, Save, Radio, Scale, User, MapPin } from 'lucide-react';

interface GoatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goat: GoatRecord) => void;
  initialGoat?: GoatRecord | null;
  existingPeternak: string[];
  existingLokasi: string[];
  initialRfidPrefill?: string;
}

export const GoatFormModal: React.FC<GoatFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoat,
  existingPeternak,
  existingLokasi,
  initialRfidPrefill,
}) => {
  const [nomorRfid, setNomorRfid] = useState('');
  const [nomorEartag, setNomorEartag] = useState('');
  const [namaPeternak, setNamaPeternak] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [bangsaTernak, setBangsaTernak] = useState('PE');
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>('Betina');
  const [umur, setUmur] = useState<UmurKategori>('I0');
  const [bobotBadan, setBobotBadan] = useState<string>('25');
  const [statusKesehatan, setStatusKesehatan] = useState<StatusKesehatanUtama>('Sehat');
  const [jenisPakan, setJenisPakan] = useState('Hijauan Segar + Konsentrat Penguat');
  const [komposisiPakan, setKomposisiPakan] = useState('Rumput Odot 70% + Indigofera 20% + Dedak 10%');
  const [nomorPejantan, setNomorPejantan] = useState('');
  const [nomorInduk, setNomorInduk] = useState('');
  const [catatanTambahan, setCatatanTambahan] = useState('');

  useEffect(() => {
    if (initialGoat) {
      setNomorRfid(initialGoat.nomorRfid);
      setNomorEartag(initialGoat.nomorEartag);
      setNamaPeternak(initialGoat.namaPeternak);
      setLokasi(initialGoat.lokasi);
      setBangsaTernak(initialGoat.bangsaTernak);
      setJenisKelamin(initialGoat.jenisKelamin);
      setUmur(initialGoat.umur);
      setBobotBadan(String(initialGoat.bobotBadan || '25'));
      setStatusKesehatan(initialGoat.statusKesehatan);
      setJenisPakan(initialGoat.pakan?.jenisPakan || 'Hijauan Segar + Konsentrat Penguat');
      setKomposisiPakan(initialGoat.pakan?.komposisiPakan || '');
      setNomorPejantan(initialGoat.nomorPejantan || '');
      setNomorInduk(initialGoat.nomorInduk || '');
      setCatatanTambahan(initialGoat.catatanTambahan || '');
    } else {
      // Generate new RFID if prefilled or create new default
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setNomorRfid(initialRfidPrefill || `11202518060${randomSuffix}`);
      setNomorEartag(String(randomSuffix));
      setNamaPeternak(existingPeternak[0] || 'Purwanto');
      setLokasi(existingLokasi[0] || 'Sukamaju');
      setBangsaTernak('PE');
      setJenisKelamin('Betina');
      setUmur('I0');
      setBobotBadan('25');
      setStatusKesehatan('Sehat');
      setJenisPakan('Hijauan Segar + Konsentrat Penguat');
      setKomposisiPakan('Rumput Odot 70% + Indigofera 20% + Dedak 10%');
      setNomorPejantan('');
      setNomorInduk('');
      setCatatanTambahan('');
    }
  }, [initialGoat, isOpen, initialRfidPrefill, existingPeternak, existingLokasi]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bobotNum = parseFloat(bobotBadan) || 20;

    const updatedRecord: GoatRecord = {
      id: initialGoat ? initialGoat.id : nomorRfid.trim() || `goat-${Date.now()}`,
      nomorRfid: nomorRfid.trim(),
      nomorEartag: nomorEartag.trim(),
      namaPeternak: namaPeternak.trim() || 'Peternak',
      lokasi: lokasi.trim() || 'Sukamaju',
      bangsaTernak: bangsaTernak.trim(),
      bobotBadan: bobotNum,
      umur: umur,
      jenisKelamin: jenisKelamin,
      statusKesehatan: statusKesehatan,
      riwayatKesehatan: initialGoat ? initialGoat.riwayatKesehatan : [],
      riwayatBobot: initialGoat
        ? initialGoat.riwayatBobot
        : [
            {
              tanggal: new Date().toISOString().slice(0, 10),
              bobot: bobotNum,
              catatan: 'Penimbangan registrasi awal',
            },
          ],
      pakan: {
        jenisPakan: jenisPakan.trim(),
        komposisiPakan: komposisiPakan.trim(),
        frekuensiPemberian: '2x Sehari (Pagi & Sore)',
        jumlahHarianKg: 3.5,
      },
      nomorPejantan: nomorPejantan.trim() || undefined,
      nomorInduk: nomorInduk.trim() || undefined,
      timestampAwal: initialGoat?.timestampAwal || new Date().toLocaleString('id-ID'),
      catatanTambahan: catatanTambahan.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 border border-emerald-600 flex items-center justify-center">
              <Radio className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {initialGoat ? 'Edit Data Ternak Kambing' : 'Perekaman Digital Ternak Baru'}
              </h3>
              <p className="text-xs text-emerald-200">
                Pencatatan data identitas, RFID, dan manajemen pakan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* RFID & Eartag Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor RFID Lapangan *</label>
              <input
                type="text"
                required
                value={nomorRfid}
                onChange={(e) => setNomorRfid(e.target.value)}
                placeholder="Contoh: 112025180600004"
                className="w-full font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Eartag Fisik *</label>
              <input
                type="text"
                required
                value={nomorEartag}
                onChange={(e) => setNomorEartag(e.target.value)}
                placeholder="Contoh: 0004"
                className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Peternak & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Peternak *</label>
              <input
                type="text"
                required
                list="peternak-options"
                value={namaPeternak}
                onChange={(e) => setNamaPeternak(e.target.value)}
                placeholder="Pilih atau ketik nama peternak"
                className="w-full font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <datalist id="peternak-options">
                {existingPeternak.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Lokasi / Desa *</label>
              <input
                type="text"
                required
                list="lokasi-options"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Sukamaju, dll"
                className="w-full font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <datalist id="lokasi-options">
                {existingLokasi.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Bangsa & Jenis Kelamin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bangsa Kambing *</label>
              <select
                value={bangsaTernak}
                onChange={(e) => setBangsaTernak(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none font-medium"
              >
                <option value="PE">PE (Peranakan Ettawa)</option>
                <option value="Boer">Boer</option>
                <option value="Saburai">Saburai</option>
                <option value="Rambon">Rambon</option>
                <option value="Jawa Randu">Jawa Randu</option>
                <option value="Boer Cross (Bx)">Boer Cross (Bx)</option>
                <option value="Kambing Kacang">Kambing Kacang</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin *</label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as JenisKelamin)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none font-medium"
              >
                <option value="Betina">Betina</option>
                <option value="Jantan">Jantan</option>
              </select>
            </div>
          </div>

          {/* Umur & Bobot Badan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Umur (Gigi Poel) *</label>
              <select
                value={umur}
                onChange={(e) => setUmur(e.target.value as UmurKategori)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none font-medium"
              >
                <option value="I0">I0 (&lt; 1 tahun / Belum poel)</option>
                <option value="I1">I1 (1 - 1.5 tahun / Poel 1 pasang)</option>
                <option value="I2">I2 (1.5 - 2 tahun / Poel 2 pasang)</option>
                <option value="I3">I3 (2 - 3 tahun / Poel 3 pasang)</option>
                <option value="I4">I4 (&gt; 3 tahun / Poel rata)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bobot Badan (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={bobotBadan}
                onChange={(e) => setBobotBadan(e.target.value)}
                placeholder="35.5"
                className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Status Kesehatan */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Status Kesehatan *</label>
            <select
              value={statusKesehatan}
              onChange={(e) => setStatusKesehatan(e.target.value as StatusKesehatanUtama)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none font-medium"
            >
              <option value="Sehat">Sehat</option>
              <option value="Dalam Perawatan">Dalam Perawatan</option>
              <option value="Sakit">Sakit</option>
              <option value="Karantina">Karantina</option>
            </select>
          </div>

          {/* Pakan */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="font-bold text-slate-800 block">Informasi Pakan Ternak</span>
            <div>
              <label className="text-slate-600 block mb-1">Jenis Pakan Utama</label>
              <input
                type="text"
                value={jenisPakan}
                onChange={(e) => setJenisPakan(e.target.value)}
                placeholder="Hijauan Segar + Konsentrat Penguat"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Komposisi Pakan</label>
              <input
                type="text"
                value={komposisiPakan}
                onChange={(e) => setKomposisiPakan(e.target.value)}
                placeholder="Contoh: Rumput Odot 70% + Indigofera 20% + Dedak Padi 10%"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Genealogi Pejantan & Induk */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Nomor Pejantan (Sire)</label>
              <input
                type="text"
                value={nomorPejantan}
                onChange={(e) => setNomorPejantan(e.target.value)}
                placeholder="Contoh: 0470 / Junior 027"
                className="w-full font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Nomor Induk (Dam)</label>
              <input
                type="text"
                value={nomorInduk}
                onChange={(e) => setNomorInduk(e.target.value)}
                placeholder="Contoh: 0188 / 0250"
                className="w-full font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Data Ternak
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
