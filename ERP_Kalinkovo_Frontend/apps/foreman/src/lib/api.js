// src/lib/api.js
import { z } from 'zod';
import api from './axiosClient';
import {
  lfInitSeeds, lfWorkers, lfSites, lfTasks, lfCreateTask,
  lfAssign, lfAccept, lfProgress, lfComplete
} from './localFallback';

lfInitSeeds();

const useLocal = () =>
  !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL.startsWith('http://localhost:3');

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  operation: z.enum(['inbound','outbound']),
  apple_kind: z.enum(['unsorted','sorted']),
  category: z.string().nullable().optional(),
  apple_type: z.string(),
  qty_total: z.number().int().positive(),
  qty_done: z.number().int().nonnegative().default(0),
  from_site: z.string().nullable().optional(),
  to_site: z.string().nullable().optional(),
  status: z.enum(['pending','in_progress','completed']),
  accepted: z.boolean().optional(),
  worker_id: z.string().nullable().optional()
});
const TaskArray = z.array(TaskSchema);

const USER_ID = Number(import.meta.env.VITE_USER_ID || 0) || undefined;

export async function listWorkers(){
  if (useLocal()) return lfWorkers();
  const { data } = await api.get('/workers'); return data;
}
export async function listSites(){
  if (useLocal()) return lfSites();
  const { data } = await api.get('/sites'); return data;
}
export async function listTasks(){
  if (useLocal()) return TaskArray.parse(lfTasks());
  const { data } = await api.get(`/api/tasks`, {
    params: { role:'foreman', userId: USER_ID }
  });
  return TaskArray.parse(data);
}
export async function createTask(payload){
  if (useLocal()) return TaskSchema.parse(lfCreateTask(payload));
  const { data } = await api.post('/api/tasks', payload);
  return TaskSchema.parse(data);
}
export async function assignTask(taskId, workerId){
  if (useLocal()) return TaskSchema.parse(lfAssign(taskId, workerId));
  const { data } = await api.put(`/api/tasks/${taskId}/assign`, {
    forkliftUserId: Number(workerId)
  });
  return TaskSchema.parse(data);
}
export async function acceptTask(taskId){
  if (useLocal()) return TaskSchema.parse(lfAccept(taskId));
  const { data } = await api.put(`/api/tasks/${taskId}/accept-foreman`);
  return TaskSchema.parse(data);
}
export async function progressTask(taskId, delta){
  if (useLocal()) return TaskSchema.parse(lfProgress(taskId, delta));
  const { data } = await api.post(`/api/tasks/${taskId}/progress`, {
    performed_by: USER_ID, quantity: Number(delta)
  });
  return data;
}
export async function completeTask(taskId){
  if (useLocal()) return TaskSchema.parse(lfComplete(taskId));
  const { data } = await api.put(`/api/tasks/${taskId}/complete`);
  return data;
}
