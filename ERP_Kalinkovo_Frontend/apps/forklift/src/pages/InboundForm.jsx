// apps/forklift/src/pages/InboundForm.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  getStorages,
  getProductTypes,
  getProducts,
  inbound,
  progressTask,
} from "../lib/api";
import { useToaster } from "../components/Toaster";
import ConfirmModal from "../components/ConfirmModal";
import { useTasks } from "../context/TaskContext";
import TasksList from "../components/TasksList";

export default function InboundForm() {
  const toast = useToaster();
  const { state } = useLocation();
  const preselectedStorageId = state?.storageId ? String(state.storageId) : "";
  const preselectedProductTypeId = state?.productTypeId
    ? String(state.productTypeId)
    : "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      storageId: preselectedStorageId,
      productTypeId: preselectedProductTypeId,
      category: "",
      productId: "",
      quantity: "",
    },
  });

  const { activeTask } = useTasks();
  const [storages, setStorages] = React.useState([]);
  const [types, setTypes] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [confirm, setConfirm] = React.useState(false);
  const values = watch();

  React.useEffect(() => {
    (async () => {
      try {
        setStorages(await getStorages());
        setTypes(await getProductTypes());
        setProducts(await getProducts());
      } catch {}
    })();
  }, []);

  const onSubmit = () => setConfirm(true);

  const doInbound = async () => {
    try {
      const payload = {
        storageId: Number(values.storageId),
        productTypeId: Number(values.productTypeId),
        productId: Number(values.productId),
        category: values.category || null,
        quantity: Number(values.quantity),
      };
      const res = await inbound(payload);

      if (
        activeTask &&
        activeTask.type === "inbound" &&
        Number(activeTask.storageId) === payload.storageId &&
        Number(activeTask.productTypeId) === payload.productTypeId &&
        Number(activeTask.productId) === payload.productId &&
        (activeTask.category || null) === (payload.category || null)
      ) {
        try {
          await progressTask(
            activeTask.id,
            payload.quantity,
            "Автоучёт из формы ввоза"
          );
        } catch {}
      }

      setConfirm(false);
      toast.success(
        res?.queued
          ? "Операция поставлена в очередь (оффлайн)"
          : "Ввоз выполнен"
      );
    } catch {
      setConfirm(false);
      toast.error("Не удалось выполнить ввоз");
    }
  };

  const selectedType = types.find(
    (t) => String(t.id) === String(values.productTypeId)
  );
  const isSorted = !!selectedType?.sortable;

  const selectedStorage = storages.find(
    (s) => String(s.id) === String(values.storageId)
  );
  const selectedTypeName = selectedType?.name;
  const selectedProduct = products.find(
    (p) => String(p.id) === String(values.productId)
  )?.name;

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-4 text-brand-800">Ввоз</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Field label="Холодильник">
          <select className="select" {...register("storageId")} required>
            <option value="">—</option>
            {storages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Вид яблок">
          <select className="select" {...register("productTypeId")} required>
            <option value="">—</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {isSorted && (
            <div className="mt-2 flex gap-2">
              {["1", "2", "3"].map((c) => (
                <button
                  type="button"
                  key={c}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white"
                  onClick={() => setValue("category", c)}
                >
                  Категория {c}
                </button>
              ))}
              <input
                className="input flex-1"
                {...register("category")}
                placeholder="1/2/3"
              />
            </div>
          )}
        </Field>

        <Field label="Сорт яблок">
          <select className="select" {...register("productId")} required>
            <option value="">—</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Количество (ящиков)">
          <input
            className="input"
            {...register("quantity")}
            inputMode="numeric"
            pattern="[0-9]*"
            required
          />
        </Field>

        <button className="btn btn-primary" disabled={isSubmitting}>
          Отправить
        </button>
      </form>

      <ConfirmModal
        open={confirm}
        onCancel={() => setConfirm(false)}
        onConfirm={doInbound}
        confirmText="ОК"
      >
        <div className="space-y-1">
          <Row k="Операция" v="Ввоз" />
          <Row k="Холодильник" v={selectedStorage?.name || "—"} />
          <Row k="Вид" v={selectedTypeName || "—"} />
          {!!values.category && <Row k="Категория" v={values.category} />}
          <Row k="Сорт" v={selectedProduct || "—"} />
          <Row k="Количество" v={values.quantity || "—"} />
        </div>
      </ConfirmModal>

      {/* Задачи ниже формы */}
      <TasksList />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="label">{label}</div>
      {children}
    </label>
  );
}
function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <div className="text-slate-500">{k}</div>
      <div className="font-medium text-slate-800">{v}</div>
    </div>
  );
}
