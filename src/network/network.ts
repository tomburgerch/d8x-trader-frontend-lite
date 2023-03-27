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

  return fetch(`${config.apiUrl}/positionRisk?${params}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function positionRiskOnTrade(
  order: OrderI,
  traderAddr: string
): Promise<ValidatedResponseI<{ newPositionRisk: MarginAccountI; orderCost: number }>> {
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

export function positionRiskOnCollateralAction(
  traderAddr: string,
  amount: number,
  positionRisk: MarginAccountI
): Promise<ValidatedResponseI<{ newPositionRisk: MarginAccountI; availableMargin: number }>> {
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

export function getOpenOrders(
  symbol: string,
  traderAddr: string,
  timestamp?: number
): Promise<ValidatedResponseI<PerpetualOpenOrdersI>> {
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
  symbol: string,
  traderAddr: string,
  timestamp?: number
): Promise<ValidatedResponseI<MaxOrderSizeResponseI>> {
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
