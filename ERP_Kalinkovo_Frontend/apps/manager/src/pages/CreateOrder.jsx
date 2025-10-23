// src/pages/CreateOrder.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { useToaster } from '../components/Toaster';
import { useOrdersStore } from '../state/useOrdersStore';
import { createOrder } from '../lib/api';

export default function CreateOrder() {
  const nav = useNavigate();
  const toast = useToaster();
  const refresh = useOrdersStore((s) => s.refresh);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset, getValues, setValue } = useForm({
    defaultValues: {
      title: '',
      operation: 'inbound',
      apple_kind: 'unsorted',
      category: '',
      apple_type: '',
      qty_total: '',
      from_site: '',
      to_site: '',
      customer: '',
      when: ''
    }
  });

  const op = watch('operation');
  const kind = watch('apple_kind');
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // 🧩 Простая безопасная валидация (без zod)
  const validatePayload = (v) => {
    if (!v.title?.trim()) return 'Введите название задачи';
    if (!v.apple_type?.trim()) return 'Укажите сорт яблок';
    if (!v.qty_total || isNaN(v.qty_total)) return 'Введите количество (числом)';
    if (v.operation === 'inbound' && !v.to_site?.trim()) return 'Укажите место назначения';
    if (v.operation === 'outbound' && !v.from_site?.trim()) return 'Укажите место отправления';
    return null;
  };

  const onConfirm = async () => {
    try {
      const v = getValues();
      const err = validatePayload(v);
      if (err) {
        toast.error(err);
        return;
      }

      const payload = {
        title: v.title,
        operation: v.operation,
        apple_kind: v.apple_kind,
        category: v.apple_kind === 'sorted' ? (v.category || null) : null,
        apple_type: v.apple_type,
        qty_total: Number(v.qty_total),
        from_site: v.operation === 'outbound' ? (v.from_site || null) : null,
        to_site: v.operation === 'inbound' ? (v.to_site || null) : null,
        customer: v.customer || null,
        when: v.when || null
      };

      await createOrder(payload);
      toast.success('Задача успешно создана и отправлена бригадиру');
      setConfirmOpen(false);
      reset();
      await refresh();
      nav('/');
    } catch (e) {
      console.error('Ошибка при создании задачи', e);
      toast.error('Не удалось создать задачу. Проверьте соединение или данные.');
    }
  };

  const onSubmit = () => setConfirmOpen(true);

  return (
    <div className="bg-white border border-brand-100 rounded-xl2 p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-brand-800">Новая задача бригадиру</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Название" error={errors.title?.message}>
          <input className="inp" {...register('title')} placeholder="Напр.: Ввоз несорт Айдаред в Х-8а" autoFocus />
        </Field>

        <Field label="Операция">
          <div className="grid grid-cols-2 gap-2">
            <button type="button"
              className={`btn ${op === 'inbound' ? 'ring-2 ring-brand-500' : ''}`}
              onClick={() => setValue('operation', 'inbound')}>Ввоз</button>
            <button type="button"
              className={`btn ${op === 'outbound' ? 'ring-2 ring-brand-500' : ''}`}
              onClick={() => setValue('operation', 'outbound')}>Вывоз</button>
          </div>
        </Field>

        <Field label="Вид яблок">
          <div className="grid grid-cols-2 gap-2">
            <button type="button"
              className={`btn ${kind === 'unsorted' ? 'ring-2 ring-brand-500' : ''}`}
              onClick={() => setValue('apple_kind', 'unsorted')}>Несортированные</button>
            <button type="button"
              className={`btn ${kind === 'sorted' ? 'ring-2 ring-brand-500' : ''}`}
              onClick={() => setValue('apple_kind', 'sorted')}>Сортированные</button>
          </div>
        </Field>

        {kind === 'sorted' && (
          <Field label="Категория">
            <div className="flex gap-2">
              {['1', '2', '3'].map(c => (
                <button key={c} type="button" className="btn" onClick={() => setValue('category', c)}>{c}</button>
              ))}
              <input className="inp flex-1" {...register('category')} placeholder="1/2/3" />
            </div>
          </Field>
        )}

        <Field label="Сорт яблок">
          <input className="inp" {...register('apple_type')} placeholder="Айдаред, Глостер…" />
        </Field>

        <Field label="Количество (ящиков)">
          <input className="inp" {...register('qty_total')} inputMode="numeric" />
        </Field>

        {op === 'outbound' && (
          <Field label="Откуда (склад/холодильник)">
            <input className="inp" {...register('from_site')} placeholder="Х-8а" />
          </Field>
        )}
        {op === 'inbound' && (
          <Field label="Куда (склад/холодильник)">
            <input className="inp" {...register('to_site')} placeholder="Х-8а" />
          </Field>
        )}

        <Field label="Данные клиента (необязательно)">
          <input className="inp" {...register('customer')} placeholder="Клиент, контакты…" />
        </Field>

        <Field label="Когда (необязательно)">
          <input className="inp" {...register('when')} placeholder="Сегодня 16:00" />
        </Field>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl2 bg-brand-600 text-white disabled:opacity-60" disabled={isSubmitting}>Создать</button>
          <button type="button" className="px-4 py-2 rounded-xl2 border border-brand-200" onClick={() => reset()}>Сброс</button>
        </div>
      </form>

      <ConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onConfirm}
        title="Подтвердить создание задачи"
        confirmText="Создать"
      >
        Проверьте данные: операция <b>{op === 'inbound' ? 'ввоз' : 'вывоз'}</b>, сорт <b>{watch('apple_type') || '—'}</b>, количество <b>{watch('qty_total') || '—'}</b>.
      </ConfirmModal>

      <style>{`.inp{width:100%;border:1px solid #e5efe7;border-radius:1rem;padding:12px 14px;font-size:16px;outline:none} .inp:focus{border-color:#55a962;box-shadow:0 0 0 3px #e6f4ea} .btn{border:1px solid #e5efe7;padding:10px 14px;border-radius:12px;background:#fff}`}</style>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-brand-700 font-medium">{label}</div>
      {children}
      {error && <div className="text-rose-700 mt-1">{String(error)}</div>}
    </label>
  );
}
