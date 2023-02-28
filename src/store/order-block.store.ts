import { atom } from 'jotai';

import { ExpiryE, OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';
import { OrderInfoI } from 'types/types';

import { perpetualStatisticsAtom, poolFeeAtom } from './pools.store';
import { createSymbol } from '../helpers/createSymbol';

export const orderBlockAtom = atom<OrderBlockE>(OrderBlockE.Long);
export const orderTypeAtom = atom<OrderTypeE>(OrderTypeE.Market);
export const orderSizeAtom = atom(0);
export const triggerPriceAtom = atom(0);
export const leverageAtom = atom(1);
export const toleranceSliderAtom = atom(2);
export const keepPositionLeverageAtom = atom(false);
export const reduceOnlyAtom = atom(false);
export const expireDaysAtom = atom(ExpiryE['60D']);
export const stopLossAtom = atom(StopLossE.None);
export const takeProfitAtom = atom(TakeProfitE.None);

const limitPriceValueAtom = atom(-1);

export const limitPriceAtom = atom(
  (get) => {
    const orderType = get(orderTypeAtom);

    if (orderType === OrderTypeE.Market) {
      return null;
    }

    const limitPrice = get(limitPriceValueAtom);
    if (orderType === OrderTypeE.Limit) {
      return limitPrice < 0 ? 0 : limitPrice;
    }

    return limitPrice < 0 ? null : limitPrice;
  },
  (get, set, newLimitPrice: string) => {
    set(limitPriceValueAtom, newLimitPrice === '' || +newLimitPrice < 0 ? -1 : +newLimitPrice);
  }
);

export const orderInfoAtom = atom<OrderInfoI | null>((get) => {
  const perpetualStatistics = get(perpetualStatisticsAtom);
  if (!perpetualStatistics) {
    return null;
  }

  const poolFee = get(poolFeeAtom);
  const orderBlock = get(orderBlockAtom);
  const orderType = get(orderTypeAtom);
  const leverage = get(leverageAtom);
  const size = get(orderSizeAtom);
  const limitPrice = get(limitPriceAtom);
  const triggerPrice = get(triggerPriceAtom);
  const keepPositionLeverage = get(keepPositionLeverageAtom);
  const reduceOnly = get(reduceOnlyAtom);
  const slippage = get(toleranceSliderAtom);
  const expireDays = get(expireDaysAtom);
  const stopLoss = get(stopLossAtom);
  const takeProfit = get(takeProfitAtom);

  const collateral = 0; // TODO: newPositionRisk.collateralCC
  const tradingFee = (poolFee * size) / 100_000;

  let maxEntryPrice = null;
  if (orderType === OrderTypeE.Market) {
    maxEntryPrice = perpetualStatistics.midPrice * (1 + (slippage / 100) * (OrderBlockE.Short === orderBlock ? -1 : 1));
  }

  return {
    symbol: createSymbol({
      baseCurrency: perpetualStatistics.baseCurrency,
      quoteCurrency: perpetualStatistics.quoteCurrency,
      poolSymbol: perpetualStatistics.poolName,
    }),
    poolName: perpetualStatistics.poolName,
    baseCurrency: perpetualStatistics.baseCurrency,
    quoteCurrency: perpetualStatistics.quoteCurrency,
    orderBlock,
    orderType,
    leverage,
    size,
    price: perpetualStatistics.midPrice,
    tradingFee,
    collateral,
    maxEntryPrice,
    keepPositionLeverage,
    reduceOnly: orderType !== OrderTypeE.Market ? reduceOnly : null,
    expireDays: orderType !== OrderTypeE.Market ? expireDays : null,
    limitPrice: orderType !== OrderTypeE.Market ? limitPrice : null,
    triggerPrice: orderType === OrderTypeE.Stop ? triggerPrice : null,
    stopLoss,
    takeProfit,
  };
});
