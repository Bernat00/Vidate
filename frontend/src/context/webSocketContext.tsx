import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useToast } from './toastContext';
import { useAuth } from './authContext';

export type WebSocketMessage = {
  type: string;
  payload: unknown;
};

type WebSocketHandler = (message: WebSocketMessage) => void;

interface WebSocketContextValue {
  subscribe: (handler: WebSocketHandler) => () => void;
  send: (message: WebSocketMessage) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;
const baseUrl = 'ws://localhost:8000/ws/main'

const getStoredToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToast();
  const auth = useAuth();
  const user = auth?.user;
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(new Set<WebSocketHandler>());
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const notifiedRef = useRef(false);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const closeSocket = useCallback(() => {
    clearReconnectTimer();
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const token = getStoredToken();
    if (!token) return;
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;
    // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = new URL(baseUrl);
    url.searchParams.set('token', token);
    const socket = new WebSocket(url.toString());
    wsRef.current = socket;

    socket.onopen = () => {
      reconnectAttemptsRef.current = 0;
      notifiedRef.current = false;
      console.log("Connected to ws")
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        handlersRef.current.forEach((handler) => handler(message));
      } catch {
        // ignore malformed messages
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onclose = () => {
      if (!getStoredToken()) return;
      console.log("Disconnected from ws")
      const attempts = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = attempts;

      if (attempts > MAX_RECONNECT_ATTEMPTS) {
        if (!notifiedRef.current) {
          showToast('Connection was lost to the server. Please check your internet connection.', 'error');
          notifiedRef.current = true;
        }
        return;
      }

      const delay = BASE_RECONNECT_DELAY_MS * attempts;
      clearReconnectTimer();
      reconnectTimerRef.current = window.setTimeout(() => connect(), delay);
    };
  }, [showToast]);

  useEffect(() => {
    if (!user) {
      closeSocket();
      return;
    }

    connect();
    return () => closeSocket();
  }, [closeSocket, connect, user]);

  const subscribe = useCallback((handler: WebSocketHandler) => {
    handlersRef.current.add(handler);
    return () => handlersRef.current.delete(handler);
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ subscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
};