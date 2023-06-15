import { config } from 'config';
import { getRequestOptions } from 'helpers/getRequestOptions';
import { EarningsI, FundingI, OpenWithdrawalsI, TradeHistoryI, WeeklyApiI } from 'types/types';

function getHistoryUrlByChainId(chainId: number) {
  return config.historyUrl[`${chainId}`] || config.historyUrl.default;
}

export function getTradesHistory(chainId: number, traderAddr: string): Promise<TradeHistoryI[]> {
  return fetch(`${getHistoryUrlByChainId(chainId)}/trades-history?traderAddr=${traderAddr}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getFundingRatePayments(chainId: number, traderAddr: string): Promise<FundingI[]> {
  return fetch(
    `${getHistoryUrlByChainId(chainId)}/funding-rate-payments?traderAddr=${traderAddr}`,
    getRequestOptions()
  ).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getWeeklyAPI(
  chainId: number,
  fromTimestamp: number,
  toTimestamp: number,
  poolSymbol: string
): Promise<WeeklyApiI> {
  const params = {
    fromTimestamp: fromTimestamp + '',
    toTimestamp: toTimestamp + '',
    poolSymbol,
  };
  return fetch(`${getHistoryUrlByChainId(chainId)}/apy?${new URLSearchParams(params)}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getEarnings(chainId: number, address: string, poolSymbol: string): Promise<EarningsI> {
  const params = {
    lpAddr: address,
    poolSymbol,
  };
  return fetch(`${getHistoryUrlByChainId(chainId)}/earnings?${new URLSearchParams(params)}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getOpenWithdrawals(chainId: number, address: string, poolSymbol: string): Promise<OpenWithdrawalsI> {
  const params = {
    lpAddr: address,
    poolSymbol,
  };
  return fetch(
    `${getHistoryUrlByChainId(chainId)}/open-withdrawals?${new URLSearchParams(params)}`,
    getRequestOptions()
  ).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}
