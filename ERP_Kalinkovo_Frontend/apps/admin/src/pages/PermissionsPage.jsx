import { useEffect, useState, useCallback } from "react";
import { permissionsApi } from "../api";

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState({});
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [dirty, setDirty] = useState(false);

  const roles = [
    "admin",
    "manager",
    "foreman",
    "forklift",
    "executive",
    "monitor",
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setStatus("Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљР’В¦...");
      const [roleData, keyList] = await Promise.all([
        permissionsApi.roles(),
        permissionsApi.keys(),
      ]);
      setMatrix(roleData);
      setKeys(keyList);
      setStatus("");
    } catch (e) {
      console.error("[Permissions load error]", e);
      setStatus("Р В Р вЂ Р РЋРЎС™Р В Р вЂ° Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function toggle(role, key) {
    setMatrix((m) => ({
      ...m,
      [role]: { ...m[role], [key]: !m[role]?.[key] },
    }));
    setDirty(true);
  }

  const save = useCallback(async () => {
    try {
      setSaving(true);
      setStatus("Р РЋР вЂљР РЋРЎСџР Р†Р вЂљРІвЂћСћР РЋРІР‚Сћ Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ...");
      await permissionsApi.updateRoles(matrix);
      setStatus("Р В Р вЂ Р РЋРЎв„ўР Р†Р вЂљР’В¦ Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В° Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“");
      setDirty(false);
    } catch (e) {
      console.error("[Permissions save error]", e);
      setStatus("Р В Р вЂ Р РЋРЎС™Р В Р вЂ° Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ: " + e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(""), 4000);
    }
  }, [matrix]);

  // Р РЋР вЂљР РЋРЎСџР Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂє Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњ
  async function handleSync() {
    try {
      setStatus("Р РЋР вЂљР РЋРЎСџР Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂє Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњ...");
      const res = await permissionsApi.sync();
      setStatus(`Р В Р вЂ Р РЋРЎв„ўР Р†Р вЂљР’В¦ ${res.message || "Р В Р’В Р Р†Р вЂљРЎС™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚Сћ"} (Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ ${res.updated})`);
      await loadData();
    } catch (e) {
      console.error("[Permissions sync error]", e);
      setStatus("Р В Р вЂ Р РЋРЎС™Р В Р вЂ° Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В: " + e.message);
    } finally {
      setTimeout(() => setStatus(""), 4000);
    }
  }

  // Ctrl+S Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљРЎв„ў
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (dirty && !saving) save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dirty, saving, save]);

  useEffect(() => {
    const beforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  if (loading)
    return <div className="p-6 text-gray-600 animate-pulse">Р В Р вЂ Р В Р РЏР РЋРІР‚вЂњ Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р Р†РІР‚С›РІР‚вЂњ...</div>;

  if (status?.startsWith("Р В Р вЂ Р РЋРЎС™Р В Р вЂ°"))
    return (
      <div className="p-6 text-red-700">
        {status}
        <button
          onClick={loadData}
          className="ml-4 px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-700"
        >
          Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°
        </button>
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В° Р В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏР В Р’В Р РЋР’В</h1>

        <div className="flex gap-3">
          <button
            onClick={handleSync}
            className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white"
          >
            Р РЋР вЂљР РЋРЎСџР Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂє Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњ
          </button>

          <button
            onClick={save}
            disabled={!dirty || saving}
            className={`px-4 py-2 rounded text-white ${
              saving
                ? "bg-blue-400 cursor-wait"
                : dirty
                ? "bg-blue-700 hover:bg-blue-800"
                : "bg-gray-500 cursor-default"
            }`}
          >
            {saving ? "Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ..." : dirty ? "Р РЋР вЂљР РЋРЎСџР Р†Р вЂљРІвЂћСћР РЋРІР‚Сћ Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°" : "Р В Р вЂ Р РЋРЎв„ўР Р†Р вЂљР’В¦ Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ"}
          </button>
        </div>
      </div>

      {status && !status.startsWith("Р В Р вЂ Р РЋРЎС™Р В Р вЂ°") && (
        <div className="mb-3 text-sm text-gray-600">{status}</div>
      )}

      <div className="overflow-auto border rounded shadow">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left border-r">Р В Р’В Р РЋРІвЂћСћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В РІР‚в„–Р В Р Р‹Р Р†Р вЂљР Р‹ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ</th>
              {roles.map((r) => (
                <th key={r} className="p-2 text-center border-r capitalize">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-2 font-mono text-xs border-r">{key}</td>
                {roles.map((r) => (
                  <td key={r} className="p-2 text-center border-r">
                    <input
                      type="checkbox"
                      checked={!!matrix[r]?.[key]}
                      onChange={() => toggle(r, key)}
                      className="cursor-pointer accent-blue-600"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dirty && (
        <div className="mt-3 text-yellow-700 text-sm">
          Р В Р вЂ Р РЋРІвЂћСћР вЂ™Р’В Р В РЎвЂ”Р РЋРІР‚ВР В Р РЏ Р В Р’В Р Р†Р вЂљРЎС›Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В¦Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљР’ВР В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ
        </div>
      )}
    </div>
  );
}
