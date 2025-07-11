import { useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(gameId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<Set<(message: WebSocketMessage) => void>>(new Set());

  useEffect(() => {
    if (!gameId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?gameId=${gameId}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        
        // Notify all registered handlers
        messageHandlers.current.forEach(handler => {
          handler(message);
        });
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [gameId]);

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const addMessageHandler = (handler: (message: WebSocketMessage) => void) => {
    messageHandlers.current.add(handler);
    
    return () => {
      messageHandlers.current.delete(handler);
    };
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    addMessageHandler
  };
}
