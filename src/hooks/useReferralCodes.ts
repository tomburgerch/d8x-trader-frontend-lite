import { useCallback, useEffect, useState } from 'react';

import { getReferralCodes } from 'network/referral';
import { Address } from 'wagmi';

export const useReferralCodes = (address: Address | undefined, chainId: number) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [traderRebatePercentage, setTraderRebatePercentage] = useState(0);

  const getReferralCodesAsync = useCallback(async () => {
    if (address) {
      const referralCodesResponse = await getReferralCodes(chainId, address);
      const traderReferralDataExists = !!Object.keys(referralCodesResponse.data.trader).length;

      if (traderReferralDataExists) {
        const { code, traderRebatePercFinal } = referralCodesResponse.data.trader;
        setReferralCode(code);
        setTraderRebatePercentage(traderRebatePercFinal ?? 0);
      }
    }
  }, [address, chainId]);

  useEffect(() => {
    getReferralCodesAsync().then().catch(console.error);
  }, [getReferralCodesAsync]);

  return {
    referralCode,
    traderRebatePercentage,
    getReferralCodesAsync,
  };
};
