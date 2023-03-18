import { useAtom } from 'jotai';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { config } from 'config';
import { candlesWebSocketReadyAtom } from 'store/pools.store';

import { createWebSocketWithReconnect } from '../createWebSocketWithReconnect';
import { CandlesWebSocketContext, CandlesWebSocketContextI } from './CandlesWebSocketContext';
import { useCandlesWsMessageHandler } from './useCandlesWsMessageHandler';

const client = createWebSocketWithReconnect(config.candlesWsUrl);

const PING_MESSAGE = JSON.stringify({ type: 'ping' });
const WS_ALIVE_TIMEOUT = 10_000;

export const CandlesWebSocketContextProvider = ({ children }: PropsWithChildren) => {
  const [isCandlesWebSocketReady, setCandlesWebSocketReadyAtom] = useAtom(candlesWebSocketReadyAtom);

  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(client.isConnected());
  const [messagesToSend, setMessagesToSend] = useState<string[]>([]);

  const waitForPongRef = useRef(false);

  const handleWsMessage = useCandlesWsMessageHandler();

  useEffect(() => {
    if (!isConnected) {
      setCandlesWebSocketReadyAtom(false);
    }
  }, [setCandlesWebSocketReadyAtom, isConnected]);

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

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    let pingMessageTimeout = setTimeout(() => {
      client.send(PING_MESSAGE);
      waitForPongRef.current = true;
      pingMessageTimeout = setTimeout(() => {
        if (waitForPongRef.current) {
          client.reconnect();
          waitForPongRef.current = false;
        }
      }, WS_ALIVE_TIMEOUT);
    }, WS_ALIVE_TIMEOUT);

    return () => {
      clearTimeout(pingMessageTimeout);
      waitForPongRef.current = false;
    };
  }, [messages, isConnected]);

  const contextValue: CandlesWebSocketContextI = useMemo(
    () => ({
      isConnected: isCandlesWebSocketReady,
      send,
    }),
    [isCandlesWebSocketReady, send]
  );

  return <CandlesWebSocketContext.Provider value={contextValue}>{children}</CandlesWebSocketContext.Provider>;
};
