// apps/manager/src/lib/axiosClient.js
import axios from "axios";
import { fixDeep } from "../../../../fixEncoding";

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:3000";

const client = axios.create({
  baseURL,
  withCredentials: true,
  transformResponse: [
    ...axios.defaults.transformResponse,
    (data) => {
      try {
        return fixDeep(data);
      } catch {
        return data;
      }
    },
  ],
});

client.interceptors.response.use(
  (resp) => resp,
  (error) => Promise.reject(error)
);

export default client;
