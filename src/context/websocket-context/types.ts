import { Dispatch, SetStateAction } from 'react';

export type ReactDispatchT = Dispatch<SetStateAction<boolean>>;

export interface WebSocketI {
  on: (fn: (message: string) => void) => void;
  off: (fn: (message: string) => void) => void;
  onStateChange: (fn: ReactDispatchT) => () => void;
  close: () => void;
  reconnect: () => void;
  send: (message: string) => boolean;
  isConnected: () => boolean;
}
