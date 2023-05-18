import { config } from 'config';
import { getRequestOptions } from 'helpers/getRequestOptions';
import { FundingI, TradeHistoryI } from 'types/types';

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
