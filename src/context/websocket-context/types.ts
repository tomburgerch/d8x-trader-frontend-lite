export enum MessageTypeE {
  Connect = 'connect',
  Error = 'error',
  Subscription = 'subscription',
  OnUpdateMarkPrice = 'onUpdateMarkPrice',
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

export interface SubscriptionWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.Subscription;
  data: {
    id: number;
    baseCurrency: string;
    quoteCurrency: string;
    collToQuoteIndexPrice: number;
    currentFundingRateBps: number;
    indexPrice: number;
    markPrice: number;
    maxPositionBC: number;
    midPrice: number;
    openInterestBC: number;
    state: string; // TODO: check for available statuses
  };
}

export interface OnUpdateMarkPriceWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.OnUpdateMarkPrice;
  data: {
    name: string;
    obj: {
      fundingRate: number;
      indexPrice: number;
      markPrice: number;
      midPrice: number;
      openInterest: number;
      perpetualId: number;
      symbol: string;
    };
  };
}
