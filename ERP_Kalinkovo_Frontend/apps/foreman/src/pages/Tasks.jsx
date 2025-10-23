// src/pages/Tasks.jsx
import React from 'react';
import { useTasksStore } from '../state/useTasksStore';
import { listWorkers, assignTask, acceptTask, progressTask, completeTask } from '../lib/api';
import { useToaster } from '../components/Toaster';
import ConfirmModal from '../components/ConfirmModal';

export default function Tasks(){
  const { tasks, loading, refresh } = useTasksStore();
  const toast = useToaster();
  const [workers, setWorkers] = React.useState([]);
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [confirm, setConfirm] = React.useState({ open:false, id:null });

  React.useEffect(()=>{ refresh(); listWorkers().then(setWorkers); },[refresh]);

  const filtered = tasks.filter(t=>{
    const okQ = q.trim()
      ? [t.title,t.apple_type,t.from_site,t.to_site].filter(Boolean)
          .some(v=>String(v).toLowerCase().includes(q.toLowerCase()))
      : true;
    const okS = status==='all' ? true : t.status===status;
    return okQ && okS;
  });

  const safe = async (fn, okMsg) => {
    try { await fn(); await refresh(); toast.success(okMsg); }
    catch { toast.error('Операция не выполнена. Проверьте подключение.'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-brand-800">Задачи</h2>
        <div className="ml-auto flex gap-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск…" className="px-3 py-1.5 rounded-lg border border-brand-200 bg-white" />
          <select value={status} onChange={e=>setStatus(e.target.value)} className="px-3 py-1.5 rounded-lg border border-brand-200 bg-white">
            <option value="all">Все</option>
            <option value="pending">В ожидании</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Выполнены</option>
          </select>
          <button className="px-3 py-1.5 rounded-lg border border-brand-200" onClick={refresh} disabled={loading}>Обновить</button>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map(t=>(
          <div key={t.id} className="bg-white border border-brand-100 rounded-xl2 p-4 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-lg font-semibold">{t.title}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeClass(t.status)}`}>{statusLabel(t.status)}</span>
              {t.accepted && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">принята</span>}
              <div className="ml-auto text-sm opacity-70">
                {t.operation==='inbound'?'Ввоз':'Вывоз'} • {t.apple_kind==='sorted' ? `сорт (кат. ${t.category||'—'})` : 'несорт'} • {t.apple_type}
              </div>
            </div>

            <div className="mt-2 text-sm">
              {t.operation==='inbound' ? <>Куда: <b>{t.to_site||'—'}</b></> : <>Откуда: <b>{t.from_site||'—'}</b></>} • Общее: {t.qty_total} • Сделано: {t.qty_done||0}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <AssignSelect task={t} workers={workers} onChange={(wid)=>safe(()=>assignTask(t.id,wid),'Назначен карщик')}/>
              <button className="btn" onClick={()=>safe(()=>acceptTask(t.id),'Задача принята')} disabled={t.status!=='pending'}>Принять</button>
              <button className="btn" onClick={()=>safe(()=>progressTask(t.id,5),'+5 учтено')} disabled={t.status==='completed'}>+5 ящ.</button>
              <button className="btn" onClick={()=>setConfirm({open:true,id:t.id})} disabled={t.status==='completed' || (t.qty_done===t.qty_total)}>Завершить</button>
            </div>
          </div>
        ))}
        {!filtered.length && !loading && <div className="text-brand-700">Ничего не найдено.</div>}
      </div>

      <ConfirmModal
        open={confirm.open}
        onCancel={()=>setConfirm({open:false,id:null})}
        onConfirm={()=>safe(()=>completeTask(confirm.id),'Задача завершена').then(()=>setConfirm({open:false,id:null}))}
        title="Завершить задачу?"
        confirmText="Завершить"
      >
        Убедитесь, что фактически перевезено всё количество.
      </ConfirmModal>

      <style>{`.btn{border:1px solid #e5efe7;padding:8px 12px;border-radius:12px;background:#fff}`}</style>
    </div>
  );
}

function AssignSelect({ task, workers, onChange }){
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Карщик:</span>
      <select className="border border-brand-200 rounded-lg px-2 py-1" value={task.worker_id||''} onChange={(e)=>onChange(e.target.value)}>
        <option value="">—</option>
        {workers.map(w=> <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
    </div>
  );
}
function badgeClass(st){
  if (st==='pending') return 'bg-amber-50 text-amber-700 border-amber-100';
  if (st==='in_progress') return 'bg-sky-50 text-sky-700 border-sky-100';
  return 'bg-emerald-50 text-emerald-700 border-emerald-100';
}
function statusLabel(st){
  if (st==='pending') return 'в ожидании';
  if (st==='in_progress') return 'в работе';
  return 'выполнена';
}
