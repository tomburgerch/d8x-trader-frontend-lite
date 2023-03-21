import { createContext } from 'react';

export interface CandlesWebSocketContextI {
  isConnected: boolean;
  send: (message: string) => void;
}

export const CandlesWebSocketContext = createContext<CandlesWebSocketContextI>({
  isConnected: false,
  send: () => {},
});
