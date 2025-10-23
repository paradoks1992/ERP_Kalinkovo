// apps/admin/src/pages/StoragesMonitorPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storageStatsApi, storagesApi, authApi, tokens, external } from "../api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function TopProgress({ active, value }) {
  if (!active) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${value}%`,
        background:
          "linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(16,185,129,1) 100%)",
        zIndex: 1000,
        transition: "width .2s ease",
      }}
    />
  );
}

function Toast({ type = "info", text, onClose }) {
  if (!text) return null;
  const bg =
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : "bg-gray-800";
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`${bg} text-white shadow-lg rounded-lg px-4 py-3`}>
        <div className="flex items-center gap-3">
          <span>{text}</span>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            ?
          </button>
        </div>
      </div>
    </div>
  );
}

function StorageCard({ model, onClick, onOpenReal }) {
  const fill = model.total ?? 0;
  let bg = "bg-gray-200",
    icon = "?";
  if (fill < 50) {
    bg = "bg-green-100";
    icon = "??";
  } else if (fill < 90) {
    bg = "bg-yellow-100";
    icon = "??";
  } else {
    bg = "bg-red-100";
    icon = "??";
  }

  return (
    <div
      onClick={() => onClick(model.storage_id)}
      className={`cursor-pointer rounded-2xl shadow-sm p-4 transition transform hover:-translate-y-1 hover:shadow-lg border ${bg} ${
        model.highlight ? "animate-pulse" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold text-lg text-gray-800">
          {model.storage_name}
        </div>
        <div className="text-xl">{icon}</div>
      </div>
      <div className="text-sm text-gray-600 mt-1">
        {model.product_name || "??? ????????"}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        ???????: <span className="font-semibold">{fill}</span>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenReal(model.storage_id);
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ??????? ? ???????? ????????????
        </button>
      </div>
    </div>
  );
}

