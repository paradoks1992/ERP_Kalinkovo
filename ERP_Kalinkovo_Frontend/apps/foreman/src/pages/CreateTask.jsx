// src/pages/CreateTask.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTask, listSites, listWorkers } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { useToaster } from '../components/Toaster';

const schema = z.object({
  title: z.string().min(2,'Название'),
  apple_kind: z.enum(['unsorted','sorted']),
  category: z.string().optional(),
  apple_type: z.string().min(1,'Сорт'),
  qty_total: z.coerce.number().int().positive(),
  operation: z.enum(['inbound','outbound']),
  from_site: z.string().optional(),
  to_site: z.string().optional(),
  worker_id: z.string().optional()
}).refine(val=>{
  if (val.operation==='inbound') return !!val.to_site;
  if (val.operation==='outbound') return !!val.from_site;
  return true;
}, { message:'Укажи направления', path:['operation'] });

export default function CreateTask(){
  const nav = useNavigate();
  const toast = useToaster();
  const { register, watch, handleSubmit, formState:{ errors, isSubmitting }, reset, setValue, getValues } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title:'', apple_kind:'unsorted', category:'', apple_type:'', qty_total:'',
      operation:'inbound', from_site:'', to_site:'', worker_id:''
    }
  });
  const op = watch('operation');
  const kind = watch('apple_kind');

  const [sites, setSites] = React.useState([]);
  const [workers, setWorkers] = React.useState([]);
  const [confirm, setConfirm] = React.useState(false);

  React.useEffect(()=>{ (async()=>{
    setSites(await listSites());
    setWorkers(await listWorkers());
  })(); },[]);

  const onSubmit = ()=> setConfirm(true);

  const onConfirm = async ()=>{
    const v = getValues();
    const payload = {
      title: v.title,
      operation: v.operation,
      apple_kind: v.apple_kind,
      category: v.apple_kind==='sorted' ? v.category : null,
      apple_type: v.apple_type,
      qty_total: Number(v.qty_total),
      from_site: v.operation==='outbound' ? v.from_site : null,
      to_site: v.operation==='inbound' ? v.to_site : null,
      worker_id: v.worker_id || null
    };
    try {
      await createTask(payload);
      toast.success('Задача создана');
      setConfirm(false);
      reset();
      nav('/');
    } catch {
      toast.error('Не удалось создать задачу. Проверьте подключение.');
    }
  };

  return (
    <div className="bg-white border border-brand-100 rounded-xl2 p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-brand-800">Новая задача карщику</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Название" error={errors.title?.message}>
          <input className="inp" {...register('title')} placeholder="Напр.: Ввоз несорт Айдаред в Х-8а"/>
        </Field>

        <Field label="Операция" error={errors.operation?.message}>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={`btn ${op==='inbound'?'ring-2 ring-brand-500':''}`} onClick={()=>setValue('operation','inbound')}>Ввоз</button>
            <button type="button" className={`btn ${op==='outbound'?'ring-2 ring-brand-500':''}`} onClick={()=>setValue('operation','outbound')}>Вывоз</button>
          </div>
        </Field>

        <Field label="Вид яблок">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={`btn ${kind==='unsorted'?'ring-2 ring-brand-500':''}`} onClick={()=>setValue('apple_kind','unsorted')}>Несортированные</button>
            <button type="button" className={`btn ${kind==='sorted'?'ring-2 ring-brand-500':''}`} onClick={()=>setValue('apple_kind','sorted')}>Сортированные</button>
          </div>
        </Field>

        {kind==='sorted' && (
          <Field label="Категория">
            <div className="flex gap-2">
              {['1','2','3'].map(c=>(
                <button key={c} type="button" className="btn" onClick={()=>setValue('category',c)}>{c}</button>
              ))}
              <input className="inp flex-1" {...register('category')} placeholder="1/2/3"/>
            </div>
          </Field>
        )}

        <Field label="Сорт яблок">
          <input className="inp" {...register('apple_type')} placeholder="Айдаред, Глостер…"/>
        </Field>

        <Field label="Количество (ящиков)">
          <input className="inp" {...register('qty_total')} inputMode="numeric" />
        </Field>

        {op==='outbound' && (
          <Field label="Откуда (склад/холодильник)">
            <select className="inp" {...register('from_site')}>
              <option value="">—</option>
              {sites.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        )}
        {op==='inbound' && (
          <Field label="Куда (склад/холодильник)">
            <select className="inp" {...register('to_site')}>
              <option value="">—</option>
              {sites.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        )}

        <Field label="Назначить карщика (необязательно)">
          <select className="inp" {...register('worker_id')}>
            <option value="">Пока не назначать</option>
            {workers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </Field>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl2 bg-brand-600 text-white disabled:opacity-60" disabled={isSubmitting}>Создать</button>
          <button type="button" className="px-4 py-2 rounded-xl2 border border-brand-200" onClick={()=>reset()}>Сброс</button>
        </div>
      </form>

      <ConfirmModal open={confirm} onCancel={()=>setConfirm(false)} onConfirm={onConfirm} confirmText="Создать">
        Проверьте данные задачи перед отправкой карщику.
      </ConfirmModal>

      <style>{`.inp{width:100%;border:1px solid #e5efe7;border-radius:1rem;padding:12px 14px;font-size:16px;outline:none} .inp:focus{border-color:#55a962;box-shadow:0 0 0 3px #e6f4ea} .btn{border:1px solid #e5efe7;padding:10px 14px;border-radius:12px;background:#fff}`}</style>
    </div>
  );
}

function Field({label,error,children}){
  return (
    <label className="block">
      <div className="mb-1 text-brand-700 font-medium">{label}</div>
      {children}
      {error && <div className="text-rose-700 mt-1">{String(error)}</div>}
    </label>
  );
}
