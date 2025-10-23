import api from './axiosClient';
import { z } from 'zod';
import { enqueue, flushQueueIfOnline } from './offlineQueue';
import { withIdempotency } from './idempotency';

// схемы
export const StorageSchema = z.object({ id:z.number(), name:z.string() });
export const ProductTypeSchema = z.object({ id:z.number(), name:z.string(), sortable:z.boolean().optional() });
export const ProductSchema = z.object({ id:z.number(), name:z.string() });

// холодильники
export async function getStorages(){
  const { data } = await api.get('/api/storages');
  return z.array(StorageSchema).parse(data);
}

// "тип продукции" (яблоки/другое) — если на бэке нет, вернём дефолт
export async function getProductGroups(){
  try {
    const { data } = await api.get('/api/product-groups');
    return (Array.isArray(data) && data.length) ? data : [{ id:'apples', name:'Яблоки' }];
  } catch {
    return [{ id:'apples', name:'Яблоки' }];
  }
}

// вид яблок (сорт/несорт)
export async function getProductTypes(){
  const { data } = await api.get('/api/product-types');
  return z.array(ProductTypeSchema).parse(data);
}

// сорт яблок
export async function getProducts(){
  const { data } = await api.get('/api/products');
  return z.array(ProductSchema).parse(data);
}

// сколько доступно на складе под конкретные фильтры
export async function getAvailable(storageId, { productTypeId, productId, category }){
  const { data } = await api.get(`/api/storages/${storageId}/available`, { params: { productTypeId, productId, category } });
  return data?.available ?? 0;
}

// операции — с идемпотентностью и офлайном
export async function inbound(payload){
  const call = ({ headers }={}) => api.post('/api/batches/inbound', payload, { headers });
  const safeCall = withIdempotency(call, 'inbound');
  try {
    const { data } = await safeCall();
    flushQueueIfOnline();
    return data;
  } catch {
    await enqueue({ method:'POST', url:'/api/batches/inbound', data:payload });
    return { ok:true, queued:true };
  }
}
export async function outbound(payload){
  const call = ({ headers }={}) => api.post('/api/batches/outbound', payload, { headers });
  const safeCall = withIdempotency(call, 'outbound');
  try {
    const { data } = await safeCall();
    flushQueueIfOnline();
    return data;
  } catch {
    await enqueue({ method:'POST', url:'/api/batches/outbound', data:payload });
    return { ok:true, queued:true };
  }
}

// задачи
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
  const { data } = await api.post(`/api/tasks/${taskId}/progress`, { performed_by: USER_ID, quantity, comment: comment || null });
  return data;
}
export async function completeTask(taskId){
  const { data } = await api.put(`/api/tasks/${taskId}/complete`);
  return data;
}
