export interface PerpetualI {
  id: number;
  state: string;
  baseCurrency: string;
  quoteCurrency: string;
  indexPrice: number;
  collToQuoteIndexPrice: number;
  markPrice: number;
  midPrice: number;
  currentFundingRateBps: number;
  openInterestBC: number;
  maxPositionBC: number;
}

export interface PoolI {
  isRunning: boolean;
  poolSymbol: string;
  marginTokenAddr: string;
  poolShareTokenAddr: string;
  defaultFundCashCC: number;
  pnlParticipantCashCC: number;
  totalAMMFundCashCC: number;
  totalTargetAMMFundSizeCC: number;
  brokerCollateralLotSize: number;
  perpetuals: PerpetualI[];
}

export interface ValidatedResponseI<T> {
  type: string;
  msg: string;
  data: T;
}

export interface ExchangeInfoI {
  pools: PoolI[];
  oracleFactoryAddr: string;
}
