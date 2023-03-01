import { atom } from 'jotai';

import { ExpiryE, OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';
import { OrderInfoI } from 'types/types';

import { perpetualStatisticsAtom, poolFeeAtom } from './pools.store';
import { createSymbol } from '../helpers/createSymbol';
import { mapStopLossToNumber } from '../utils/mapStopLossToNumber';
import { mapTakeProfitToNumber } from '../utils/mapTakeProfitToNumber';

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

  let stopLossPrice = null;
  if (stopLoss !== StopLossE.None) {
    const stopLossMultiplier =
      (1 - Math.abs(mapStopLossToNumber(stopLoss)) * (orderBlock === OrderBlockE.Long ? 1 : -1)) / leverage;

    if (orderType === OrderTypeE.Market && maxEntryPrice) {
      stopLossPrice = maxEntryPrice * stopLossMultiplier;
    } else if (orderType === OrderTypeE.Limit && limitPrice) {
      stopLossPrice = limitPrice * stopLossMultiplier;
    } else if (orderType === OrderTypeE.Stop) {
      if (limitPrice !== null && limitPrice > -1) {
        stopLossPrice = limitPrice * stopLossMultiplier;
      } else {
        stopLossPrice = triggerPrice * stopLossMultiplier;
      }
    }
  }

  let takeProfitPrice = null;
  if (takeProfit !== TakeProfitE.None) {
    const takeProfitMultiplier =
      (1 + mapTakeProfitToNumber(takeProfit) * (orderBlock === OrderBlockE.Long ? 1 : -1)) / leverage;

    if (orderType === OrderTypeE.Market && maxEntryPrice) {
      takeProfitPrice = maxEntryPrice * takeProfitMultiplier;
    } else if (orderType === OrderTypeE.Limit && limitPrice) {
      takeProfitPrice = limitPrice * takeProfitMultiplier;
    } else if (orderType === OrderTypeE.Stop) {
      if (limitPrice !== null && limitPrice > -1) {
        takeProfitPrice = limitPrice * takeProfitMultiplier;
      } else {
        takeProfitPrice = triggerPrice * takeProfitMultiplier;
      }
    }
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
    midPrice: perpetualStatistics.midPrice,
    tradingFee,
    collateral,
    maxEntryPrice,
    keepPositionLeverage,
    reduceOnly: orderType !== OrderTypeE.Market ? reduceOnly : null,
    expireDays: orderType !== OrderTypeE.Market ? expireDays : null,
    limitPrice: orderType !== OrderTypeE.Market ? limitPrice : null,
    triggerPrice: orderType === OrderTypeE.Stop ? triggerPrice : null,
    stopLoss,
    stopLossPrice,
    takeProfit,
    takeProfitPrice,
  };
});