function MiniMonitorTable({ rows }) {
  if (!rows?.length)
    return <div className="text-gray-500 p-4">??? ??????</div>;

  const grouped = rows.reduce((acc, r) => {
    const key = r.product_name || "??? ????????";
    (acc[key] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-sm text-gray-800 border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">????</th>
            <th className="p-2 border">?????????</th>
            <th className="p-2 border">???????????????</th>
            <th className="p-2 border">?????????????</th>
            <th className="p-2 border">???????</th>
            <th className="p-2 border">????????</th>
            <th className="p-2 border">????????</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([sort, arr]) =>
            arr.map((r, i) => (
              <tr key={`${sort}-${r.product_type_id ?? r.id ?? i}`}>
                {i === 0 && (
                  <td
                    rowSpan={arr.length}
                    className="border p-2 font-semibold bg-gray-50"
                  >
                    {sort}
                  </td>
                )}
                <td className="border p-2 text-center">
                  {r.category || "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ"}
                </td>
                <td className="border p-2 text-center">{r.unsorted ?? 0}</td>
                <td className="border p-2 text-center">{r.sorted ?? 0}</td>
                <td className="border p-2 text-center font-semibold">
                  {r.total ?? 0}
                </td>
                <td className="border p-2 text-center">{r.in_today ?? 0}</td>
                <td className="border p-2 text-center">{r.out_today ?? 0}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StorageModal({ storageId, storageName, rows, onClose, onOpenReal }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-5xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          Р В Р’В Р вЂ™Р’В§
        </button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {storageName}
          </h2>
          <button
            onClick={() => onOpenReal(storageId)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ??????? ? ???????? ????????????
          </button>
        </div>
        <MiniMonitorTable rows={rows} />
      </div>
    </div>
  );
}

export default function StoragesMonitorPage() {
  const q = useQuery();
  const mode = q.get("mode") || "panel";
  const displayStorageId = q.get("storageId");
  const isDisplay = mode === "display" && displayStorageId;

  const [cards, setCards] = useState([]);
  const [allStats, setAllStats] = useState([]);
  const [status, setStatus] = useState("idle");
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [ts, setTs] = useState(null);
  const [openedId, setOpenedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [prevTotals, setPrevTotals] = useState({});
  const [progressActive, setProgressActive] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const progTimer = useRef(null);

  function openReal(storageId) {
    const url = `${external.MONITOR_URL}/?storageId=${encodeURIComponent(storageId)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function progressStart() {
    setProgressActive(true);
    setProgressValue(0);
    progTimer.current = setInterval(() => {
      setProgressValue((v) => (v < 90 ? v + 5 : v));
    }, 100);
  }
  function progressFinish() {
    clearInterval(progTimer.current);
    setProgressValue(100);
    setTimeout(() => setProgressActive(false), 300);
  }

  async function load() {
    try {
      if (status !== "ok") setStatus("loading");
      progressStart();
      const [stats, storages] = await Promise.all([
        storageStatsApi.list(),
        storagesApi.list(),
      ]);

      const map = new Map();
      storages.forEach((s) => {
        map.set(s.id, {
          storage_id: s.id,
          storage_name: s.name,
          product_name: s.product_name || "??? ????????",
          total: 0,
        });
      });
      stats.forEach((r) => {
        map.set(r.storage_id, { ...(map.get(r.storage_id) || {}), ...r });
      });

      const merged = Array.from(map.values());
      const newTotals = {};
      const highlights = {};
      for (const s of merged) {
        newTotals[s.storage_id] = s.total;
        if (prevTotals[s.storage_id] && prevTotals[s.storage_id] !== s.total) {
          highlights[s.storage_id] = true;
        }
      }

      setCards(
        merged.map((s) => ({ ...s, highlight: !!highlights[s.storage_id] }))
      );
      setAllStats(stats);
      setPrevTotals(newTotals);
      setTs(new Date());
      setStatus("ok");
    } catch (e) {
      console.error("load error:", e);
      setToast({ type: "error", text: "?????? ???????? ??????" });
    } finally {
      progressFinish();
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, isDisplay ? 5000 : 15000);
    return () => clearInterval(interval);
  }, [isDisplay]);

  // ----- ????? "?????????" ??????? ??????????? ???????????? -----
  if (isDisplay) {
    const rows = allStats.filter(
      (r) => String(r.storage_id) === String(displayStorageId)
    );
    const name =
      rows[0]?.storage_name ||
      cards.find((c) => String(c.storage_id) === String(displayStorageId))
        ?.storage_name ||
      `??????????? ${displayStorageId}`;
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <TopProgress active={progressActive} value={progressValue} />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
            <div className="text-gray-600">
              ??????????: {ts ? ts.toLocaleTimeString() : "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ"}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <MiniMonitorTable rows={rows} />
          </div>
        </div>
      </div>
    );
  }

  const filteredCards = useMemo(() => {
    const q = search.toLowerCase();
    return cards.filter((c) => {
      const matchName = !q || c.storage_name.toLowerCase().includes(q);
      const matchFill =
        filter === "all" ||
        (filter === "low" && c.total < 50) ||
        (filter === "medium" && c.total >= 50 && c.total < 90) ||
        (filter === "high" && c.total >= 90);
      return matchName && matchFill;
    });
  }, [cards, search, filter]);

  const openedRows = useMemo(
    () => allStats.filter((r) => r.storage_id === openedId),
    [allStats, openedId]
  );

  return (
    <div className="p-6">
      <TopProgress active={progressActive} value={progressValue} />
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <h1 className="text-lg font-semibold text-gray-800">
          ?????? ?????????????
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-700">{tokens.user?.login}</span>
          <button
            onClick={() => authApi.logout()}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            ?????
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="?????..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="all">???</option>
          <option value="low">??????</option>
          <option value="medium">???????</option>
          <option value="high">???????</option>
        </select>
        <button
          onClick={load}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          ????????
        </button>
      </div>

      {status === "ok" && (
        <>
          <div className="text-sm text-gray-500 mb-3">
            ????????? ??????????: {ts ? ts.toLocaleTimeString() : "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ"} | ?????
            ?????????????: {filteredCards.length}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredCards.map((m, index) => (
              <StorageCard
                key={m.storage_id ?? m.id ?? `card-${index}`}
                model={m}
                onClick={setOpenedId}
                onOpenReal={openReal}
              />
            ))}
          </div>

          {openedId && (
            <StorageModal
              storageName={
                cards.find((c) => c.storage_id === openedId)?.storage_name
              }
              storageId={openedId}
              rows={openedRows}
              onClose={() => setOpenedId(null)}
              onOpenReal={openReal}
            />
          )}
        </>
      )}

      <Toast
        type={toast.type}
        text={toast.text}
        onClose={() => setToast({ type: "", text: "" })}
      />
    </div>
  );
}

