import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { createWebSocketWithReconnect } from './createWebSocketWithReconnect';
import { WebSocketContext, WebSocketContextI } from './WebSocketContext';
import { useWsMessageHandler } from './useWsMessageHandler';

const client = createWebSocketWithReconnect();

export const WebSocketContextProvider = ({ children }: PropsWithChildren) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(client.isConnected());
  const [messagesToSend, setMessagesToSend] = useState<string[]>([]);

  const handleWsMessage = useWsMessageHandler();

  useEffect(() => {
    return client.onStateChange(setIsConnected);
  }, []);

  useEffect(() => {
    const handleMessage = (message: string) => {
      setMessages((prevState) => [...prevState, message]);
    };
    client.on(handleMessage);
    return () => client.off(handleMessage);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach(handleWsMessage);
      setMessages([]);
    }
  }, [messages, handleWsMessage]);

  useEffect(() => {
    if (isConnected && messagesToSend.length > 0) {
      messagesToSend.forEach(client.send);
      setMessagesToSend([]);
    }
  }, [isConnected, messagesToSend]);

  const send = useCallback(
    (message: string) => {
      if (isConnected) {
        client.send(message);
      } else {
        setMessagesToSend((prevState) => [...prevState, message]);
      }
    },
    [isConnected]
  );

  const contextValue: WebSocketContextI = useMemo(
    () => ({
      isConnected,
      send,
    }),
    [isConnected, send]
  );

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};
