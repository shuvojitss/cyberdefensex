import { useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';

/**
 * useEventStream — connects to the SSE endpoint and calls the provided
 * callback whenever the backend emits a matching event type.
 *
 * Usage:
 *   useEventStream('alerts.changed', () => refetchAlerts());
 *   useEventStream('*', (event) => console.log(event));
 *
 * The hook automatically reconnects if the connection drops.
 * Pass `null` as eventType to disable the stream.
 */
export default function useEventStream(eventType, onEvent) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!eventType) return null;

    const url = `${API_BASE_URL}/api/events`;
    const source = new EventSource(url);

    source.addEventListener(eventType === '*' ? 'message' : eventType, (e) => {
      if (callbackRef.current) {
        try {
          const data = e.data ? JSON.parse(e.data) : {};
          callbackRef.current({ event: eventType, data });
        } catch {
          callbackRef.current({ event: eventType, data: e.data });
        }
      }
    });

    // If we subscribed to a specific event, also listen for that event name
    if (eventType !== '*') {
      source.addEventListener('message', () => {
        // generic messages are ignored for specific subscriptions
      });
    }

    source.onerror = () => {
      source.close();
      // Reconnect after 3 seconds
      reconnectTimer.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    return source;
  }, [eventType]);

  useEffect(() => {
    const source = connect();

    return () => {
      if (source) source.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);
}
