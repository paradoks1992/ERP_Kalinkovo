// src/lib/api.js
import api from './axiosClient';
import { z } from 'zod';
import { enqueue, flushQueueIfOnline } from './offlineQueue';
import { withIdempotency } from './idempotency';

// Локальный режим: если API url не указан, остаёмся офлайн-френдли
const useLocal = () =>
  !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL.startsWith('http://localhost:3');

// Схемы для валидации (при желании можно расширить)
export const StorageSchema = z.object({ id:z.number(), name:z.string() });
export const ProductTypeSchema = z.object({ id:z.number(), name:z.string(), sortable:z.boolean().optional() });
export const ProductSchema = z.object({ id:z.number(), name:z.string() });

export async function getStorages(){
  const { data } = await api.get('/api/storages');
  return z.array(StorageSchema).parse(data);
}
export async function getProductTypes(){
  const { data } = await api.get('/api/product-types');
  return z.array(ProductTypeSchema).parse(data);
}
export async function getProducts(){
  const { data } = await api.get('/api/products');
  return z.array(ProductSchema).parse(data);
}
export async function getAvailable(storageId, { productTypeId, productId, category }){
  const { data } = await api.get(`/api/storages/${storageId}/available`, {
    params: { productTypeId, productId, category }
  });
  return data?.available ?? 0;
}

// операции ввоза/вывоза — с идемпотентностью и офлайном
export async function inbound(payload){
  const call = () => api.post('/api/batches/inbound', payload);
  const safeCall = withIdempotency(call, 'inbound');
  try {
    const { data } = await safeCall();
    flushQueueIfOnline();
    return data;
  } catch (e){
    // оффлайн — ставим в очередь
    await enqueue({ type:'inbound', payload });
    return { ok:true, queued:true };
  }
}
export async function outbound(payload){
  const call = () => api.post('/api/batches/outbound', payload);
  const safeCall = withIdempotency(call, 'outbound');
  try {
    const { data } = await safeCall();
    flushQueueIfOnline();
    return data;
  } catch (e){
    await enqueue({ type:'outbound', payload });
    return { ok:true, queued:true };
  }
}

// задачи, назначенные карщику
const USER_ID = Number(import.meta.env.VITE_USER_ID || 0) || undefined;

export async function listAssignedTasks(){
  const { data } = await api.get('/api/tasks', { params:{ role:'forklift', userId: USER_ID } });
  return data;
}
export async function acceptTask(taskId){
  const { data } = await api.put(`/api/tasks/${taskId}/accept-forklift`);
  return data;
}
export async function progressTask(taskId, quantity, comment){
  const { data } = await api.post(`/api/tasks/${taskId}/progress`, {
    performed_by: USER_ID, quantity, comment: comment || null
  });
  return data;
}
export async function completeTask(taskId){
  const { data } = await api.put(`/api/tasks/${taskId}/complete`);
  return data;
}
