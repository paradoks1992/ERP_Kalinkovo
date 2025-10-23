import { create } from "zustand";
import { persist } from "zustand/middleware";
import { offlineQueue } from "@/lib/offlineQueue.js";

export const useQueueStore = create(
  persist(
    (set, get) => ({
      online: navigator.onLine,
      pendingCount: 0,
      lastMessage: "",
      initOfflineQueue() {
        offlineQueue.onChange((size) => set({ pendingCount: size }));
        set({ pendingCount: offlineQueue.size() });

        const setOnline = () => set({ online: true });
        const setOffline = () => set({ online: false });

        window.addEventListener("online", setOnline);
        window.addEventListener("offline", setOffline);
      },
      setLastMessage(msg) {
        set({ lastMessage: msg });
        // автоочистка
        if (msg) setTimeout(() => set({ lastMessage: "" }), 4000);
      }
    }),
    { name: "forklift-ui" }
  )
);
