import { useAtom } from 'jotai';
import { memo, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { useChainId } from 'wagmi';

import { config } from 'config';
import { webSocketReadyAtom } from 'store/pools.store';

import { createWebSocketWithReconnect } from '../createWebSocketWithReconnect';
import { usePingPong } from '../hooks/usePingPong';
import { WebSocketI } from '../types';
import { WebSocketContext, WebSocketContextI } from './WebSocketContext';
import { useWsMessageHandler } from './useWsMessageHandler';
import { useHandleMessage } from '../hooks/useHandleMessage';
import { useMessagesToSend } from '../hooks/useMessagesToSend';
import { useSend } from '../hooks/useSend';

let client: WebSocketI;

export const WebSocketContextProvider = memo(({ children }: PropsWithChildren) => {
  const [isWebSocketReady, setWebSocketReady] = useAtom(webSocketReadyAtom);
  const chainId = useChainId();

  const waitForPongRef = useRef(false);

  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleWsMessage = useWsMessageHandler();

  const wsUrl = useMemo(() => config.wsUrl[`${chainId}`] || config.wsUrl.default, [chainId]);

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
    client = createWebSocketWithReconnect(wsUrl);
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
  }, [wsUrl]);

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
});
