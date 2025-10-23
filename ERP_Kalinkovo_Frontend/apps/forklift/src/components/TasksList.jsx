// src/components/TasksList.jsx
import React from "react";
import { useTasks } from "@/context/TaskContext";

export default function TasksList() {
  const { tasks, activeTask, setActiveTask, accept, complete } = useTasks();

  if (!tasks?.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-brand-800 mb-2">Задачи от бригадира</h3>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded-xl2 border ${
              activeTask?.id === t.id
                ? "border-brand-400 bg-brand-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">
                #{t.id} — {t.type === "inbound" ? "Ввоз" : "Вывоз"}:{" "}
                {t.productName} ({t.productTypeName}
                {t.category ? `/кат.${t.category}` : ""})
              </div>
              <div className="text-sm text-slate-600">
                Осталось: <b>{t.remaining}</b>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              {t.fromName ? <>Откуда: {t.fromName}. </> : null}
              {t.toName ? <>Куда: {t.toName}. </> : null}
            </div>
            <div className="mt-2 flex gap-2">
              {!t.accepted && (
                <button
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-brand-50"
                  onClick={() => accept(t.id)}
                >
                  Принять
                </button>
              )}
              <button
                className={`px-3 py-1.5 rounded-lg border ${
                  activeTask?.id === t.id
                    ? "border-brand-400 bg-brand-100"
                    : "border-slate-300 bg-white hover:bg-brand-50"
                }`}
                onClick={() => setActiveTask(t)}
              >
                {activeTask?.id === t.id ? "Активная" : "Сделать активной"}
              </button>
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-green-50"
                onClick={() => complete(t.id)}
              >
                Выполнена
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
