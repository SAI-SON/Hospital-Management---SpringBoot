// Neon Realtime WebSocket Client Utility
export const NEON_REALTIME_CONFIG = {
  url: import.meta.env.VITE_NEON_REALTIME_URL || "wss://ep-polished-union-a1m82jqa.rt.c-1.ap-southeast-1.aws.neon.tech/"
};

/**
 * Initializes a WebSocket connection to Neon Realtime service
 * @param {Function} onMessage - Callback for incoming messages
 * @param {Function} onError - Callback for errors
 * @returns {WebSocket}
 */
export function connectNeonRealtime(onMessage, onError) {
  try {
    const ws = new WebSocket(NEON_REALTIME_CONFIG.url);

    ws.onopen = () => {
      console.log("[Neon Realtime] Connected successfully to:", NEON_REALTIME_CONFIG.url);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch {
        if (onMessage) onMessage(event.data);
      }
    };

    ws.onerror = (error) => {
      console.warn("[Neon Realtime] Connection error:", error);
      if (onError) onError(error);
    };

    ws.onclose = () => {
      console.log("[Neon Realtime] Connection closed");
    };

    return ws;
  } catch (err) {
    console.error("[Neon Realtime] Failed to initialize WebSocket:", err);
    return null;
  }
}

export default {
  NEON_REALTIME_CONFIG,
  connectNeonRealtime
};
