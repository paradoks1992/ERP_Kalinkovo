import { http } from "./axiosClient.js";

const KEY = "forklift-offline-queue";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

const listeners = new Set();

export function enqueue(reqConfig) {
  const list = read();
  list.push({ ...reqConfig, __queuedAt: Date.now() });
  write(list);
  listeners.forEach((l) => l(list.length));
}

export async function flushQueueIfOnline() {
  if (!navigator.onLine) return;
  const list = read();
  if (!list.length) return;
  const next = [];
  for (const item of list) {
    try {
      await http(item);
    } catch {
      next.push(item);
    }
  }
  write(next);
  listeners.forEach((l) => l(next.length));
}

export const offlineQueue = {
  onChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  size() {
    return read().length;
  },
  enqueue,
  flush: flushQueueIfOnline,
};

window.addEventListener("online", flushQueueIfOnline);
