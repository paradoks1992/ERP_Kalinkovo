// src/lib/localFallback.js
const KEY = "kalinkovo:foreman:tasks:v1";
const WK = "kalinkovo:foreman:workers:v1";
const SK = "kalinkovo:foreman:sites:v1";
const PK = "kalinkovo:foreman:products:v1";

function read(key, def) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? def;
  } catch {
    return def;
  }
}
function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function lfInitSeeds() {
  if (!localStorage.getItem(WK))
    write(WK, [
      { id: 101, name: "Карщик №1" },
      { id: 102, name: "Карщик №2" },
      { id: 103, name: "Карщик №3" },
    ]);
  if (!localStorage.getItem(SK))
    write(SK, ["3", "5", "7А", "7Б", "8А", "8Б", "Торговая площадка", "Автомобиль"]);
  if (!localStorage.getItem(PK))
    write(PK, [
      { id: 1, name: "Ред Чемпион" },
      { id: 2, name: "Гала" },
      { id: 3, name: "Голден" },
      { id: 4, name: "Айдаред" },
      { id: 5, name: "Джонаголд" },
      { id: 6, name: "Мутцу" },
      { id: 7, name: "Глостер" },
    ]);
  if (!localStorage.getItem(KEY)) write(KEY, []);
}

export const lfWorkers = () => read(WK, []);
export const lfSites = () => read(SK, []);
export const lfProducts = () => read(PK, []);
export const lfTasks = () => read(KEY, []);

export function lfCreateTask(t) {
  const list = lfTasks();
  const id = crypto.randomUUID();
  list.push({
    id,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    qty_done: 0,
    ...t,
  });
  write(KEY, list);
  return list[list.length - 1];
}

export function lfAssign(taskId, workerId, fromSite, toSite) {
  const list = lfTasks();
  const t = list.find((x) => x.id === taskId);
  if (t) {
    if (workerId !== undefined) t.worker_id = workerId;
    if (fromSite !== undefined) t.from_site = fromSite;
    if (toSite !== undefined) t.to_site = toSite;
    t.status = t.status === "pending" ? "assigned" : t.status;
    t.updated_at = new Date().toISOString();
    write(KEY, list);
  }
  return t;
}

export function lfAccept(taskId) {
  const list = lfTasks();
  const t = list.find((x) => x.id === taskId);
  if (t) {
    t.status = "in_progress";
    t.updated_at = new Date().toISOString();
    write(KEY, list);
  }
  return t;
}

export function lfProgress(taskId, delta) {
  const list = lfTasks();
  const t = list.find((x) => x.id === taskId);
  if (t) {
    t.qty_done = Math.max(0, Math.min(t.qty_total, (t.qty_done || 0) + delta));
    if (t.qty_done === t.qty_total) t.status = "completed";
    t.updated_at = new Date().toISOString();
    write(KEY, list);
  }
  return t;
}

export function lfComplete(taskId) {
  const list = lfTasks();
  const t = list.find((x) => x.id === taskId);
  if (t) {
    t.status = "completed";
    t.qty_done = t.qty_total;
    t.updated_at = new Date().toISOString();
    write(KEY, list);
  }
  return t;
}
