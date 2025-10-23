// apps/manager/src/lib/realtime.js
let eventSource = null;

/**
 * Подключает SSE-канал к /api/events и вызывает cb при новых данных.
 * Работает стабильно: автоматически переподключается при обрыве.
 */
export function connectRealtime(cb) {
  if (eventSource) return; // уже подключено

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/events`;
  eventSource = new EventSource(url, { withCredentials: true });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      cb?.(data);
    } catch (e) {
      console.warn('Некорректное сообщение SSE', event.data);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('SSE connection error', err);
    closeRealtime();
    setTimeout(() => connectRealtime(cb), 5000); // авто-переподключение
  };
}

export function closeRealtime() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}
