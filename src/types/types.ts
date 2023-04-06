import { BigNumberish, BytesLike } from 'ethers';
import { Time } from 'lightweight-charts';
import type { ReactNode } from 'react';

import { AlignE, ExpiryE, OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from './enums';

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
}

export interface PerpetualStatisticsI {
  id: number;
  baseCurrency: string;
  quoteCurrency: string;
  poolName: string;
  midPrice: number;
  markPrice: number;
  indexPrice: number;
  currentFundingRateBps: number;
  openInterestBC: number;
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
  proxyAddr: string;
}

export interface PerpetualStaticInfoI {
  id: number;
  limitOrderBookAddr: string;
  initialMarginRate: number;
  maintenanceMarginRate: number;
  S2Symbol: string;
  S3Symbol: string;
  lotSizeBC: number;
}

// Taken from `@d8x/perpetuals-sdk/src/nodeSDKTypes.ts`
export interface MarginAccountI {
  symbol: string;
  positionNotionalBaseCCY: number;
  side: string;
  entryPrice: number;
  leverage: number;
  markPrice: number;
  unrealizedPnlQuoteCCY: number;
  unrealizedFundingCollateralCCY: number;
  collateralCC: number;
  liquidationPrice: [number, number | undefined];
  liquidationLvg: number;
  collToQuoteConversion: number;
}

export interface PerpetualOpenOrdersI {
  orders: OrderI[];
  orderIds: string[];
}

// Taken from node_modules/@mui/base/SliderUnstyled/useSlider.types.d.ts. Cannot be imported without new library in deps
export interface MarkI {
  value: number;
  label?: ReactNode;
}

export interface OrderInfoI {
  symbol: string;
  poolName: string;
  baseCurrency: string;
  quoteCurrency: string;
  orderType: OrderTypeE;
  orderBlock: OrderBlockE;
  leverage: number;
  size: number;
  midPrice: number;
  tradingFee: number;
  collateral: number;
  maxMinEntryPrice: number | null;
  keepPositionLeverage: boolean;
  reduceOnly: boolean | null;
  limitPrice: number | null;
  triggerPrice: number | null;
  expireDays: ExpiryE | null;
  stopLoss: StopLossE | null;
  stopLossPrice: number | null;
  takeProfit: TakeProfitE | null;
  takeProfitPrice: number | null;
}

export interface OrderI {
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  reduceOnly?: boolean | undefined;
  limitPrice?: number | undefined;
  keepPositionLvg?: boolean | undefined;
  brokerFeeTbps?: number | undefined;
  brokerAddr?: string | undefined;
  brokerSignature?: BytesLike | undefined;
  stopPrice?: number | undefined;
  leverage?: number | undefined;
  deadline?: number | undefined;
  timestamp: number;
  submittedBlock?: number;
}

export interface OrderWithIdI extends OrderI {
  id: string;
}

export interface SmartContractOrderI {
  flags: BigNumberish;
  iPerpetualId: BigNumberish;
  brokerFeeTbps: BigNumberish;
  traderAddr: string;
  brokerAddr: string;
  referrerAddr: string;
  brokerSignature: BytesLike;
  fAmount: BigNumberish;
  fLimitPrice: BigNumberish;
  fTriggerPrice: BigNumberish;
  fLeverage: BigNumberish;
  iDeadline: BigNumberish;
  createdTimestamp: BigNumberish;
  submittedTimestamp: BigNumberish;
}

export interface OrderDigestI {
  digests: string[];
  orderIds: string[];
  OrderBookAddr: string;
  abi: string | string[];
  SCOrders: SmartContractOrderI[];
}

export interface CancelOrderResponseI {
  OrderBookAddr: string;
  abi: string;
  digest: string;
  priceUpdate: PriceUpdatesI;
}

export interface CollateralChangeResponseI {
  perpId: number;
  proxyAddr: string;
  abi: string;
  amountHex: string;
  priceUpdate: PriceUpdatesI;
}

export interface PriceUpdatesI {
  updateData: string[];
  publishTimes: number[];
  updateFee: number;
}

export interface MaxOrderSizeResponseI {
  buy: number;
  sell: number;
}

export interface TableHeaderI {
  label: JSX.Element | string;
  align: AlignE;
}

export interface TvChartCandleI {
  start: number;
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}
