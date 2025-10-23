// apps/admin/src/pages/SystemStatusPage.jsx
import { useEffect, useState, useRef } from "react";
import { systemApi } from "../api";

export default function SystemStatusPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [intervalSec, setIntervalSec] = useState(60);
  const timerRef = useRef(null);

  async function load() {
    setStatus("loading");
    setError("");
    try {
      const d = await systemApi.status();
      setData(d);
      setStatus("ok");
      analyzeState(d);
    } catch (e) {
      const msg = e?.message || "Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В°";
      setError(msg);
      setStatus("error");
      logger.notifyCritical?.(`Р В Р вЂ Р РЋРЎС™Р В Р вЂ° System monitor: ${msg}`);
    }
  }

  // --- Р В Р’В Р РЋРІР‚в„ўР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В· Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚Сњ Р В Р’В Р РЋРІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљР’В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ
  function analyzeState(d) {
    if (!d) return;

    const db = d.database?.status;
    const cpu = d.system?.cpu_load_pct ?? 0;
    const mem = d.system?.memory?.usage_pct ?? 0;
    const disk = d.system?.disk_free_pct ?? null;

    if (db === "disconnected") {
      logger.notifyCritical?.("Р РЋР вЂљР РЋРЎСџР РЋРІвЂћСћР В Р С“ MSSQL Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦! Р В Р’В Р вЂ™Р’ВР В Р’В Р СћРІР‚ВР В Р Р‹Р Р†Р вЂљР’ВР В Р Р‹Р Р†Р вЂљРЎв„ў Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В РІР‚в„–Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦");
    }
    if (db === "connected" && d.database?.latency_ms > 2000) {
      logger.notifyWarning?.(`Р В Р вЂ Р РЋРІвЂћСћР вЂ™Р’В Р В РЎвЂ”Р РЋРІР‚ВР В Р РЏ Р В Р’В Р РЋРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚Сњ Р В Р’В Р Р†Р вЂљР’ВР В Р’В Р Р†Р вЂљРЎСљ: ${d.database.latency_ms} Р В Р’В Р РЋР’ВР В Р Р‹Р В РЎвЂњ`);
    }
    if (cpu > 90) logger.notifyWarning?.(`Р В Р вЂ Р РЋРІвЂћСћР вЂ™Р’В Р В РЎвЂ”Р РЋРІР‚ВР В Р РЏ Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В Р РЏ Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° CPU: ${cpu}%`);
    if (mem > 90) logger.notifyWarning?.(`Р В Р вЂ Р РЋРІвЂћСћР вЂ™Р’В Р В РЎвЂ”Р РЋРІР‚ВР В Р РЏ Р В Р’В Р вЂ™Р’ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋР’ВР В Р Р‹Р В Р РЏР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В: ${mem}%`);
    if (disk !== null && disk < 5)
      logger.notifyWarning?.(`Р В Р вЂ Р РЋРІвЂћСћР вЂ™Р’В Р В РЎвЂ”Р РЋРІР‚ВР В Р РЏ Р В Р’В Р В Р вЂ№Р В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В° Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В° Р В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’Вµ 5%`);

    // Р В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р В Р вЂ°Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚Сљ Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В  Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚В Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ
    if (db === "connected" && cpu < 70 && mem < 80) setIntervalSec(120);
    else setIntervalSec(30);
  }

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, intervalSec * 1000);
    return () => clearInterval(timerRef.current);
  }, [intervalSec]);

  const chip = (state) => {
    const map = {
      connected: "bg-green-100 text-green-800 border-green-300",
      disconnected: "bg-red-100 text-red-800 border-red-300",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };
    const cls = map[state] || "bg-gray-100 text-gray-800 border-gray-300";
    const label =
      state === "connected"
        ? "Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В РІР‚в„–Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ"
        : state === "disconnected"
        ? "Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В РІР‚в„–Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ"
        : state;
    return (
      <span className={`inline-block px-2 py-1 text-xs border rounded ${cls}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Р В Р’В Р РЋРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚вЂњ Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°</h1>
        <button
          onClick={load}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded"
        >
          Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°
        </button>
      </div>

      {status === "loading" && <div className="text-gray-500">Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦</div>}

      {status === "error" && (
        <div className="text-red-700 bg-red-50 border border-red-300 rounded p-3">
          <div className="font-medium mb-2">Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°</div>
          <div className="text-sm">{error}</div>
          <button
            onClick={load}
            className="mt-3 px-3 py-1 bg-gray-800 text-white rounded"
          >
            Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°
          </button>
        </div>
      )}

      {status === "ok" && data && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ</div>
              <div className="text-lg font-semibold">
                {data.app}{" "}
                <span className="text-gray-500">({data.version})</span>
              </div>
              <div className="text-sm text-gray-700 mt-1">
                Uptime: {data.uptime?.pretty}
              </div>
              <div className="text-xs text-gray-500">
                Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ: {new Date(data.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="border rounded p-3">
              <div className="text-sm text-gray-600 mb-2">Р В Р’В Р Р†Р вЂљР’ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В° Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљР’В¦</div>
              <div className="flex items-center gap-2">
                <div className="font-semibold">MSSQL:</div>
                {chip(data.database?.status)}
              </div>
              <div className="text-sm text-gray-700 mt-1">
                Р В Р’В Р В Р вЂ№Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™:{" "}
                <span className="font-mono">{data.database?.server}</span>
                <br />
                Р В Р’В Р Р†Р вЂљР’ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°:{" "}
                <span className="font-mono">{data.database?.database}</span>
                <br />
                Р В Р’В Р Р†Р вЂљРЎвЂќР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°:{" "}
                {data.database?.latency_ms != null
                  ? `${data.database.latency_ms} Р В Р’В Р РЋР’ВР В Р Р‹Р В РЎвЂњ`
                  : "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ"}
              </div>
            </div>
          </div>

          <div className="border rounded p-3">
            <div className="text-sm text-gray-600 mb-2">Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’В°</div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-gray-500">Р В Р’В Р СћРЎвЂ™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ў</div>
                <div className="font-mono">{data.system?.hostname}</div>
                <div className="text-xs text-gray-500">
                  {data.system?.platform} {data.system?.release}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">CPU</div>
                <div className={`text-sm ${data.system?.cpu_load_pct > 90 ? "text-red-600" : ""}`}>
                  Р В Р’В Р В РІР‚РЋР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™: {data.system?.cpu_count ?? "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ"}
                </div>
                <div className={`text-sm ${data.system?.cpu_load_pct > 90 ? "text-red-600" : ""}`}>
                  Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°:{" "}
                  {data.system?.cpu_load_pct != null
                    ? `${data.system.cpu_load_pct}%`
                    : "Р В Р’В Р В РІР‚В¦/Р В Р’В Р СћРІР‚В"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Р В Р’В Р РЋРЎСџР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋР’ВР В Р Р‹Р В Р РЏР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°</div>
                <div
                  className={`text-sm ${
                    data.system?.memory?.usage_pct > 90 ? "text-red-600" : ""
                  }`}
                >
                  RSS: {data.system?.memory?.rss_gb} Р В Р’В Р Р†Р вЂљРЎС™Р В Р’В Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·{" "}
                  {data.system?.memory?.total_gb} Р В Р’В Р Р†Р вЂљРЎС™Р В Р’В Р Р†Р вЂљР’В
                </div>
                <div
                  className={`text-sm ${
                    data.system?.memory?.usage_pct > 90 ? "text-red-600" : ""
                  }`}
                >
                  Р В Р’В Р вЂ™Р’ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ: {data.system?.memory?.usage_pct}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
