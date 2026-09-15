import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoatRecord, FilterOptions, CatatanKesehatan, StatusKesehatanUtama, CatatanPakanHarian, RiwayatBobot } from './types';
import { loadGoats, saveGoats, resetToInitialData, exportGoatsToCSV, playBeepSound } from './utils/storage';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { GoatTable } from './components/GoatTable';
import { RfidScannerModal } from './components/RfidScannerModal';
import { GoatDetailModal } from './components/GoatDetailModal';
import { GoatFormModal } from './components/GoatFormModal';
import { HealthRecordModal } from './components/HealthRecordModal';
import { WeightRecordModal } from './components/WeightRecordModal';
import { FeedRecordModal } from './components/FeedRecordModal';
import { AnalyticsView } from './components/AnalyticsView';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { Radio, Plus, Layers } from 'lucide-react';

export default function App() {
  const [goats, setGoats] = useState<GoatRecord[]>(() => loadGoats());
  const [activeTab, setActiveTab] = useState<'data' | 'analytics'>('data');

  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchQuery: '',
    peternak: '',
    lokasi: '',
    bangsa: '',
    jenisKelamin: '',
    umur: '',
    statusKesehatan: '',
  });

  // Modals state
  const [isRfidScannerOpen, setIsRfidScannerOpen] = useState(false);
  const [selectedGoatForDetail, setSelectedGoatForDetail] = useState<GoatRecord | null>(null);
  const [isGoatFormOpen, setIsGoatFormOpen] = useState(false);
  const [goatToEdit, setGoatToEdit] = useState<GoatRecord | null>(null);
  const [newRfidPrefill, setNewRfidPrefill] = useState<string>('');
  const [goatForQuickWeight, setGoatForQuickWeight] = useState<GoatRecord | null>(null);
  const [goatForQuickHealth, setGoatForQuickHealth] = useState<GoatRecord | null>(null);
  const [goatForQuickFeed, setGoatForQuickFeed] = useState<GoatRecord | null>(null);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Persist goats on change
  const updateGoatsState = useCallback((updater: (prev: GoatRecord[]) => GoatRecord[]) => {
    setGoats((prev) => {
      const updated = updater(prev);
      saveGoats(updated);
      return updated;
    });
  }, []);

  // Handlers
  const handleSaveGoat = (goatToSave: GoatRecord) => {
    updateGoatsState((prev) => {
      const idx = prev.findIndex((g) => g.id === goatToSave.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = goatToSave;
        return next;
      } else {
        return [goatToSave, ...prev];
      }
    });

    // Update detail modal if open
    if (selectedGoatForDetail && selectedGoatForDetail.id === goatToSave.id) {
      setSelectedGoatForDetail(goatToSave);
    }

    showNotification(`Data ternak eartag #${goatToSave.nomorEartag} berhasil disimpan.`);
  };

  const handleDeleteGoat = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ternak ini dari sistem digital recording?')) {
      updateGoatsState((prev) => prev.filter((g) => g.id !== id));
      if (selectedGoatForDetail?.id === id) setSelectedGoatForDetail(null);
      showNotification('Data ternak berhasil dihapus.');
    }
  };

  const handleSaveWeight = (
    goatId: string, 
    newBobot: number, 
    tanggal: string, 
    catatan: string,
    pakanSaatTimbang?: string,
    lingkarDadaCm?: number,
    petugasPenimbang?: string
  ) => {
    updateGoatsState((prev) =>
      prev.map((g) => {
        if (g.id !== goatId) return g;
        const newHistory = [
          ...(g.riwayatBobot || []),
          { 
            id: `weight-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            tanggal, 
            bobot: newBobot, 
            catatan: catatan || 'Penimbangan berkala',
            pakanSaatTimbang,
            lingkarDadaCm,
            petugasPenimbang,
          },
        ];
        const updated = {
          ...g,
          bobotBadan: newBobot,
          riwayatBobot: newHistory,
          updatedAt: new Date().toISOString(),
        };
        if (selectedGoatForDetail?.id === goatId) {
          setSelectedGoatForDetail(updated);
        }
        return updated;
      })
    );
    showNotification(`Penimbangan berkala dicatat: bobot diperbarui menjadi ${newBobot} kg.`);
  };

  const handleSaveWeightRecord = (
    goatId: string,
    record: RiwayatBobot,
    recordIndex?: number
  ) => {
    updateGoatsState((prev) =>
      prev.map((g) => {
        if (g.id !== goatId) return g;
        const currentHistory = [...(g.riwayatBobot || [])];
        let newHistory: RiwayatBobot[];

        if (recordIndex !== undefined && recordIndex >= 0 && recordIndex < currentHistory.length) {
          // Edit mode
          newHistory = [...currentHistory];
          newHistory[recordIndex] = record;
        } else {
          // Add mode
          newHistory = [...currentHistory, record];
        }

        // Urutkan kronologis untuk mencari bobot terbaru
        const sorted = [...newHistory].sort(
          (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
        );
        const latestWeight = sorted.length > 0 ? sorted[sorted.length - 1].bobot : g.bobotBadan;

        const updated: GoatRecord = {
          ...g,
          bobotBadan: latestWeight,
          riwayatBobot: newHistory,
          updatedAt: new Date().toISOString(),
        };

        if (selectedGoatForDetail?.id === goatId) {
          setSelectedGoatForDetail(updated);
        }
        return updated;
      })
    );

    showNotification(
      recordIndex !== undefined
        ? `Data penimbangan tanggal ${record.tanggal} (${record.bobot} kg) berhasil diperbarui.`
        : `Data penimbangan baru tanggal ${record.tanggal} (${record.bobot} kg) berhasil ditambahkan.`
    );
  };

  const handleDeleteWeightRecord = (goatId: string, recordIndex: number) => {
    updateGoatsState((prev) =>
      prev.map((g) => {
        if (g.id !== goatId) return g;
        const currentHistory = [...(g.riwayatBobot || [])];
        const newHistory = currentHistory.filter((_, idx) => idx !== recordIndex);

        // Cari bobot terkini dari sisa data penimbangan
        const sorted = [...newHistory].sort(
          (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
        );
        const latestWeight = sorted.length > 0 ? sorted[sorted.length - 1].bobot : g.bobotBadan;

        const updated: GoatRecord = {
          ...g,
          bobotBadan: latestWeight,
          riwayatBobot: newHistory,
          updatedAt: new Date().toISOString(),
        };

        if (selectedGoatForDetail?.id === goatId) {
          setSelectedGoatForDetail(updated);
        }
        return updated;
      })
    );

    showNotification('Data penimbangan berhasil dihapus.');
  };

  const handleSaveHealthRecord = (
    goatId: string,
    record: CatatanKesehatan,
    newStatus: StatusKesehatanUtama
  ) => {
    updateGoatsState((prev) =>
      prev.map((g) => {
        if (g.id !== goatId) return g;
        const newHistory = [...(g.riwayatKesehatan || []), record];
        const updated = {
          ...g,
          statusKesehatan: newStatus,
          riwayatKesehatan: newHistory,
          updatedAt: new Date().toISOString(),
        };
        if (selectedGoatForDetail?.id === goatId) {
          setSelectedGoatForDetail(updated);
        }
        return updated;
      })
    );
    showNotification(`Pemeriksaan kesehatan (${record.jenisPenyakit}) berhasil dicatat.`);
  };

  const handleSaveFeedRecord = (goatId: string, record: CatatanPakanHarian) => {
    updateGoatsState((prev) =>
      prev.map((g) => {
        if (g.id !== goatId) return g;
        const currentFeedHistory = g.riwayatPakanHarian || [];
        const existingIdx = currentFeedHistory.findIndex((f) => f.id === record.id);
        let newFeedHistory: CatatanPakanHarian[];
        if (existingIdx >= 0) {
          newFeedHistory = [...currentFeedHistory];
          newFeedHistory[existingIdx] = record;
        } else {
          newFeedHistory = [...currentFeedHistory, record];
        }

        const updated = {
          ...g,
          riwayatPakanHarian: newFeedHistory,
          updatedAt: new Date().toISOString(),
        };
        if (selectedGoatForDetail?.id === goatId) {
          setSelectedGoatForDetail(updated);
        }
        return updated;
      })
    );
    showNotification(`Catatan pakan harian tanggal ${record.tanggal} berhasil disimpan.`);
  };

  const handleDeleteFeedRecord = (goatId: string, recordId: string) => {
    updateGoatsState((prev) =>
      prev.map((g) => {
        if (g.id !== goatId) return g;
        const newFeedHistory = (g.riwayatPakanHarian || []).filter((f) => f.id !== recordId);
        const updated = {
          ...g,
          riwayatPakanHarian: newFeedHistory,
          updatedAt: new Date().toISOString(),
        };
        if (selectedGoatForDetail?.id === goatId) {
          setSelectedGoatForDetail(updated);
        }
        return updated;
      })
    );
    showNotification('Catatan pakan harian berhasil dihapus.');
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Muat ulang dataset awal dari registrasi lapangan Sukamaju? Perubahan lokal akan dikembalikan.'
      )
    ) {
      const reset = resetToInitialData();
      setGoats(reset);
      setSelectedGoatForDetail(null);
      showNotification('Dataset berhasil dimuat ulang sesuai data lapangan asli.');
    }
  };

  const handleExportCsv = () => {
    exportGoatsToCSV(goats);
    showNotification('Data recording kambing berhasil diexport ke CSV.');
  };

  const handleImportGoatsFromSheets = (importedGoats: GoatRecord[]) => {
    updateGoatsState(() => importedGoats);
    setSelectedGoatForDetail(null);
    showNotification(`Berhasil mengimpor ${importedGoats.length} data kambing dari Google Sheets.`);
  };

  const handleQuickFilter = (type: string, value: string) => {
    setActiveTab('data');
    if (type === 'all') {
      setFilterOptions({
        searchQuery: '',
        peternak: '',
        lokasi: '',
        bangsa: '',
        jenisKelamin: '',
        umur: '',
        statusKesehatan: '',
      });
    } else {
      setFilterOptions((prev) => ({
        ...prev,
        [type]: value,
      }));
    }
  };

  // Existing farmers and locations for forms
  const existingPeternak = useMemo(() => {
    return Array.from(new Set(goats.map((g) => g.namaPeternak.trim()).filter(Boolean))).sort();
  }, [goats]);

  const existingLokasi = useMemo(() => {
    return Array.from(new Set(goats.map((g) => g.lokasi.trim()).filter(Boolean))).sort();
  }, [goats]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans pb-16 sm:pb-8 flex flex-col">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRfidScanner={() => setIsRfidScannerOpen(true)}
        onOpenAddModal={() => {
          setGoatToEdit(null);
          setNewRfidPrefill('');
          setIsGoatFormOpen(true);
        }}
        onExportCsv={handleExportCsv}
        onResetData={handleResetData}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        totalGoats={goats.length}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-700 animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full">
        
        {/* Top KPI Metrics */}
        <DashboardStats goats={goats} onSelectQuickFilter={handleQuickFilter} />

        {/* View Switcher: Data Table vs Analytics */}
        {activeTab === 'data' ? (
          <GoatTable
            goats={goats}
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
            onSelectGoat={(g) => setSelectedGoatForDetail(g)}
            onEditGoat={(g) => {
              setGoatToEdit(g);
              setIsGoatFormOpen(true);
            }}
            onDeleteGoat={handleDeleteGoat}
            onOpenQuickWeight={(g) => setGoatForQuickWeight(g)}
            onOpenQuickHealth={(g) => setGoatForQuickHealth(g)}
            onOpenFeedRecord={(g) => setGoatForQuickFeed(g)}
          />
        ) : (
          <AnalyticsView
            goats={goats}
            onFilterByBangsa={(b) => {
              handleQuickFilter('bangsa', b);
            }}
            onFilterByPeternak={(p) => {
              handleQuickFilter('peternak', p);
            }}
          />
        )}

      </main>

      {/* Floating Action Button for Mobile Field Recording */}
      <div className="fixed right-4 bottom-5 sm:hidden z-40 flex flex-col gap-2.5">
        <button
          onClick={() => setIsRfidScannerOpen(true)}
          className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xl border-2 border-white active:scale-95 transition-transform"
          title="Scan RFID Lapangan"
        >
          <Radio className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <RfidScannerModal
        isOpen={isRfidScannerOpen}
        onClose={() => setIsRfidScannerOpen(false)}
        goats={goats}
        onSelectGoat={(g) => {
          setSelectedGoatForDetail(g);
        }}
        onOpenQuickWeight={(g) => {
          setGoatForQuickWeight(g);
        }}
        onOpenQuickHealth={(g) => {
          setGoatForQuickHealth(g);
        }}
        onOpenFeedRecord={(g) => {
          setGoatForQuickFeed(g);
        }}
        onRegisterNewRfid={(rfid) => {
          setGoatToEdit(null);
          setNewRfidPrefill(rfid);
          setIsGoatFormOpen(true);
        }}
      />

      {selectedGoatForDetail && (
        <GoatDetailModal
          goat={selectedGoatForDetail}
          onClose={() => setSelectedGoatForDetail(null)}
          onOpenQuickWeight={(g) => {
            setGoatForQuickWeight(g);
          }}
          onOpenQuickHealth={(g) => {
            setGoatForQuickHealth(g);
          }}
          onOpenFeedRecord={(g) => {
            setGoatForQuickFeed(g);
          }}
          onEditGoat={(g) => {
            setGoatToEdit(g);
            setIsGoatFormOpen(true);
          }}
          onSaveWeightRecord={handleSaveWeightRecord}
          onDeleteWeightRecord={handleDeleteWeightRecord}
        />
      )}

      <GoatFormModal
        isOpen={isGoatFormOpen}
        onClose={() => {
          setIsGoatFormOpen(false);
          setGoatToEdit(null);
          setNewRfidPrefill('');
        }}
        onSave={handleSaveGoat}
        initialGoat={goatToEdit}
        existingPeternak={existingPeternak}
        existingLokasi={existingLokasi}
        initialRfidPrefill={newRfidPrefill}
      />

      <HealthRecordModal
        goat={goatForQuickHealth}
        onClose={() => setGoatForQuickHealth(null)}
        onSaveHealthRecord={handleSaveHealthRecord}
      />

      <WeightRecordModal
        goat={goatForQuickWeight}
        onClose={() => setGoatForQuickWeight(null)}
        onSaveWeight={handleSaveWeight}
        onSaveFeedRecord={handleSaveFeedRecord}
      />

      <FeedRecordModal
        goat={goatForQuickFeed}
        onClose={() => setGoatForQuickFeed(null)}
        onSaveFeedRecord={handleSaveFeedRecord}
        onDeleteFeedRecord={handleDeleteFeedRecord}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        goats={goats}
        onImportSuccess={handleImportGoatsFromSheets}
        onNotification={showNotification}
      />

    </div>
  );
}
