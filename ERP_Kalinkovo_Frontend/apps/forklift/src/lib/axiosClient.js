import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
  withCredentials: true,
});

function isOffline(err) {
  return !!err.isAxiosError && !err.response;
}

async function retryRequest(error) {
  const cfg = error.config || {};
  if (!cfg.__retryCount) cfg.__retryCount = 0;

  const retriable =
    isOffline(error) ||
    (error.response && [502, 503, 504].includes(error.response.status));

  if (retriable && cfg.__retryCount < 2) {
    cfg.__retryCount += 1;
    const delay = 400 * Math.pow(2, cfg.__retryCount - 1);
    await new Promise((r) => setTimeout(r, delay));
    return http(cfg);
  }
  return Promise.reject(error);
}

http.interceptors.response.use((r) => r, retryRequest);

export default http;
