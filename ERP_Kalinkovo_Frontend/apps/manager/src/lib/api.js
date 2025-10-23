// apps/manager/src/lib/api.js
import client from "./axiosClient";

export async function getProfile() {
  const { data } = await client.get("/api/profile");
  return data;
}

export async function getOrders(params = {}) {
  const { data } = await client.get("/api/tasks", { params });
  return data;
}

export async function getOrder(id) {
  const { data } = await client.get(`/api/tasks/${id}`);
  return data;
}

export async function createOrder(payload) {
  const { data } = await client.post("/api/tasks", payload);
  return data;
}

export async function updateOrder(id, payload) {
  const { data } = await client.patch(`/api/tasks/${id}`, payload);
  return data;
}

export async function deleteOrder(id) {
  const { data } = await client.delete(`/api/tasks/${id}`);
  return data;
}

export async function exportOrders(format = "excel", params = {}) {
  const { data } = await client.get(`/api/tasks/export/${format}`, {
    params,
    responseType: "blob",
  });
  return data;
}
