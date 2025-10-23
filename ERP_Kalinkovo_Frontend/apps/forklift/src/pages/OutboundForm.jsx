// apps/forklift/src/pages/OutboundForm.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  getStorages,
  getProductTypes,
  getProducts,
  getAvailable,
  outbound,
  progressTask,
} from "../lib/api";
import { useToaster } from "../components/Toaster";
import ConfirmModal from "../components/ConfirmModal";
import { useTasks } from "../context/TaskContext";
import TasksList from "../components/TasksList";

export default function OutboundForm() {
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
      destination: "", // ''=холодильник, 'market', 'car'
      destinationStorageId: "",
      carNumber: "",
      note: "",
    },
  });

  const { activeTask } = useTasks();

  const [storages, setStorages] = React.useState([]);
  const [types, setTypes] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [available, setAvailable] = React.useState(null);
  const [confirm, setConfirm] = React.useState(false);

  const values = watch();
  const selectedType = types.find(
    (t) => String(t.id) === String(values.productTypeId)
  );
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
            category: values.category || null,
          });
          setAvailable(Number(av) || 0);
        } else setAvailable(null);
      } catch {
        setAvailable(null);
      }
    })();
  }, [values.storageId, values.productTypeId, values.productId, values.category]);

  const onSubmit = () => {
    const qty = Number(values.quantity || 0);
    if (available != null && qty > available) {
      toast.error(`Нет столько на складе. Доступно: ${available}`);
      return;
    }
    if (values.destination === "car" && !values.carNumber) {
      toast.error("Укажите гос. номер автомобиля");
      return;
    }
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
        destinationStorageId: values.destinationStorageId
          ? Number(values.destinationStorageId)
          : null,
        carNumber: values.destination === "car" ? values.carNumber : null,
        note: values.note || null,
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
        try {
          await progressTask(
            activeTask.id,
            payload.quantity,
            "Автоучёт из формы вывоза"
          );
        } catch {}
      }

      setConfirm(false);
      toast.success(
        res?.queued
          ? "Операция поставлена в очередь (оффлайн)"
          : "Вывоз выполнен"
      );
    } catch {
      setConfirm(false);
      toast.error("Не удалось выполнить вывоз");
    }
  };

  const selectedFrom = storages.find(
    (s) => String(s.id) === String(values.storageId)
  );
  const selectedTo =
    storages.find((s) => String(s.id) === String(values.destinationStorageId))
      ?.name ||
    (values.destination === "car"
      ? "Автомобиль"
      : values.destination === "market"
      ? "Торговая площадка"
      : "Холодильник");
  const selectedTypeName = selectedType?.name;
  const selectedProduct = products.find(
