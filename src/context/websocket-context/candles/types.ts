export enum MessageTypeE {
  Connect = 'connect',
  Error = 'error',
  Subscription = 'subscription',
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
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SubscriptionWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.Subscription;
  data: CandleDataI[];
}

export interface UpdateWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.Update;
  data: CandleDataI[];
}
