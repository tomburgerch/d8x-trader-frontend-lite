export enum MessageTypeE {
  Connect = 'connect',
  Error = 'error',
  Subscription = 'subscription',
  OnUpdateMarkPrice = 'onUpdateMarkPrice',
  OnUpdateMarginAccount = 'onUpdateMarginAccount',
  OnPerpetualLimitOrderCancelled = 'onPerpetualLimitOrderCancelled',
  OnTrade = 'onTrade',
  OnLimitOrderCreated = 'onLimitOrderCreated',
}

enum MessageNameE {
  PriceUpdate = 'PriceUpdate',
  UpdateMarginAccount = 'UpdateMarginAccount',
  PerpetualLimitOrderCanceled = 'PerpetualLimitOrderCanceled',
  Trade = 'Trade',
  LimitOrderCreated = 'LimitOrderCreated',
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
    name: MessageNameE.PriceUpdate;
    obj: {
      symbol: string;
      fundingRate: number;
      indexPrice: number;
      markPrice: number;
      midPrice: number;
      openInterest: number;
      perpetualId: number;
    };
  };
}

export interface OnUpdateMarginAccountWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.OnUpdateMarginAccount;
  data: {
    name: MessageNameE.UpdateMarginAccount;
    obj: {
      symbol: string;
      perpetualId: number;
      traderAddr: string;
      // id of position
      positionId: string;
      // position size in base currency
      positionBC: number;
      // margin collateral in collateral currency
      cashCC: number;
      // average price * position size
      lockedInValueQC: number;
      // funding payment paid when
      // margin account was changed
      fundingPaymentCC: number;
    };
  };
}

export interface OnPerpetualLimitOrderCancelledWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.OnPerpetualLimitOrderCancelled;
  data: {
    name: MessageNameE.PerpetualLimitOrderCanceled;
    obj: {
      symbol: string;
      perpetualId: number;
      traderAddr: string;
      orderId: string;
    };
  };
}

export interface OnTradeWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.OnTrade;
  data: {
    name: MessageNameE.Trade;
    obj: {
      symbol: string;
      perpetualId: number;
      traderAddr: string;
      orderId: string;
    };
  };
}

export interface OnLimitOrderCreatedWsMessageI extends CommonWsMessageI {
  type: MessageTypeE.OnLimitOrderCreated;
  data: {
    name: MessageNameE.LimitOrderCreated;
    obj: {
      symbol: string;
      perpetualId: number;
      traderAddr: string;
      orderId: string;
    };
  };
}
