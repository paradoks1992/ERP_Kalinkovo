// Локальный «бекенд»: менеджер → бригадир
const MKEY = 'kalinkovo:orders:v1';
const FKEY = 'kalinkovo:tasks:v1'; // та же коллекция, что видит бригадир

function r(key, def){ try{ return JSON.parse(localStorage.getItem(key)) ?? def }catch{ return def } }
function w(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

export function lfOrders(){ return r(MKEY, []); }
export function lfCreateOrder(o){
  const orders = lfOrders();
  const rec = { ...o, id: crypto.randomUUID(), status:'pending', accepted:false };
  orders.push(rec); w(MKEY, orders);
  // создаём «черновик» задачи для бригадира (он увидит в своём приложении)
  const tasks = r(FKEY, []);
  tasks.push({
    id: crypto.randomUUID(),
    title: o.title,
    operation: o.operation,
    apple_kind: o.apple_kind,
    category: o.apple_kind==='sorted'?o.category:null,
    apple_type: o.apple_type,
    qty_total: o.qty_total,
    qty_done: 0,
    from_site: o.operation==='outbound'?o.from_site:null,
    to_site: o.operation==='inbound'?o.to_site:null,
    status: 'pending',
    accepted: false,
    origin_order_id: rec.id
  });
  w(FKEY, tasks);
  return rec;
}

export function lfMarkOrderInWork(orderId){
  const orders = lfOrders();
  const o = orders.find(x=>x.id===orderId);
  if (o){ o.status='in_progress'; w(MKEY, orders); }
  return o;
}
export function lfCompleteOrder(orderId){
  const orders = lfOrders();
  const o = orders.find(x=>x.id===orderId);
  if (o){ o.status='completed'; w(MKEY, orders); }
  return o;
}
