// apps/manager/src/components/TaskModal.jsx
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fixStringMaybe } from "../../../../fixEncoding";
import { getOrder, updateOrder, deleteOrder } from "../lib/api";

export default function TaskModal({ open, taskId, onClose, onUpdated, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("in_progress");
  const [comment, setComment] = useState("");

  // Загрузка деталей задачи
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!open || !taskId) return;
      setLoading(true);
      try {
        const res = await getOrder(taskId);
        if (!alive) return;
        // Ожидаем структуру { task, progress, remaining } из контроллера
        const t = res?.task || res;
        setData(t);
        setStatus(t?.status || "in_progress");
        setComment(t?.comment || "");
      } catch (e) {
        console.error("Ошибка загрузки задачи:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, taskId]);

  const canSave = !!data && (comment !== (data.comment || "") || status !== (data.status || ""));

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await updateOrder(data.id, { status, comment });
      onUpdated?.();
    } catch (e) {
      console.error("Ошибка сохранения:", e);
      alert("Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await updateOrder(data.id, { status: "completed" });
      onUpdated?.();
    } catch (e) {
      console.error("Ошибка завершения:", e);
      alert("Не удалось завершить задачу");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    if (!confirm("Удалить эту задачу безвозвратно?")) return;
    setRemoving(true);
    try {
      await deleteOrder(data.id);
      onDeleted?.();
    } catch (e) {
      console.error("Ошибка удаления:", e);
      alert("Не удалось удалить задачу");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className="absolute inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[560px] bg-white border border-brand-100 rounded-t-2xl sm:rounded-2xl shadow-xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold text-brand-800">
                  {data ? fixStringMaybe(data.title || `Задача #${data.id}`) : "Задача"}
                </div>
                <button className="px-3 py-1.5 rounded-xl2 border border-brand-200" onClick={onClose}>
                  Закрыть
                </button>
              </div>

              {loading && <div className="py-6 text-sm">Загрузка…</div>}

              {!loading && data && (
                <div className="space-y-3">
                  <Row label="ID">{data.id}</Row>
                  <Row label="Статус">
                    <select
                      className="border border-brand-200 rounded-xl2 p-2 bg-white"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="pending">Ожидает</option>
                      <option value="accepted">Принята</option>
                      <option value="assigned">Назначена</option>
                      <option value="in_progress">В работе</option>
                      <option value="completed">Завершена</option>
                      <option value="canceled">Отменена</option>
                    </select>
                  </Row>
                  <Row label="Комментарий">
                    <textarea
                      className="w-full min-h-[80px] border border-brand-200 rounded-xl2 p-2"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Заметки, уточнения…"
                    />
                  </Row>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      className="px-4 py-2 rounded-xl2 border border-brand-200"
                      onClick={onClose}
                    >
                      Отмена
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl2 bg-brand-600 text-white disabled:opacity-60"
                      onClick={handleSave}
                      disabled={!canSave || saving}
                    >
                      {saving ? "Сохранение…" : "Сохранить"}
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl2 bg-emerald-600 text-white disabled:opacity-60"
                      onClick={handleComplete}
                      disabled={saving}
                    >
                      Завершить
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl2 bg-rose-600 text-white disabled:opacity-60"
                      onClick={handleDelete}
                      disabled={removing}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <div className="text-xs text-brand-600 mb-1">{label}</div>
      <div className="text-sm text-brand-900">{children}</div>
    </div>
  );
}
