// src/state/useTasksStore.js
import { create } from 'zustand';
import { listTasks } from '../lib/api';

export const useTasksStore = create((set, get) => ({
  tasks: [],
  loading: false,
  _reqId: 0,
  refresh: async () => {
    const id = (get()._reqId || 0) + 1;
    set({ loading:true, _reqId:id });
    try {
      const data = await listTasks();
      if (get()._reqId === id) set({ tasks: data });
    } finally {
      if (get()._reqId === id) set({ loading:false });
    }
  }
}));
