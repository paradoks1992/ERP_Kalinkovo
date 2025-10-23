// src/pages/SelectOperationPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { getStorages, getProductTypes } from "../lib/api";

export default function SelectOperationPage() {
  const nav = useNavigate();
  const [storages, setStorages] = React.useState([]);
  const [types, setTypes] = React.useState([]);
  const [storageId, setStorageId] = React.useState("");
  const [productTypeId, setProductTypeId] = React.useState("");
  const [operation, setOperation] = React.useState("");

  const selectedType = React.useMemo(
    () => types.find((t) => String(t.id) === String(productTypeId)),
    [types, productTypeId]
  );
  const isApples =
    (selectedType?.name || "")
      .toLowerCase()
      .includes("яблок"); // "яблоки", "яблоко" — достаточно

  React.useEffect(() => {
    (async () => {
      try {
        setStorages(await getStorages());
        setTypes(await getProductTypes());
      } catch {
        setStorages([]);
        setTypes([]);
      }
    })();
  }, []);

  const go = () => {
    if (!storageId || !productTypeId || !operation) return;
    if (!isApples) return; // защитимся ещё раз
    nav(`/${operation}`, {
      state: { storageId: Number(storageId), productTypeId: Number(productTypeId) },
    });
  };

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-semibold text-brand-800">
        Выберите параметры
      </h2>

      <label className="block">
        <div className="label">Холодильник</div>
        <select
          className="select"
          value={storageId}
          onChange={(e) => setStorageId(e.target.value)}
        >
          <option value="">—</option>
          {storages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <div className="label">Тип продукции</div>
        <select
          className="select"
          value={productTypeId}
          onChange={(e) => setProductTypeId(e.target.value)}
        >
          <option value="">—</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {!!productTypeId && !isApples && (
          <div className="text-sm text-danger mt-1">
            Программа в разработке. Выберите другую продукцию (пока работает
            только «Яблоки»).
          </div>
        )}
      </label>

      <label className="block">
        <div className="label">Тип операции</div>
        <select
          className="select"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          disabled={!isApples}
        >
          <option value="">—</option>
          <option value="inbound">Ввоз</option>
          <option value="outbound">Вывоз</option>
        </select>
      </label>

      <button
        className="btn btn-primary"
        onClick={go}
        disabled={!storageId || !productTypeId || !operation || !isApples}
      >
        Продолжить
      </button>

      <p className="help">Ниже — список задач, если они назначены бригадиром.</p>
    </div>
  );
}
