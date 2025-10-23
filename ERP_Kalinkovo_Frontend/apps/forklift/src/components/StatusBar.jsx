import React from "react";
import { useQueueStore } from "@/state/useQueueStore.js";

export default function StatusBar() {
  const { online, pendingCount, lastMessage } = useQueueStore();

  return (
    <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200">
      <div className="max-w-screen-md mx-auto px-3 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span
            className={
              "inline-block h-2.5 w-2.5 rounded-full " +
              (online ? "bg-emerald-500" : "bg-slate-400")
            }
            title={online ? "Онлайн" : "Офлайн"}
          />
          <span className="text-slate-600">
            {online ? "Онлайн" : "Офлайн: операции попадут в очередь"}
          </span>
        </div>
        <div className="text-slate-600">
          В очереди: <b>{pendingCount}</b>
        </div>
      </div>
      {lastMessage && (
        <div className="max-w-screen-md mx-auto px-3 pb-2 text-xs text-slate-500">
          {lastMessage}
        </div>
      )}
    </footer>
  );
}
