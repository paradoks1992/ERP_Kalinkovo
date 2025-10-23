// src/state/useTasksStore.js
import { create } from "zustand";
import { listTasks } from "../lib/api";

export const useTasksStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const foremanId = Number(import.meta.env.VITE_FOREMAN_ID || 0) || undefined;
      const data = await listTasks({ foremanId });
      set({ tasks: data, loading: false });
    } catch (e) {
      set({ error: e?.message || "Ошибка загрузки", loading: false });
    }
  },
}));
