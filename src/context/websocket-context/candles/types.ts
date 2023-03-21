export enum MessageTypeE {
  Connect = 'connect',
  Error = 'error',
  Subscribe = 'subscribe',
  Update = 'update',
}

export interface CommonWsMessageI {
  type: MessageTypeE;
  msg: string;
  data: unknown;
}

export interface ConnectWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.Connect;
}

export interface ErrorWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.Error;
}

export interface CandleDataI {
  start: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SubscribeWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.Subscribe;
  data: CandleDataI[];
}

export interface UpdateWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.Update;
  data: CandleDataI[];
}
