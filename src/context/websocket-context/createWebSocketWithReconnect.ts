import { config } from 'config';
import type { Dispatch, SetStateAction } from 'react';

const RECONNECT_TIMEOUT = 5000;

type ReactDispatchT = Dispatch<SetStateAction<boolean>>;

export function createWebSocketWithReconnect() {
  let client: WebSocket;
  let isConnected = false;
  let reconnectOnClose = true;
  let messageListeners: Array<(message: string) => void> = [];
  let stateChangeListeners: ReactDispatchT[] = [];

  const on = (fn: (message: string) => void) => {
    messageListeners.push(fn);
  };

  const off = (fn: (message: string) => void) => {
    messageListeners = messageListeners.filter((l) => l !== fn);
  };

  const onStateChange = (fn: ReactDispatchT) => {
    stateChangeListeners.push(fn);
    return () => {
      stateChangeListeners = stateChangeListeners.filter((l) => l !== fn);
    };
  };

  const start = () => {
    client = new WebSocket(config.wsUrl);

    client.onopen = () => {
      isConnected = true;
      stateChangeListeners.forEach((fn) => fn(true));
    };

    const close = client.close;

    // Close without reconnecting;
    client.close = () => {
      reconnectOnClose = false;
      close.call(client);
    };

    client.onmessage = (event) => {
      messageListeners.forEach((fn) => fn(event.data));
    };

    client.onerror = (e) => console.error(e);

    client.onclose = () => {
      isConnected = false;
      stateChangeListeners.forEach((fn) => fn(false));

      if (!reconnectOnClose) {
        console.log('ws closed by app');
        return;
      }

      console.log('ws closed by server');
      setTimeout(start, RECONNECT_TIMEOUT);
    };
  };

  start();

  return {
    on,
    off,
    onStateChange,
    close: () => client.close(),
    reconnect: () => {
      client.close();
      setTimeout(() => {
        reconnectOnClose = true;
        start();
      }, RECONNECT_TIMEOUT);
    },
    send: (message: string) => client.send(message),
    isConnected: () => isConnected,
  };
}
