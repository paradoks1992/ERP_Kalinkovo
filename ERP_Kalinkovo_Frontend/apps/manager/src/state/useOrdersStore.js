// apps/manager/src/state/useOrdersStore.js
import { create } from "zustand";
import { getOrders } from "../lib/api";
import { connectRealtime } from "../lib/realtime";

export const useOrdersStore = create((set, get) => ({
  orders: [],
  loading: false,
  _reqId: 0,

  // 🔄 Обновление списка задач
  refresh: async () => {
    const id = (get()._reqId || 0) + 1;
    set({ loading: true, _reqId: id });
    try {
      const data = await getOrders();
      if (get()._reqId === id) {
        set({ orders: Array.isArray(data) ? data : data?.items || [] });
      }
    } catch (err) {
      console.error("Ошибка при загрузке задач:", err);
    } finally {
      if (get()._reqId === id) set({ loading: false });
    }
  },

  // 🔔 Реальное время через SSE
  initRealtime: () => {
    connectRealtime((evt) => {
      // если пришло обновление задач/заказов — перезагрузить
      if (evt?.type === "order_updated" || evt?.type === "task_updated") {
        get().refresh();
      }
    });
  },
}));

// Автоподключение SSE при старте
useOrdersStore.getState().initRealtime();
