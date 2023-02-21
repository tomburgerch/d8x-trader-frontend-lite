import { config } from 'config';
import { getRequestOptions } from 'helpers/getRequestOptions';
import type { ExchangeInfoI, PerpetualStaticInfoI, ValidatedResponseI } from 'types/types';

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
