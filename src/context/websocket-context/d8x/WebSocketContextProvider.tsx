import { useAtom } from 'jotai';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { useChainId } from 'wagmi';

import { config } from 'config';
import { webSocketReadyAtom } from 'store/pools.store';

import { createWebSocketWithReconnect } from '../createWebSocketWithReconnect';
import { useHandleMessage } from '../hooks/useHandleMessage';
import { useMessagesToSend } from '../hooks/useMessagesToSend';
import { usePingPong } from '../hooks/usePingPong';
import { useSend } from '../hooks/useSend';
import { WebSocketI } from '../types';
import { useWsMessageHandler } from './useWsMessageHandler';
import { WebSocketContext, WebSocketContextI } from './WebSocketContext';

let client: WebSocketI;

export const WebSocketContextProvider = ({ children }: PropsWithChildren) => {
  const [isWebSocketReady, setWebSocketReady] = useAtom(webSocketReadyAtom);
  const chainId = useChainId();

  const waitForPongRef = useRef(false);

  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleWsMessage = useWsMessageHandler();

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
    const wsUrl = config.wsUrl[`${chainId}`] || config.wsUrl.default;
    client = createWebSocketWithReconnect(wsUrl);
    client.onStateChange(setIsConnected);

    const handleMessage = (message: string) => {
      setMessages((prevState) => [...prevState, message]);
    };
    client.on(handleMessage);
    return () => {
      client.off(handleMessage);
    };
  }, [chainId]);

  useEffect(() => {
    if (!isConnected) {
      setWebSocketReady(false);
    }
  }, [setWebSocketReady, isConnected]);

  const contextValue: WebSocketContextI = useMemo(
    () => ({
      isConnected: isWebSocketReady,
      send,
    }),
    [isWebSocketReady, send]
  );

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};
