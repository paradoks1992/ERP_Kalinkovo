import React from "react";
import { useNavigate } from "react-router-dom";
import { getStorages, getProductGroups } from "../lib/api";

export default function SelectOperationPage() {
  const nav = useNavigate();
  const [storages, setStorages] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [storageId, setStorageId] = React.useState("");
  const [group, setGroup] = React.useState("");
  const [operation, setOperation] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try { setStorages(await getStorages()); } catch { setStorages([]); }
      try { setGroups(await getProductGroups()); } catch { setGroups([{ id:'apples', name:'Яблоки' }]); }
    })();
  }, []);

  const groupIsApples = group === "apples" || /яблок/i.test(group);

  const go = () => {
    if (!storageId || !operation || !group) return;
    if (!groupIsApples) return; // защита
    nav(`/${operation}`, { state: { storageId: Number(storageId) } });
  };

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-semibold text-brand-800">Выберите параметры</h2>

      <label className="block">
        <div className="label">Холодильник</div>
        <select className="select" value={storageId} onChange={(e) => setStorageId(e.target.value)}>
          <option value="">—</option>
          {storages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>

      <label className="block">
        <div className="label">Тип продукции</div>
        <select className="select" value={group} onChange={(e)=>setGroup(e.target.value)}>
          <option value="">—</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {!groupIsApples && group && (
          <p className="help mt-1 text-rose-600">Программа в разработке, выберите другую продукцию (пока поддерживаются только яблоки).</p>
        )}
      </label>

      <label className="block">
        <div className="label">Тип операции</div>
        <select className="select" value={operation} onChange={(e) => setOperation(e.target.value)} disabled={!groupIsApples}>
          <option value="">—</option>
          <option value="inbound">Ввоз</option>
          <option value="outbound">Вывоз</option>
        </select>
      </label>

      <button className="btn btn-primary" onClick={go} disabled={!storageId || !operation || !groupIsApples}>
        Продолжить
      </button>

      <p className="help">Ниже — список задач будет на формах ввоза/вывоза.</p>
    </div>
  );
}
