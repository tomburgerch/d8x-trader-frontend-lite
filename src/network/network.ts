import { config } from 'config';
import { getRequestOptions } from 'helpers/getRequestOptions';
import type {
  ExchangeInfoI,
  MarginAccountI,
  OrderDigestI,
  OrderI,
  PerpetualOpenOrdersI,
  PerpetualStaticInfoI,
  ValidatedResponseI,
} from 'types/types';
import { RequestMethodE } from 'types/enums';
import { CancelOrderResponseI, CollateralChangeResponseI, MaxOrderSizeResponseI } from 'types/types';
import { TraderInterface } from '@d8x/perpetuals-sdk';

export function getExchangeInfo(): Promise<ValidatedResponseI<ExchangeInfoI>> {
  return fetch(`${config.apiUrl}/exchangeInfo`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getPerpetualStaticInfo(symbol: string): Promise<ValidatedResponseI<PerpetualStaticInfoI>> {
  return fetch(`${config.apiUrl}/perpetualStaticInfo?symbol=${symbol}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getTraderLoyalty(address: string): Promise<ValidatedResponseI<number>> {
  return fetch(`${config.apiUrl}/trader_loyalty?traderAddr=${address}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getPositionRisk(
  traderAPI: TraderInterface | null,
  symbol: string,
  traderAddr: string,
  timestamp?: number
): Promise<ValidatedResponseI<MarginAccountI>> {
  const params = new URLSearchParams({
    symbol,
    traderAddr,
  });
  if (timestamp) {
    params.append('t', '' + timestamp);
  }

  if (traderAPI) {
    console.log(`positionRisk through SDK: ${symbol} ${Date.now() / 1000}`);
    return traderAPI.positionRisk(traderAddr, symbol).then((data: MarginAccountI) => {
      return { type: 'positionRisk', msg: '', data: data } as ValidatedResponseI<MarginAccountI>;
    });
  } else {
    console.log(`positionRisk through REST: ${symbol} ${Date.now() / 1000}`);
    return fetch(`${config.apiUrl}/positionRisk?${params}`, getRequestOptions()).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function positionRiskOnTrade(
  traderAPI: TraderInterface | null,
  order: OrderI,
  traderAddr: string
): Promise<ValidatedResponseI<{ newPositionRisk: MarginAccountI; orderCost: number }>> {
  if (traderAPI) {
    console.log(`positionRiskOnTrade through SDK:  ${order.symbol} ${Date.now() / 1000}`);
    return traderAPI.positionRiskOnTrade(traderAddr, order).then((data) => {
      return { type: 'positionRiskOnTrade', msg: '', data: data } as ValidatedResponseI<{
        newPositionRisk: MarginAccountI;
        orderCost: number;
      }>;
    });
  } else {
    console.log(`positionRiskOnTrade through REST:  ${order.symbol} ${Date.now() / 1000}`);
    const requestOptions = {
      ...getRequestOptions(RequestMethodE.Post),
      body: JSON.stringify({
        order,
        traderAddr,
      }),
    };
    return fetch(`${config.apiUrl}/positionRiskOnTrade`, requestOptions).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function positionRiskOnCollateralAction(
  traderAPI: TraderInterface | null,
  traderAddr: string,
  amount: number,
  positionRisk: MarginAccountI
): Promise<ValidatedResponseI<{ newPositionRisk: MarginAccountI; availableMargin: number }>> {
  if (traderAPI) {
    console.log(`positionRiskOnCollateralAction through SDK: ${Date.now() / 1000}`);
    return traderAPI.positionRiskOnCollateralAction(amount, positionRisk).then((data) => {
      return traderAPI.getAvailableMargin(traderAddr, positionRisk.symbol).then((margin) => {
        return {
          type: 'positionRiskOnCollateralAction',
          msg: '',
          data: { newPositionRisk: data, availableMargin: margin },
        } as ValidatedResponseI<{ newPositionRisk: MarginAccountI; availableMargin: number }>;
      });
    });
  } else {
    console.log(`positionRiskOnCollateralAction through REST: ${Date.now() / 1000}`);
    const requestOptions = {
      ...getRequestOptions(RequestMethodE.Post),
      body: JSON.stringify({
        amount,
        traderAddr,
        positionRisk,
      }),
    };
    return fetch(`${config.apiUrl}/positionRiskOnCollateralAction`, requestOptions).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function getOpenOrders(
  traderAPI: TraderInterface | null,
  symbol: string,
  traderAddr: string,
  timestamp?: number
): Promise<ValidatedResponseI<PerpetualOpenOrdersI>> {
  if (traderAPI) {
    console.log(`getOpenOrders through SDK: ${Date.now() / 1000}`);
    return traderAPI.openOrders(traderAddr, symbol).then((data) => {
      return { type: 'openOrders', msg: '', data: data } as ValidatedResponseI<PerpetualOpenOrdersI>;
    });
  } else {
    console.log(`getOpenOrders through REST: ${Date.now() / 1000}`);
    const params = new URLSearchParams({
      symbol,
      traderAddr,
    });
    if (timestamp) {
      params.append('t', '' + timestamp);
    }

    return fetch(`${config.apiUrl}/openOrders?${params}`, getRequestOptions()).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function getPoolFee(poolSymbol: string, traderAddr?: string): Promise<ValidatedResponseI<number>> {
  return fetch(`${config.apiUrl}/queryFee?poolSymbol=${poolSymbol}&traderAddr=${traderAddr}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getMaxOrderSizeForTrader(
  traderAPI: TraderInterface | null,
  symbol: string,
  traderAddr: string,
  timestamp?: number
): Promise<ValidatedResponseI<MaxOrderSizeResponseI>> {
  if (traderAPI) {
    console.log(`TODO: maxOrderSizeForTrader through SDK: ${Date.now() / 1000}`);
    // return traderAPI.maxOrderSizeForTrader(traderAddr, symbol).then((data) => {
    //   return { type: 'openOrders', msg: '', data: data } as ValidatedResponseI<PerpetualOpenOrdersI>;
    // });
  }
  const params = new URLSearchParams({
    symbol,
    traderAddr,
  });
  if (timestamp) {
    params.append('t', '' + timestamp);
  }

  return fetch(`${config.apiUrl}/maxOrderSizeForTrader?${params}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function orderDigest(orders: OrderI[], traderAddr: string): Promise<ValidatedResponseI<OrderDigestI>> {
  const requestOptions = {
    ...getRequestOptions(RequestMethodE.Post),
    body: JSON.stringify({
      orders,
      traderAddr,
    }),
  };
  return fetch(`${config.apiUrl}/orderDigest`, requestOptions).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getCancelOrder(symbol: string, orderId: string): Promise<ValidatedResponseI<CancelOrderResponseI>> {
  return fetch(`${config.apiUrl}/cancelOrder?symbol=${symbol}&orderId=${orderId}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getAddCollateral(
  symbol: string,
  amount: number
): Promise<ValidatedResponseI<CollateralChangeResponseI>> {
  return fetch(`${config.apiUrl}/addCollateral?symbol=${symbol}&amount=${amount}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getAvailableMargin(
  symbol: string,
  traderAddr: string
): Promise<ValidatedResponseI<{ amount: number }>> {
  return fetch(`${config.apiUrl}/availableMargin?symbol=${symbol}&traderAddr=${traderAddr}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getRemoveCollateral(
  symbol: string,
  amount: number
): Promise<ValidatedResponseI<CollateralChangeResponseI>> {
  return fetch(`${config.apiUrl}/removeCollateral?symbol=${symbol}&amount=${amount}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}
