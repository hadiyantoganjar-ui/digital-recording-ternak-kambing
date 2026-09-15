import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Plus,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  LogOut,
  FolderOpen,
  Link as LinkIcon,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
} from '../services/googleAuth';
import {
  createGoatSpreadsheet,
  syncDataToSpreadsheet,
  importGoatsFromSpreadsheet,
  listUserSpreadsheets,
  getSpreadsheetMetadata,
  extractSpreadsheetId,
  getConnectedSheetConfig,
  saveConnectedSheetConfig,
  GoogleSpreadsheetItem,
} from '../services/googleSheets';
import { GoatRecord } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goats: GoatRecord[];
  onImportSuccess: (imported: GoatRecord[]) => void;
  onNotification: (msg: string) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  goats,
  onImportSuccess,
  onNotification,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Connected Sheet info
  const [connectedSheet, setConnectedSheet] = useState<{ id: string; title: string; url: string } | null>(null);

  // Drive Sheet List
  const [driveSheets, setDriveSheets] = useState<GoogleSpreadsheetItem[]>([]);
  const [isLoadingDriveList, setIsLoadingDriveList] = useState(false);
  const [customSheetInput, setCustomSheetInput] = useState('');

  // Action states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'sync' | 'pick' | 'new'>('sync');

  // Confirmation state for destructive operations
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    type: 'export' | 'import' | 'disconnect';
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  // Initialize Auth & Connected Sheet on mount
  useEffect(() => {
    const savedConfig = getConnectedSheetConfig();
    if (savedConfig) {
      setConnectedSheet(savedConfig);
    }

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch Drive spreadsheets when user is authenticated
  const fetchDriveSheets = async (token: string) => {
    setIsLoadingDriveList(true);
    try {
      const list = await listUserSpreadsheets(token);
      setDriveSheets(list);
    } catch (err: any) {
      console.warn('Could not load drive files', err);
    } finally {
      setIsLoadingDriveList(false);
    }
  };

  useEffect(() => {
    if (accessToken && isOpen) {
      fetchDriveSheets(accessToken);
    }
  }, [accessToken, isOpen]);

  if (!isOpen) return null;

  // Handle Google Sign-in
  const handleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        onNotification(`Berhasil masuk sebagai ${res.user.displayName || res.user.email}`);
        fetchDriveSheets(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Gagal login ke akun Google');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await googleSignOut();
    setCurrentUser(null);
    setAccessToken(null);
    onNotification('Berhasil keluar dari akun Google.');
  };

  // 1. Create Brand New Spreadsheet
  const handleCreateNewSpreadsheet = async () => {
    if (!accessToken) {
      setAuthError('Silakan login ke akun Google terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    setProcessMessage('Membuat Google Spreadsheet baru & menyinkronkan data...');
    try {
      const sheetName = `Recording Ternak RFID (${new Date().toLocaleDateString('id-ID')})`;
      const result = await createGoatSpreadsheet(accessToken, goats, sheetName);

      const config = { id: result.id, title: result.title, url: result.url };
      setConnectedSheet(config);
      saveConnectedSheetConfig(config);

      onNotification(`Spreadsheet "${result.title}" berhasil dibuat di Google Drive!`);
      setActiveTab('sync');
      fetchDriveSheets(accessToken);
    } catch (err: any) {
      alert(`Gagal membuat spreadsheet: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessMessage('');
    }
  };

  // 2. Connect to existing spreadsheet
  const handleConnectExisting = async (sheetIdOrUrl: string) => {
    if (!accessToken) return;
    const cleanId = extractSpreadsheetId(sheetIdOrUrl);
    if (!cleanId) {
      alert('Link atau ID Google Spreadsheet tidak valid.');
      return;
    }

    setIsProcessing(true);
    setProcessMessage('Memverifikasi spreadsheet di Google Sheets...');
    try {
      const meta = await getSpreadsheetMetadata(accessToken, cleanId);
      const config = {
        id: meta.spreadsheetId,
        title: meta.title,
        url: `https://docs.google.com/spreadsheets/d/${meta.spreadsheetId}/edit`,
      };
      setConnectedSheet(config);
      saveConnectedSheetConfig(config);
      setCustomSheetInput('');
      onNotification(`Terkoneksi ke spreadsheet: "${meta.title}"`);
      setActiveTab('sync');
    } catch (err: any) {
      alert(`Gagal mengakses spreadsheet: ${err.message}. Pastikan izin akun Google sesuai.`);
    } finally {
      setIsProcessing(false);
      setProcessMessage('');
    }
  };

  // 3. Prompt Export / Overwrite (with explicit user confirmation as mandated)
  const promptExportData = () => {
    if (!connectedSheet || !accessToken) return;

    setPendingConfirmation({
      type: 'export',
      title: 'Konfirmasi Sinkronisasi / Ekspor ke Google Sheets',
      description: `Apakah Anda yakin ingin memperbarui data pada spreadsheet "${connectedSheet.title}"? Seluruh ${goats.length} data ternak kambing dan riwayat penimbangan dari aplikasi akan disinkronkan ke lembar sheet tersebut.`,
      action: async () => {
        setIsProcessing(true);
        setProcessMessage('Menulis data ternak ke Google Sheets...');
        try {
          await syncDataToSpreadsheet(accessToken, connectedSheet.id, goats);
          onNotification(`Berhasil menyinkronkan ${goats.length} data kambing ke Google Sheets!`);
        } catch (err: any) {
          alert(`Gagal menyinkronkan data: ${err.message}`);
        } finally {
          setIsProcessing(false);
          setProcessMessage('');
          setPendingConfirmation(null);
        }
      },
    });
  };

  // 4. Prompt Import Data from Google Sheets (with explicit confirmation)
  const promptImportData = () => {
    if (!connectedSheet || !accessToken) return;

    setPendingConfirmation({
      type: 'import',
      title: 'Konfirmasi Impor Data dari Google Sheets',
      description: `Apakah Anda yakin ingin mengimpor data ternak dari spreadsheet "${connectedSheet.title}"? Data di aplikasi akan diperbarui dengan data dari Google Sheets.`,
      action: async () => {
        setIsProcessing(true);
        setProcessMessage('Membaca & memproses data dari Google Sheets...');
        try {
          const imported = await importGoatsFromSpreadsheet(accessToken, connectedSheet.id);
          if (imported.length === 0) {
            alert('Tidak ada data ternak yang valid ditemukan dalam spreadsheet.');
            return;
          }
          onImportSuccess(imported);
          onNotification(`Berhasil mengimpor ${imported.length} data kambing dari Google Sheets!`);
          onClose();
        } catch (err: any) {
          alert(`Gagal mengimpor dari Google Sheets: ${err.message}`);
        } finally {
          setIsProcessing(false);
          setProcessMessage('');
          setPendingConfirmation(null);
        }
      },
    });
  };

  // 5. Disconnect
  const handleDisconnect = () => {
    setConnectedSheet(null);
    saveConnectedSheetConfig(null);
    onNotification('Koneksi Google Sheets berhasil diputuskan.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Integrasi Google Sheets</h2>
              <p className="text-xs text-emerald-100">
                Sinkronisasi cloud dua arah data ternak kambing & riwayat timbangan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Auth Card */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {currentUser && accessToken ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google User'}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full border border-slate-300 shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{currentUser.displayName || 'Pengguna Google'}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Terhubung
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Masuk dengan akun Google Anda untuk mengakses Google Sheets & Drive.</span>
            </div>
          )}

          <div>
            {currentUser && accessToken ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Keluar</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isAuthLoading}
                className="gsi-material-button shadow-xs"
                style={{ height: '38px' }}
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isAuthLoading ? 'Menghubungkan...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{authError}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!accessToken ? (
            <div className="text-center py-10 px-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
              <FileSpreadsheet className="w-14 h-14 text-emerald-600/70 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">Sambungkan Akun Google Anda</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-5 leading-relaxed">
                Aplikasi ini dapat menyimpan cadangan data recording ternak, mengekspor laporan tabel ke Google Sheets, dan mengimpor pembaruan data secara langsung dengan izin akun Anda.
              </p>
              <button
                onClick={handleLogin}
                disabled={isAuthLoading}
                className="gsi-material-button mx-auto shadow-md"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isAuthLoading ? 'Sedang menghubungkan...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 gap-2">
                <button
                  onClick={() => setActiveTab('sync')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'sync'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Spreadsheet Aktif</span>
                  {connectedSheet && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('pick')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'pick'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Pilih dari Drive ({driveSheets.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'new'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Baru / Hubungkan Manual</span>
                </button>
              </div>

              {/* Tab 1: Sync Active Spreadsheet */}
              {activeTab === 'sync' && (
                <div className="space-y-4">
                  {connectedSheet ? (
                    <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            <FileSpreadsheet className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                                Terhubung
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                ID: {connectedSheet.id.substring(0, 12)}...
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">
                              {connectedSheet.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {goats.length} data kambing lokal siap disinkronkan ke tab Master Data & Riwayat Penimbangan.
                            </p>
                          </div>
                        </div>

                        <a
                          href={connectedSheet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Buka di Google Sheets</span>
                        </a>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-emerald-200/60">
                        <button
                          onClick={promptExportData}
                          disabled={isProcessing}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Ekspor & Timpa ke Sheets</span>
                        </button>
                        <button
                          onClick={promptImportData}
                          disabled={isProcessing}
                          className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 active:scale-98 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                        >
                          <Download className="w-4 h-4 text-emerald-600" />
                          <span>Impor Data dari Sheets</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 text-[11px] text-slate-500">
                        <span>Ingin menggunakan spreadsheet lain?</span>
                        <button
                          onClick={handleDisconnect}
                          className="text-rose-600 hover:text-rose-700 font-semibold"
                        >
                          Putuskan Koneksi Sheet Ini
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Belum Ada Spreadsheet Terhubung</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                        Pilih spreadsheet dari Google Drive Anda atau buat lembar baru secara otomatis dalam 1 kali klik.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => setActiveTab('new')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Buat Lembar Baru Otomatis</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('pick')}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <FolderOpen className="w-4 h-4 text-slate-500" />
                          <span>Pilih dari Drive</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Pick from Drive */}
              {activeTab === 'pick' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Spreadsheet di Google Drive Anda:
                    </span>
                    <button
                      onClick={() => accessToken && fetchDriveSheets(accessToken)}
                      disabled={isLoadingDriveList}
                      className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingDriveList ? 'animate-spin' : ''}`} />
                      <span>Segarkan Daftar</span>
                    </button>
                  </div>

                  {isLoadingDriveList ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      Memuat daftar spreadsheet dari Google Drive...
                    </div>
                  ) : driveSheets.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      Tidak ada file Google Spreadsheet ditemukan di Google Drive Anda.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                      {driveSheets.map((file) => (
                        <div
                          key={file.id}
                          className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {file.name}
                              </p>
                              {file.modifiedTime && (
                                <p className="text-[10px] text-slate-400">
                                  Diubah: {new Date(file.modifiedTime).toLocaleDateString('id-ID')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {connectedSheet?.id === file.id ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                Terhubung
                              </span>
                            ) : (
                              <button
                                onClick={() => handleConnectExisting(file.id)}
                                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-semibold transition-colors"
                              >
                                Hubungkan
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Create New or Manual URL */}
              {activeTab === 'new' && (
                <div className="space-y-4">
                  {/* Option 1: One-click Auto Create */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">Buat Spreadsheet Baru Otomatis</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Sistem akan langsung membuat Google Sheet berformat lengkap dengan 2 lembar:
                          <strong className="text-slate-800"> Master Data Ternak</strong> dan{' '}
                          <strong className="text-slate-800">Riwayat Penimbangan</strong>, lalu mengisi {goats.length} rekaman ternak saat ini.
                        </p>
                        <button
                          onClick={handleCreateNewSpreadsheet}
                          disabled={isProcessing}
                          className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-98 transition-all"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Buat & Sinkronkan Sekarang</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Paste manual link or ID */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">Hubungkan via Link / ID Spreadsheet</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tempel link Google Spreadsheet yang sudah Anda miliki (contoh: https://docs.google.com/spreadsheets/d/...)
                        </p>
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Tempel link Google Spreadsheet atau ID di sini..."
                            value={customSheetInput}
                            onChange={(e) => setCustomSheetInput(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            onClick={() => handleConnectExisting(customSheetInput)}
                            disabled={!customSheetInput.trim() || isProcessing}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
                          >
                            Hubungkan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2.5 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span className="font-semibold">{processMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>OAuth 2.0 resmi Google Workspace (Drive & Spreadsheets)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Explicit Confirmation Dialog for Destructive / Mutating Actions (Mandatory Skill Guideline) */}
      {pendingConfirmation && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {pendingConfirmation.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {pendingConfirmation.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPendingConfirmation(null)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={pendingConfirmation.action}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm ${
                  pendingConfirmation.type === 'export'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isProcessing ? 'Memproses...' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
