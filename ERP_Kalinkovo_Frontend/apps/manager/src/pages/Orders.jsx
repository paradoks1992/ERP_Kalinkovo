// apps/manager/src/pages/Orders.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useOrdersStore } from "../state/useOrdersStore";
import { fixStringMaybe } from "../../../../fixEncoding";
import TaskModal from "../components/TaskModal";

export default function Orders() {
  const { orders, refresh, loading } = useOrdersStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [operationFilter, setOperationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortMode, setSortMode] = useState("date_desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "all") list = list.filter(o => o.status === statusFilter);
    if (operationFilter !== "all") list = list.filter(o => o.operation === operationFilter);
    if (categoryFilter !== "all") list = list.filter(o => String(o.category) === categoryFilter);

    if (sortMode === "date_asc")
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sortMode === "date_desc")
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortMode === "title")
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return list;
  }, [orders, statusFilter, operationFilter, categoryFilter, sortMode]);

  const openModal = (id) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold mb-2">Задачи менеджера</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white border rounded-xl2 p-3 shadow-sm">
        <Select label="Статус" value={statusFilter} onChange={setStatusFilter}
          options={[
            { value: "all", label: "Все" },
            { value: "pending", label: "Ожидает" },
            { value: "accepted", label: "Принята" },
            { value: "assigned", label: "Назначена" },
            { value: "in_progress", label: "В работе" },
            { value: "completed", label: "Завершена" },
            { value: "canceled", label: "Отменена" },
          ]} />

        <Select label="Операция" value={operationFilter} onChange={setOperationFilter}
          options={[
            { value: "all", label: "Все" },
            { value: "inbound", label: "Ввоз" },
            { value: "outbound", label: "Вывоз" },
          ]} />

        <Select label="Категория" value={categoryFilter} onChange={setCategoryFilter}
          options={[
            { value: "all", label: "Все" },
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
          ]} />

        <Select label="Сортировка" value={sortMode} onChange={setSortMode}
          options={[
            { value: "date_desc", label: "По дате ↓" },
            { value: "date_asc", label: "По дате ↑" },
            { value: "title", label: "По названию" },
          ]} />
      </div>

      {loading && <div className="p-4">Загрузка задач…</div>}
      {!loading && !filtered.length && <div className="p-4">Нет задач по выбранным фильтрам</div>}

      <div className="grid gap-3">
        {filtered.map((t) => (
          <button
            key={t.id}
            className="text-left rounded-lg border p-4 bg-white shadow-sm hover:shadow-md transition-all"
            onClick={() => openModal(t.id)}
          >
            <div className="font-medium text-brand-800">
              {fixStringMaybe(t.title || t.name || `Задача #${t.id}`)}
            </div>
            {t.description && (
              <div className="text-sm text-gray-600">
                {fixStringMaybe(t.description)}
              </div>
            )}
            <div className="text-xs text-gray-500 flex justify-between mt-1">
              <span>{fixStringMaybe(t.status || "in_progress")}</span>
              <span>
                {fixStringMaybe(
                  (t.operation === "inbound" ? "Ввоз" : "Вывоз") +
                  (t.category ? ` • Кат. ${t.category}` : "")
                )}
              </span>
            </div>
          </button>
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        taskId={selectedId}
        onClose={() => setModalOpen(false)}
        onUpdated={async () => { setModalOpen(false); await refresh(); }}
        onDeleted={async () => { setModalOpen(false); await refresh(); }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-brand-700">{label}</span>
      <select
        className="border border-brand-200 rounded-xl2 p-2 bg-white text-gray-800 focus:ring-2 focus:ring-brand-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}
