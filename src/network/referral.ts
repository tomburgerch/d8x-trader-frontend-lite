import { config } from 'config';
import { getRequestOptions } from 'helpers/getRequestOptions';
import { EarnedRebateI, OpenTraderRebateI, ReferralCodeI, ReferralVolumeI, ValidatedResponseI } from '../types/types';

function getReferralUrlByChainId(chainId: number) {
  return config.referralUrl[`${chainId}`] || config.referralUrl.default;
}

export function getIsAgency(chainId: number, traderAddr: string): Promise<ValidatedResponseI<boolean>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/is-agency?addr=${traderAddr}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getReferralVolume(chainId: number, traderAddr: string): Promise<ValidatedResponseI<ReferralVolumeI[]>> {
  return fetch(
    `${getReferralUrlByChainId(chainId)}/referral-volume?referrerAddr=${traderAddr}`,
    getRequestOptions()
  ).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getEarnedRebate(chainId: number, traderAddr: string): Promise<ValidatedResponseI<EarnedRebateI[]>> {
  return fetch(
    `${getReferralUrlByChainId(chainId)}/earned-rebate?referrerAddr=${traderAddr}`,
    getRequestOptions()
  ).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getReferralCodes(chainId: number, traderAddr: string): Promise<ValidatedResponseI<ReferralCodeI>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/my-referral-codes?addr=${traderAddr}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getOpenTraderRebate(
  chainId: number,
  traderAddr: string
): Promise<ValidatedResponseI<OpenTraderRebateI>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/open-trader-rebate?addr=${traderAddr}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getReferralRebate(chainId: number, traderAddr: string): Promise<ValidatedResponseI<ReferralCodeI>> {
  return fetch(
    `${getReferralUrlByChainId(chainId)}/referral-rebate?referrerAddr=${traderAddr}`,
    getRequestOptions()
  ).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getAgencyRebate(chainId: number): Promise<ValidatedResponseI<ReferralCodeI>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/agency-rebate`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}
