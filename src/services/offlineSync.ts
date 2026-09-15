import { useState, useEffect, useCallback } from 'react';

export interface OfflineQueueItem {
  id: string;
  timestamp: string; // ISO string
  action: 'TAMBAH_TERNAK' | 'EDIT_TERNAK' | 'HAPUS_TERNAK' | 'TIMBANG_BOBOT' | 'CATAT_MEDIS' | 'CATAT_PAKAN' | 'CATAT_BIRAHI';
  nomorEartag: string;
  namaPeternak: string;
  deskripsi: string;
  synced: boolean;
}

const OFFLINE_QUEUE_KEY = 'rfid_offline_sync_queue_v1';
const LAST_SYNC_KEY = 'rfid_last_sync_timestamp';

export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline queue:', e);
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Error saving offline queue:', e);
  }
}

export function addToOfflineQueue(item: {
  action: OfflineQueueItem['action'];
  nomorEartag: string;
  namaPeternak?: string;
  deskripsi: string;
}): OfflineQueueItem {
  const queue = getOfflineQueue();
  const newItem: OfflineQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action: item.action,
    nomorEartag: item.nomorEartag,
    namaPeternak: item.namaPeternak || 'Peternak Lapangan',
    deskripsi: item.deskripsi,
    synced: false,
  };

  const updatedQueue = [newItem, ...queue].slice(0, 100); // keep up to 100 recent entries
  saveOfflineQueue(updatedQueue);

  // Dispatch custom event for reactive UI updates
  window.dispatchEvent(new CustomEvent('rfid_offline_queue_updated'));
  return newItem;
}

export function markQueueAsSynced(): number {
  const queue = getOfflineQueue();
  const pendingCount = queue.filter((q) => !q.synced).length;
  const updatedQueue = queue.map((q) => ({ ...q, synced: true }));
  saveOfflineQueue(updatedQueue);
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  window.dispatchEvent(new CustomEvent('rfid_offline_queue_updated'));
  return pendingCount;
}

export function clearSyncedHistory(): void {
  const queue = getOfflineQueue().filter((q) => !q.synced);
  saveOfflineQueue(queue);
  window.dispatchEvent(new CustomEvent('rfid_offline_queue_updated'));
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

/**
 * Hook untuk memantau status koneksi online/offline dan antrean data lapangan
 */
export function useOfflineSync(onAutoSyncSuccess?: (syncedCount: number) => void) {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queue, setQueue] = useState<OfflineQueueItem[]>(() => getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => getLastSyncTime());

  const refreshQueue = useCallback(() => {
    setQueue(getOfflineQueue());
    setLastSyncTime(getLastSyncTime());
  }, []);

  const pendingItems = queue.filter((item) => !item.synced);
  const pendingCount = pendingItems.length;

  // Manual or automatic sync execution
  const executeSync = useCallback(async (): Promise<{ success: boolean; count: number }> => {
    if (!navigator.onLine) {
      return { success: false, count: 0 };
    }

    setIsSyncing(true);
    // Simulate brief reliable handshake verification
    await new Promise((resolve) => setTimeout(resolve, 800));

    const count = markQueueAsSynced();
    refreshQueue();
    setIsSyncing(false);

    if (count > 0 && onAutoSyncSuccess) {
      onAutoSyncSuccess(count);
    }

    return { success: true, count };
  }, [onAutoSyncSuccess, refreshQueue]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // When connection is restored, automatically synchronize pending changes!
      const currentQueue = getOfflineQueue();
      const count = currentQueue.filter((q) => !q.synced).length;
      if (count > 0) {
        executeSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = () => {
      refreshQueue();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('rfid_offline_queue_updated', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('rfid_offline_queue_updated', handleQueueChange);
    };
  }, [executeSync, refreshQueue]);

  return {
    isOnline,
    queue,
    pendingItems,
    pendingCount,
    isSyncing,
    lastSyncTime,
    executeSync,
    clearSyncedHistory: () => {
      clearSyncedHistory();
      refreshQueue();
    },
  };
}
