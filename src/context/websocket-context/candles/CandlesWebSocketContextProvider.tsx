import { useAtom } from 'jotai';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChainId } from 'wagmi';

import { config } from 'config';
import { candlesWebSocketReadyAtom } from 'store/tv-chart.store';

import { createWebSocketWithReconnect } from '../createWebSocketWithReconnect';
import { WebSocketI } from '../types';
import { CandlesWebSocketContext, CandlesWebSocketContextI } from './CandlesWebSocketContext';
import { useCandlesWsMessageHandler } from './useCandlesWsMessageHandler';

let client: WebSocketI;

const PING_MESSAGE = JSON.stringify({ type: 'ping' });
const WS_ALIVE_TIMEOUT = 10_000;

export const CandlesWebSocketContextProvider = ({ children }: PropsWithChildren) => {
  const [isCandlesWebSocketReady, setCandlesWebSocketReadyAtom] = useAtom(candlesWebSocketReadyAtom);
  const chainId = useChainId();

  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [messagesToSend, setMessagesToSend] = useState<string[]>([]);

  const waitForPongRef = useRef(false);

  const handleWsMessage = useCandlesWsMessageHandler();

  const candlesWsUrl = useMemo(() => config.candlesWsUrl[`${chainId}`] || config.candlesWsUrl.default, [chainId]);

  useEffect(() => {
    if (client) {
      client.close();
    }

    client = createWebSocketWithReconnect(candlesWsUrl);
    client.onStateChange(setIsConnected);

    const handleMessage = (message: string) => {
      setMessages((prevState) => [...prevState, message]);
    };
    client.on(handleMessage);
    return () => {
      setIsConnected(false);
      setMessages([]);
      client.off(handleMessage);
    };
  }, [candlesWsUrl]);

  useEffect(() => {
    if (!isConnected) {
      setCandlesWebSocketReadyAtom(false);
    }
  }, [setCandlesWebSocketReadyAtom, isConnected]);

  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach(handleWsMessage);
      setMessages([]);
    }
  }, [messages, handleWsMessage]);

  useEffect(() => {
    if (client && isConnected && messagesToSend.length > 0) {
      messagesToSend.forEach(client.send);
      setMessagesToSend([]);
    }
  }, [isConnected, messagesToSend]);

  const send = useCallback(
    (message: string) => {
      if (client && isConnected) {
        client.send(message);
      } else {
        setMessagesToSend((prevState) => [...prevState, message]);
      }
    },
    [isConnected]
  );

  useEffect(() => {
    if (!client && !isConnected) {
      return;
    }

    let pingMessageTimeout = setTimeout(() => {
      if (client) {
        client.send(PING_MESSAGE);
        waitForPongRef.current = true;
        pingMessageTimeout = setTimeout(() => {
          if (client && waitForPongRef.current) {
            client.reconnect();
            waitForPongRef.current = false;
          }
        }, WS_ALIVE_TIMEOUT);
      }
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
