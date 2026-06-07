import { create } from "zustand";
import { backupApi, deviceApi, type BackupInfo, type DeviceInfo } from "@/api/backup";
import { useAuthStore } from "./authStore";

interface BackupState {
  backups: BackupInfo[];
  devices: DeviceInfo[];
  latestBackup: BackupInfo | null;
  isLoading: boolean;
  isBacking: boolean;
  isRestoring: boolean;
  error: string | null;

  fetchHistory: () => Promise<void>;
  fetchLatest: () => Promise<void>;
  createBackup: (data: Record<string, unknown>) => Promise<void>;
  restoreBackup: (id: string) => Promise<Record<string, unknown>>;
  deleteBackup: (id: string) => Promise<void>;
  fetchDevices: () => Promise<void>;
  clearError: () => void;
}

export const useBackupStore = create<BackupState>((set, get) => ({
  backups: [],
  devices: [],
  latestBackup: null,
  isLoading: false,
  isBacking: false,
  isRestoring: false,
  error: null,

  fetchHistory: async () => {
    if (!useAuthStore.getState().isLoggedIn) return;
    set({ isLoading: true });
    try {
      const res = await backupApi.history(0, 50);
      set({ backups: res.data.content, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchLatest: async () => {
    if (!useAuthStore.getState().isLoggedIn) return;
    try {
      const res = await backupApi.latest();
      set({ latestBackup: res.data });
    } catch {
      // No backup yet, not an error
    }
  },

  createBackup: async (data) => {
    set({ isBacking: true, error: null });
    try {
      const json = JSON.stringify(data, null, 2);
      await backupApi.upload(json);
      set({ isBacking: false });
      // Refresh history
      get().fetchHistory();
      get().fetchLatest();
    } catch (e: any) {
      set({ error: e.message, isBacking: false });
      throw e;
    }
  },

  restoreBackup: async (id) => {
    set({ isRestoring: true, error: null });
    try {
      const data = await backupApi.download(id);
      set({ isRestoring: false });
      return data;
    } catch (e: any) {
      set({ error: e.message, isRestoring: false });
      throw e;
    }
  },

  deleteBackup: async (id) => {
    try {
      await backupApi.delete(id);
      set((state) => ({
        backups: state.backups.filter((b) => b.id !== id),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchDevices: async () => {
    if (!useAuthStore.getState().isLoggedIn) return;
    try {
      const res = await deviceApi.list();
      set({ devices: res.data });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  clearError: () => set({ error: null }),
}));
