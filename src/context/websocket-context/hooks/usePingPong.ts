import { MutableRefObject, useEffect } from 'react';

import { WebSocketI } from '../types';

const PING_MESSAGE = JSON.stringify({ type: 'ping' });
const WS_ALIVE_TIMEOUT = 10_000;

interface PingPongPropsI {
  client: WebSocketI;
  isConnected: boolean;
  messages: string[];
  waitForPongRef: MutableRefObject<boolean>;
}

export const usePingPong = ({ client, isConnected, messages, waitForPongRef }: PingPongPropsI) => {
  useEffect(() => {
    if (!client || !isConnected) {
      return;
    }

    let pingMessageTimeout = setTimeout(() => {
      if (client) {
        const sendResult = client.send(PING_MESSAGE);
        if (!sendResult) {
          client.reconnect();
          waitForPongRef.current = false;
          return;
        }

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
  }, [client, messages, isConnected, waitForPongRef]);
};
