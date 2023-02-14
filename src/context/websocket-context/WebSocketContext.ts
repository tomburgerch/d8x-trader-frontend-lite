import { createContext } from 'react';

export interface WebSocketContextI {
  isConnected: boolean;
  send: (message: string) => void;
}

export const WebSocketContext = createContext<WebSocketContextI>({
  isConnected: false,
  send: () => {},
});
