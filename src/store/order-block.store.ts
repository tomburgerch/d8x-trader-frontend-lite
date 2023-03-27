import { atom } from 'jotai';

import { createSymbol } from 'helpers/createSymbol';
import { ExpiryE, OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';
import { OrderInfoI } from 'types/types';
import { mapSlippageToNumber } from 'utils/mapSlippageToNumber';
import { mapStopLossToNumber } from 'utils/mapStopLossToNumber';
import { mapTakeProfitToNumber } from 'utils/mapTakeProfitToNumber';

import { newPositionRiskAtom, perpetualStatisticsAtom, poolFeeAtom, positionsAtom } from './pools.store';

export const orderBlockAtom = atom<OrderBlockE>(OrderBlockE.Long);
export const orderTypeAtom = atom<OrderTypeE>(OrderTypeE.Market);
export const orderSizeAtom = atom(0);
export const triggerPriceAtom = atom(0);
export const leverageAtom = atom(1);
export const slippageSliderAtom = atom(2);
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

  const newPositionRisk = get(newPositionRiskAtom);
  const positions = get(positionsAtom);

  const poolFee = get(poolFeeAtom);
  const orderBlock = get(orderBlockAtom);
  const orderType = get(orderTypeAtom);
  const leverageSaved = get(leverageAtom);
  const size = get(orderSizeAtom);
  const limitPrice = get(limitPriceAtom);
  const triggerPrice = get(triggerPriceAtom);
  const keepPositionLeverage = get(keepPositionLeverageAtom);
  const reduceOnly = get(reduceOnlyAtom);
  const slippage = get(slippageSliderAtom);
  const expireDays = get(expireDaysAtom);
  const stopLoss = get(stopLossAtom);
  const takeProfit = get(takeProfitAtom);

  const symbol = createSymbol({
    baseCurrency: perpetualStatistics.baseCurrency,
    quoteCurrency: perpetualStatistics.quoteCurrency,
    poolSymbol: perpetualStatistics.poolName,
  });

  const positionBySymbol = positions.find((position) => position.symbol === symbol);

  const previousCollateralCC = !positionBySymbol ? 0 : positionBySymbol.collateralCC;
  const collateral = !newPositionRisk ? 0 : newPositionRisk.collateralCC - previousCollateralCC;

  let leverage = leverageSaved;
  if (keepPositionLeverage) {
    leverage = newPositionRisk?.leverage ?? 0;
  }

  let tradingFee = poolFee / 10;
  if (stopLoss !== StopLossE.None && takeProfit !== TakeProfitE.None) {
    tradingFee = tradingFee * 3;
  } else if (stopLoss !== StopLossE.None || takeProfit !== TakeProfitE.None) {
    tradingFee = tradingFee * 2;
  }

  let maxMinEntryPrice = null;
  if (orderType === OrderTypeE.Market) {
    maxMinEntryPrice =
      perpetualStatistics.midPrice * (1 + mapSlippageToNumber(slippage) * (OrderBlockE.Short === orderBlock ? -1 : 1));
  }

  let stopLossPrice = null;
  if (stopLoss !== StopLossE.None) {
    const stopLossMultiplier =
      // eslint-disable-next-line no-use-before-define
      1 - ((orderBlock === OrderBlockE.Long ? 1 : -1) * Math.abs(mapStopLossToNumber(stopLoss))) / leverage;

    if (orderType === OrderTypeE.Market && maxMinEntryPrice) {
      stopLossPrice = maxMinEntryPrice * stopLossMultiplier;
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
      // (1 + mapTakeProfitToNumber(takeProfit) * (orderBlock === OrderBlockE.Long ? 1 : -1)) / leverage;
      1 + ((orderBlock === OrderBlockE.Long ? 1 : -1) * mapTakeProfitToNumber(takeProfit)) / leverage;

    if (orderType === OrderTypeE.Market && maxMinEntryPrice) {
      takeProfitPrice = maxMinEntryPrice * takeProfitMultiplier;
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
    symbol,
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
    maxMinEntryPrice,
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
