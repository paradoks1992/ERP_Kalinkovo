import React, { useEffect, useState } from "react";
import { autoLogin, monitorApi } from "../api";

function Card({ title, value, postfix }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="text-2xl font-semibold">{value}{postfix ? ` ${postfix}` : ""}</div>
    </div>
  );
}

export default function MonitorPage({ storageId }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        await autoLogin(storageId); // Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’В accessToken
        const json = await monitorApi.byStorage(storageId);
        if (!alive) return;
        setData(json);
      } catch (e) {
        console.error("[monitor load]", e);
        if (alive) setErr(e?.message || "Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљР’В¦");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [storageId]);

  const fmt = (v, empty = "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ") => (v === null || v === undefined || v === "" ? empty : v);

  let lastUpdate = "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ";
  if (data?.lastUpdated || data?.updated_at || data?.last_update) {
    const ts = data.lastUpdated || data.updated_at || data.last_update;
    const d = new Date(ts);
    lastUpdate = isNaN(d.getTime()) ? "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ" : d.toLocaleString();
  }

  const temp = fmt(data?.temperature);
  const humid = fmt(data?.humidity);
  const door = data?.doorStatus ?? data?.door ?? null;
  const doorText = door === true ? "Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°" : door === false ? "Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°" : "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ";
  const comp = data?.compressorStatus ?? data?.compressor ?? null;
  const compText = comp === true ? "Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В РІР‚в„–Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р Р‹Р Р†Р вЂљР’ВР В Р’В Р В РІР‚В¦" : comp === false ? "Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В РІР‚в„–Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р Р‹Р Р†Р вЂљР’ВР В Р’В Р В РІР‚В¦" : "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ";

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦</div>;
  }

  if (err) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <div className="mb-3">{err}</div>
        <a href="/" className="text-blue-600 underline">Р В Р вЂ Р Р†Р вЂљР’В Р РЋРІР‚в„ў Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚В Р В Р’В Р РЋРІР‚Сњ Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СњР В Р Р‹Р РЋРІР‚Сљ</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6 flex items-center gap-4">
        <a href="/" className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded">Р В Р вЂ Р Р†Р вЂљР’В Р РЋРІР‚в„ў Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚В</a>
        <h2 className="text-2xl font-semibold">
          Р В Р’В Р вЂ™Р’В Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™ Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ Р В Р’В Р СћРЎвЂ™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚Сњ {storageId}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Р В Р’В Р РЋРЎвЂєР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°" value={temp} postfix={temp === "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ" ? "" : "Р В РІР‚в„ўР вЂ™Р’В°C"} />
        <Card title="Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В¶Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°" value={humid} postfix={humid === "Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ" ? "" : "%"} />
        <Card title="Р В Р’В Р В Р вЂ№Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РЎвЂњ Р В Р’В Р СћРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚В" value={doorText} />
        <Card title="Р В Р’В Р РЋРІвЂћСћР В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™" value={compText} />
        <Card title="Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ" value={lastUpdate} />
      </div>
    </div>
  );
}
