import React from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getStorages, getProductTypes, getProducts, getAvailable, outbound, progressTask } from "../lib/api";
import { useToaster } from "../components/Toaster";
import ConfirmModal from "../components/ConfirmModal";
import { useTasks } from "../context/TaskContext";
import TasksList from "../components/TasksList";

export default function OutboundForm() {
  const toast = useToaster();
  const { state } = useLocation();
  const preselectedStorageId = state?.storageId ? String(state.storageId) : "";

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      storageId: preselectedStorageId,
      productTypeId: "",
      category: "",
      productId: "",
      quantity: "",
      destination: "",
      destinationStorageId: "",
      carNumber: "",
      note: ""
    }
  });

  const { activeTask } = useTasks();
  const [storages, setStorages] = React.useState([]);
  const [types, setTypes] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [available, setAvailable] = React.useState(null);
  const [confirm, setConfirm] = React.useState(false);

  const values = watch();
  const selectedType = types.find((t) => String(t.id) === String(values.productTypeId));
  const isSorted = !!selectedType?.sortable;

  React.useEffect(() => {
    (async () => {
      try {
        setStorages(await getStorages());
        setTypes(await getProductTypes());
        setProducts(await getProducts());
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        if (values.storageId && values.productTypeId && values.productId) {
          const av = await getAvailable(Number(values.storageId), {
            productTypeId: Number(values.productTypeId),
            productId: Number(values.productId),
            category: values.category || null
          });
          setAvailable(Number(av) || 0);
        } else setAvailable(null);
      } catch { setAvailable(null); }
    })();
  }, [values.storageId, values.productTypeId, values.productId, values.category]);

  const onSubmit = () => {
    const qty = Number(values.quantity || 0);
    if (available != null && qty > available) { toast.error(`Нет столько на складе. Доступно: ${available}`); return; }
    if (values.destination === "car" && !values.carNumber) { toast.error("Укажите гос. номер автомобиля"); return; }
    setConfirm(true);
  };

  const doOutbound = async () => {
    try {
      const payload = {
        storageId: Number(values.storageId),
        productTypeId: Number(values.productTypeId),
        productId: Number(values.productId),
        category: values.category || null,
        quantity: Number(values.quantity),
        destination: values.destinationStorageId ? "fridge" : values.destination || null,
        destinationStorageId: values.destinationStorageId ? Number(values.destinationStorageId) : null,
        carNumber: values.destination === "car" ? values.carNumber : null,
        note: values.note || null
      };

      const res = await outbound(payload);

      if (
        activeTask &&
        activeTask.type === "outbound" &&
        Number(activeTask.storageId) === payload.storageId &&
        Number(activeTask.productTypeId) === payload.productTypeId &&
        Number(activeTask.productId) === payload.productId &&
        (activeTask.category || null) === (payload.category || null)
      ) {
        try { await progressTask(activeTask.id, payload.quantity, "Автоучёт из формы вывоза"); } catch {}
      }

      setConfirm(false);
      toast.success(res?.queued ? "Операция поставлена в очередь (оффлайн)" : "Вывоз выполнен");
    } catch {
      setConfirm(false);
      toast.error("Не удалось выполнить вывоз");
    }
  };

  const selectedFrom = storages.find((s) => String(s.id) === String(values.storageId));
  const selectedTo =
    storages.find((s) => String(s.id) === String(values.destinationStorageId))?.name ||
    (values.destination === "car" ? "Автомобиль" : values.destination === "market" ? "Торговая площадка" : "Холодильник");
  const selectedTypeName = types.find((t) => String(t.id) === String(values.productTypeId))?.name;
  const selectedProduct = products.find((p) => String(p.id) === String(values.productId))?.name;

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-4 text-brand-800">Вывоз</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Field label="Откуда (холодильник)">
          <select className="select" {...register("storageId")} required>
            <option value="">—</option>
            {storages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>

        <Field label="Вид яблок">
          <select className="select" {...register("productTypeId")} required>
            <option value="">—</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {isSorted && (
            <div className="mt-2 flex gap-2">
              {["1", "2", "3"].map((c) => (
                <button type="button" key={c} className="btn btn-outline" onClick={() => setValue("category", c)}>{c}</button>
              ))}
              <input className="input flex-1" {...register("category")} placeholder="1/2/3" />
            </div>
          )}
        </Field>

        <Field label="Сорт яблок">
          <select className="select" {...register("productId")} required>
            <option value="">—</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>

        <Field label="Доступно сейчас">
          <div className="px-4 py-2 rounded-xl2 bg-brand-50 border border-brand-100">
            {available == null ? "—" : available}
          </div>
        </Field>

        <Field label="Количество (ящиков)">
          <input className="input" {...register("quantity")} inputMode="numeric" pattern="[0-9]*" required />
        </Field>

        <Field label="Куда">
          <select className="select" {...register("destination")} onChange={(e)=>{ setValue("destination", e.target.value); if (e.target.value !== "car") setValue("carNumber", ""); }}>
            <option value="">Холодильник</option>
            <option value="market">Торговая площадка</option>
            <option value="car">Автомобиль</option>
          </select>

          {values.destination === "" && (
            <div className="mt-2">
              <select className="select" {...register("destinationStorageId")}>
                <option value="">— выберите холодильник —</option>
                {storages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {values.destination === "car" && (
            <div className="mt-2">
              <input className="input" {...register("carNumber")} placeholder="Гос. номер, напр. А123ВС-7" />
            </div>
          )}
        </Field>

        <Field label="Примечание (необязательно)">
          <input className="input" {...register("note")} placeholder="Комментарий к вывозу…" />
        </Field>

        <button className="btn btn-primary" disabled={isSubmitting}>Отправить</button>
      </form>

      <ConfirmModal open={confirm} onCancel={() => setConfirm(false)} onConfirm={doOutbound} confirmText="ОК">
        <div className="space-y-1">
          <Row k="Операция" v="Вывоз" />
          <Row k="Откуда" v={selectedFrom?.name || "—"} />
          <Row k="Вид" v={selectedTypeName || "—"} />
          {!!values.category && <Row k="Категория" v={values.category} />}
          <Row k="Сорт" v={selectedProduct || "—"} />
          <Row k="Количество" v={values.quantity || "—"} />
          <Row k="Куда" v={selectedTo || "—"} />
          {values.destination === "car" && <Row k="Гос. номер" v={values.carNumber || "—"} />}
          {!!values.note && <Row k="Примечание" v={values.note} />}
        </div>
      </ConfirmModal>

      <TasksList />
    </div>
  );
}

function Field({ label, children }) { return (<label className="block"><div className="label">{label}</div>{children}</label>); }
function Row({ k, v }) { return (<div className="flex justify-between gap-3 text-sm"><div className="text-slate-500">{k}</div><div className="font-medium text-slate-800">{v}</div></div>); }
