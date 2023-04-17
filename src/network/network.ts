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
import { TraderInterface, BUY_SIDE, SELL_SIDE, floatToABK64x64 } from '@d8x/perpetuals-sdk';

function getApiUrlByChainId(chainId: number) {
  return config.apiUrl[`${chainId}`] || config.apiUrl.default;
}

export function getExchangeInfo(
  chainId: number,
  traderAPI: TraderInterface | null
): Promise<ValidatedResponseI<ExchangeInfoI>> {
  if (traderAPI) {
    // console.log('exchangeInfo via SDK');
    return traderAPI.exchangeInfo().then((info) => {
      return { type: 'exchangeInfo', msg: '', data: info } as ValidatedResponseI<ExchangeInfoI>;
    });
  } else {
    // console.log('exchangeInfo via BE');
    return fetch(`${getApiUrlByChainId(chainId)}/exchangeInfo`, getRequestOptions()).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function getPerpetualStaticInfo(
  chainId: number,
  traderAPI: TraderInterface | null,
  symbol: string
): Promise<ValidatedResponseI<PerpetualStaticInfoI>> {
  if (traderAPI) {
    // console.log('perpStaticInfo via SDK');
    const info = traderAPI.getPerpetualStaticInfo(symbol);
    return Promise.resolve({ type: 'perpetualStaticInfo', msg: '', data: info });
  } else {
    // console.log('perpStaticInfo via BE');
    return fetch(`${getApiUrlByChainId(chainId)}/perpetualStaticInfo?symbol=${symbol}`, getRequestOptions()).then(
      (data) => {
        if (!data.ok) {
          console.error({ data });
          throw new Error(data.statusText);
        }
        return data.json();
      }
    );
  }
}

// needs broker input: should go through backend
export function getTraderLoyalty(chainId: number, address: string): Promise<ValidatedResponseI<number>> {
  return fetch(`${getApiUrlByChainId(chainId)}/trader_loyalty?traderAddr=${address}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getPositionRisk(
  chainId: number,
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
    // console.log(`positionRisk via SDK ${symbol}`);
    return traderAPI.positionRisk(traderAddr, symbol).then((data: MarginAccountI) => {
      return { type: 'positionRisk', msg: '', data: data } as ValidatedResponseI<MarginAccountI>;
    });
  } else {
    // console.log(`positionRisk via BE ${symbol}`);
    return fetch(`${getApiUrlByChainId(chainId)}/positionRisk?${params}`, getRequestOptions()).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function positionRiskOnTrade(
  chainId: number,
  traderAPI: TraderInterface | null,
  order: OrderI,
  traderAddr: string,
  curAccount?: MarginAccountI
): Promise<ValidatedResponseI<{ newPositionRisk: MarginAccountI; orderCost: number }>> {
  if (traderAPI) {
    // console.log('positionRiskOnTrade via SDK');
    return traderAPI.positionRiskOnTrade(traderAddr, order, curAccount).then((data) => {
      return { type: 'positionRiskOnTrade', msg: '', data: data } as ValidatedResponseI<{
        newPositionRisk: MarginAccountI;
        orderCost: number;
      }>;
    });
  } else {
    // console.log('positionRiskOnTrade via BE');
    const requestOptions = {
      ...getRequestOptions(RequestMethodE.Post),
      body: JSON.stringify({
        order,
        traderAddr,
      }),
    };
    return fetch(`${getApiUrlByChainId(chainId)}/positionRiskOnTrade`, requestOptions).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function positionRiskOnCollateralAction(
  chainId: number,
  traderAPI: TraderInterface | null,
  traderAddr: string,
  amount: number,
  positionRisk: MarginAccountI
): Promise<ValidatedResponseI<{ newPositionRisk: MarginAccountI; availableMargin: number }>> {
  if (traderAPI) {
    // console.log('positionRiskOnCollateral via SDK');
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
    // console.log('positionRiskOnCollateral via BE');
    const requestOptions = {
      ...getRequestOptions(RequestMethodE.Post),
      body: JSON.stringify({
        amount,
        traderAddr,
        positionRisk,
      }),
    };
    return fetch(`${getApiUrlByChainId(chainId)}/positionRiskOnCollateralAction`, requestOptions).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function getOpenOrders(
  chainId: number,
  traderAPI: TraderInterface | null,
  symbol: string,
  traderAddr: string,
  timestamp?: number
): Promise<ValidatedResponseI<PerpetualOpenOrdersI>> {
  if (traderAPI) {
    // console.log(`openOrders via SDK ${symbol} `);
    return traderAPI.openOrders(traderAddr, symbol).then((data) => {
      return { type: 'openOrders', msg: '', data: data } as ValidatedResponseI<PerpetualOpenOrdersI>;
    });
  } else {
    // console.log(`openOrders via BE ${symbol}`);
    const params = new URLSearchParams({
      symbol,
      traderAddr,
    });
    if (timestamp) {
      params.append('t', '' + timestamp);
    }

    return fetch(`${getApiUrlByChainId(chainId)}/openOrders?${params}`, getRequestOptions()).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

// needs broker input, should go through backend
export function getPoolFee(
  chainId: number,
  poolSymbol: string,
  traderAddr?: string
): Promise<ValidatedResponseI<number>> {
  return fetch(
    `${getApiUrlByChainId(chainId)}/queryFee?poolSymbol=${poolSymbol}&traderAddr=${traderAddr}`,
    getRequestOptions()
  ).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getMaxOrderSizeForTrader(
  chainId: number,
  traderAPI: TraderInterface | null,
  order: OrderI,
  traderAddr: string,
  timestamp?: number
): Promise<ValidatedResponseI<MaxOrderSizeResponseI>> {
  const symbol = order.symbol;
  if (traderAPI) {
    return (
      traderAPI
        .positionRisk(traderAddr, symbol)
        .then((positionRisk) => {
          return traderAPI.maxOrderSizeForTrader(BUY_SIDE, positionRisk).then((buy) => {
            return traderAPI.maxOrderSizeForTrader(SELL_SIDE, positionRisk).then((sell) => {
              return {
                type: 'maxOrderSizeForTrader',
                msg: '',
                data: { buy: buy, sell: sell },
              } as ValidatedResponseI<MaxOrderSizeResponseI>;
            });
          });
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          console.log(error);
          throw new Error(error);
        })
    );
  } else {
    const params = new URLSearchParams({
      symbol,
      traderAddr,
    });
    if (timestamp) {
      params.append('t', '' + timestamp);
    }

    return fetch(`${getApiUrlByChainId(chainId)}/maxOrderSizeForTrader?${params}`, getRequestOptions()).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

// needs broker input
export function orderDigest(
  chainId: number,
  orders: OrderI[],
  traderAddr: string
): Promise<ValidatedResponseI<OrderDigestI>> {
  const requestOptions = {
    ...getRequestOptions(RequestMethodE.Post),
    body: JSON.stringify({
      orders,
      traderAddr,
    }),
  };
  return fetch(`${getApiUrlByChainId(chainId)}/orderDigest`, requestOptions).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getCancelOrder(
  chainId: number,
  traderAPI: TraderInterface | null,
  symbol: string,
  orderId: string
): Promise<ValidatedResponseI<CancelOrderResponseI>> {
  if (traderAPI) {
    const cancelABI = traderAPI.getOrderBookABI(symbol, 'cancelOrder');
    return traderAPI.cancelOrderDigest(symbol, orderId).then((digest) => {
      return traderAPI.fetchLatestFeedPriceInfo(symbol).then((submission) => {
        return {
          type: 'cancelOrder',
          msg: '',
          data: {
            OrderBookAddr: digest.OBContractAddr,
            abi: cancelABI,
            digest: digest.digest,
            priceUpdate: {
              updateData: submission.priceFeedVaas,
              publishTimes: submission.timestamps,
              updateFee: traderAPI.PRICE_UPDATE_FEE_GWEI * submission.timestamps.length,
            },
          },
        };
      });
    });
  } else {
    return fetch(
      `${getApiUrlByChainId(chainId)}/cancelOrder?symbol=${symbol}&orderId=${orderId}`,
      getRequestOptions()
    ).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function getAddCollateral(
  chainId: number,
  traderAPI: TraderInterface | null,
  symbol: string,
  amount: number
): Promise<ValidatedResponseI<CollateralChangeResponseI>> {
  if (traderAPI) {
    const perpId = traderAPI.getPerpetualStaticInfo(symbol).id;
    const proxyAddr = traderAPI.getProxyAddress();
    const proxyABI = traderAPI.getProxyABI('deposit');
    const amountHex = floatToABK64x64(amount);
    return traderAPI.fetchLatestFeedPriceInfo(symbol).then((submission) => {
      return {
        type: 'addCollateral',
        msg: '',
        data: {
          perpId: perpId,
          proxyAddr: proxyAddr,
          abi: proxyABI,
          amountHex: amountHex.toString(),
          priceUpdate: {
            updateData: submission.priceFeedVaas,
            publishTimes: submission.timestamps,
            updateFee: traderAPI.PRICE_UPDATE_FEE_GWEI * submission.priceFeedVaas.length,
          },
        },
      };
    });
  } else {
    return fetch(
      `${getApiUrlByChainId(chainId)}/addCollateral?symbol=${symbol}&amount=${amount}`,
      getRequestOptions()
    ).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function getAvailableMargin(
  chainId: number,
  traderAPI: TraderInterface | null,
  symbol: string,
  traderAddr: string
): Promise<ValidatedResponseI<{ amount: number }>> {
  if (traderAPI) {
    return traderAPI.getAvailableMargin(traderAddr, symbol).then((margin) => {
      return { type: 'availableMargin', msg: '', data: { amount: margin } };
    });
  } else {
    return fetch(
      `${getApiUrlByChainId(chainId)}/availableMargin?symbol=${symbol}&traderAddr=${traderAddr}`,
      getRequestOptions()
    ).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function getRemoveCollateral(
  chainId: number,
  traderAPI: TraderInterface | null,
  symbol: string,
  amount: number
): Promise<ValidatedResponseI<CollateralChangeResponseI>> {
  if (traderAPI) {
    const perpId = traderAPI.getPerpetualStaticInfo(symbol).id;
    const proxyAddr = traderAPI.getProxyAddress();
    const proxyABI = traderAPI.getProxyABI('withdraw');
    const amountHex = floatToABK64x64(amount);
    return traderAPI.fetchLatestFeedPriceInfo(symbol).then((submission) => {
      return {
        type: 'removeCollateral',
        msg: '',
        data: {
          perpId: perpId,
          proxyAddr: proxyAddr,
          abi: proxyABI,
          amountHex: amountHex.toString(),
          priceUpdate: {
            updateData: submission.priceFeedVaas,
            publishTimes: submission.timestamps,
            updateFee: traderAPI.PRICE_UPDATE_FEE_GWEI * submission.priceFeedVaas.length,
          },
        },
      };
    });
  } else {
    return fetch(
      `${getApiUrlByChainId(chainId)}/removeCollateral?symbol=${symbol}&amount=${amount}`,
      getRequestOptions()
    ).then((data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    });
  }
}

export function getMarketClosedStatus(
  traderAPI: TraderInterface | null,
  symbol: string
): Promise<ValidatedResponseI<{ isMarketClosed: boolean }>> {
  if (traderAPI) {
    console.log('calling isMarketClosed');
    return traderAPI.isMarketClosed(symbol).then((isClosed) => {
      return {
        type: 'isMarketClosed',
        msg: '',
        data: { isMarketClosed: isClosed },
      };
    });
  } else {
    return Promise.resolve({
      type: 'isMarketClosed',
      msg: '',
      data: { isMarketClosed: true },
    });
  }
}
