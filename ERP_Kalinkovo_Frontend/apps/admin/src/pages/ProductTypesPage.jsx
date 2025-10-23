import { useEffect, useState, useMemo } from "react";
import { productTypesApi } from "../api";

export default function ProductTypesPage() {
  const [types, setTypes] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", is_active: true });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const toBool = (v) => v === true || v === 1 || v === "1";

  async function load() {
    setStatus("loading");
    try {
      const data = await productTypesApi.list();
      setTypes(Array.isArray(data) ? data.map((x) => ({ ...x, is_active: toBool(x.is_active) })) : []);
      setStatus("ok");
    } catch (e) {
      console.error(e);
      setError(e?.message || "Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљР’В¦");
      setStatus("error");
    }
  }

  useEffect(() => { load(); }, []);

  function openModal(row = null) {
    setEditing(row);
    setForm(row ? { name: row.name, is_active: toBool(row.is_active) } : { name: "", is_active: true });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), is_active: !!form.is_active };
      if (editing) await productTypesApi.update(editing.id, payload);
      else await productTypesApi.create(payload);
      setModalOpen(false);
      await load();
    } catch (e) {
      alert(e?.message || "Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Р В Р’В Р В РІвЂљВ¬Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂќ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В° "${row.name}"?`)) return;
    setDeletingId(row.id);
    try {
      await productTypesApi.remove(row.id);
      await load();
    } catch (e) {
      alert(e?.message || "Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р Р‹Р РЋРІР‚СљР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ");
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount = useMemo(() => types.filter((t) => toBool(t.is_active)).length, [types]);

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Р В Р’В Р РЋРЎвЂєР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂќР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Р В Р’В Р РЋРІР‚в„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљР’В¦: {activeCount}</span>
          <button
            onClick={() => openModal()}
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            + Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°
          </button>
        </div>
      </div>

      {status === "loading" && <div className="text-gray-500">Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦</div>}

      {status === "error" && (
        <div className="text-red-600 bg-red-50 border border-red-300 rounded p-3">
          <div>{error}</div>
          <button
            onClick={load}
            className="mt-3 px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700"
          >
            Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°
          </button>
        </div>
      )}

      {status === "ok" && (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ</th>
                <th className="border p-2 text-left">Р В Р’В Р РЋРІР‚в„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦</th>
                <th className="border p-2 text-left w-40">Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ</th>
              </tr>
            </thead>
            <tbody>
              {types.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 p-3">
                    Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљРЎв„ў Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљР’В¦
                  </td>
                </tr>
              ) : (
                types.map((t) => (
                  <tr key={t.id} className="odd:bg-white even:bg-gray-50">
                    <td className="border p-2">{t.id}</td>
                    <td className="border p-2">{t.name}</td>
                    <td className="border p-2">{t.is_active ? "Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р вЂ™Р’В°" : "Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљРЎв„ў"}</td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(t)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1 rounded"
                        >
                          Р В Р’В Р вЂ™Р’ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          disabled={deletingId === t.id}
                          className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1 rounded disabled:opacity-60"
                        >
                          {deletingId === t.id ? "Р В Р’В Р В РІвЂљВ¬Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦" : "Р В Р’В Р В РІвЂљВ¬Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                {editing ? "Р В Р’В Р вЂ™Р’ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂќ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°" : "Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂќ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°"}
              </h2>
              <button
                onClick={() => !saving && setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°"
              >
                Р В Р вЂ Р РЋРЎв„ўР Р†Р вЂљРЎС›
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                  disabled={saving}
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, is_active: e.target.checked }))
                  }
                  disabled={saving}
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Р В Р’В Р РЋРІР‚в„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
                  disabled={saving}
                >
                  Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦" : "Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
