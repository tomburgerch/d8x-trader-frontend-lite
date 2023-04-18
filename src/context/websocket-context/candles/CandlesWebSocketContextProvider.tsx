import { useAtom } from 'jotai';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { useChainId } from 'wagmi';

import { config } from 'config';
import { candlesWebSocketReadyAtom } from 'store/tv-chart.store';

import { createWebSocketWithReconnect } from '../createWebSocketWithReconnect';
import { WebSocketI } from '../types';
import { CandlesWebSocketContext, CandlesWebSocketContextI } from './CandlesWebSocketContext';
import { useCandlesWsMessageHandler } from './useCandlesWsMessageHandler';
import { usePingPong } from '../hooks/usePingPong';
import { useHandleMessage } from '../hooks/useHandleMessage';
import { useMessagesToSend } from '../hooks/useMessagesToSend';
import { useSend } from '../hooks/useSend';

let client: WebSocketI;

export const CandlesWebSocketContextProvider = ({ children }: PropsWithChildren) => {
  const [isCandlesWebSocketReady, setCandlesWebSocketReadyAtom] = useAtom(candlesWebSocketReadyAtom);
  const chainId = useChainId();

  const waitForPongRef = useRef(false);

  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleWsMessage = useCandlesWsMessageHandler();

  const candlesWsUrl = useMemo(() => config.candlesWsUrl[`${chainId}`] || config.candlesWsUrl.default, [chainId]);

  usePingPong({
    client,
    isConnected,
    messages,
    waitForPongRef,
  });

  useHandleMessage({
    messages,
    setMessages,
    handleWsMessage,
  });

  const { setMessagesToSend } = useMessagesToSend({
    client,
    isConnected,
  });

  const send = useSend({
    client,
    isConnected,
    setMessagesToSend,
    waitForPongRef,
  });

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

  const contextValue: CandlesWebSocketContextI = useMemo(
    () => ({
      isConnected: isCandlesWebSocketReady,
      send,
    }),
    [isCandlesWebSocketReady, send]
  );

  return <CandlesWebSocketContext.Provider value={contextValue}>{children}</CandlesWebSocketContext.Provider>;
};
