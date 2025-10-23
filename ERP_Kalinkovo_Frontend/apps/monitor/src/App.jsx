import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, useParams, useSearchParams, Link } from "react-router-dom";
import { autoLogin } from "./api"; // Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚СћР В Р’В Р Р†РІР‚С›РІР‚вЂњ api.js Р В Р’В Р В РІР‚В  Р В Р Р‹Р В Р Р‰Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’В Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В
import MonitorPage from "./pages/MonitorPage.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function StorageSelector() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [storages, setStorages] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        let token = null;
        try {
          token = await autoLogin();
        } catch {
          token = null;
        }

        const res = await fetch(`${API}/storages`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text().catch(()=>"")}`);

        const data = await res.json();
        if (!alive) return;

        const list = Array.isArray(data) ? data : [];
        list.sort((a, b) => {
          const an = (a.name || "").toString().toLowerCase();
          const bn = (b.name || "").toString().toLowerCase();
          if (an && bn && an !== bn) return an.localeCompare(bn, "ru");
          return (a.id || 0) - (b.id || 0);
        });

        setStorages(list);
      } catch (e) {
        console.error("[storages load]", e);
        if (alive) setErr(e?.message || "Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р РЋРІР‚СљР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р В Р вЂ° Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚Сњ Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-300">
        Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-400">
        <div className="mb-4">{err}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 rounded">
          Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°
        </button>
      </div>
    );
  }

  if (!storages.length) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-300">
        Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚Сњ Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В  Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ў.
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white py-10 px-6">
      <h1 className="text-2xl mb-6 font-semibold">Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚Сњ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl">
        {storages.map((s) => {
          const id = s.id ?? s.storage_id ?? s.storageId;
          const name = s.name || s.title || `Р В Р’В Р СћРЎвЂ™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚Сњ #${id}`;
          return (
            <Link
              key={`storage-${id}`}
              to={`/?storageId=${encodeURIComponent(id)}`}
              className="bg-gray-800 hover:bg-green-600 transition px-6 py-4 rounded-xl shadow text-left"
            >
              <div className="text-xl">Р РЋР вЂљР РЋРЎСџР вЂ™Р’В§Р В РІР‚В° {name}</div>
              <div className="text-sm text-gray-300 mt-1">ID: {id}</div>
              <div className="text-xs text-gray-400 mt-2">Р В Р’В Р РЋРІвЂћСћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏ Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ Р В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MonitorWrapperFromQuery() {
  const [sp] = useSearchParams();
  const qid = sp.get("storageId");
  const fallback = import.meta.env.VITE_MONITOR_ID ? String(import.meta.env.VITE_MONITOR_ID) : null;
  const storageId = useMemo(() => qid || fallback || null, [qid, fallback]);

  if (!storageId) return <StorageSelector />;
  return <MonitorPage storageId={storageId} />;
}

function MonitorWrapperFromParams() {
  const { id } = useParams();
  if (!id) return <StorageSelector />;
  return <MonitorPage storageId={id} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р В Р вЂ° Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В· query ?storageId= */}
        <Route path="/" element={<MonitorWrapperFromQuery />} />
        {/* Р В Р вЂ Р В РІР‚С™Р РЋРЎв„ўР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р вЂ Р В РІР‚С™Р РЋРЎС™ Р В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњ */}
        <Route path="/monitor/:id" element={<MonitorWrapperFromParams />} />
        {/* Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РЎвЂњР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™ */}
        <Route path="*" element={<StorageSelector />} />
      </Routes>
    </BrowserRouter>
  );
}
