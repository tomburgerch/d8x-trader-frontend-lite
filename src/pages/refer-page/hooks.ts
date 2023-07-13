import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import { getAgencyRebate, getReferralRebate } from 'network/referral';

import { checkCodeExists } from './helpers';

export enum ReferrerRoleE {
  NORMAL,
  AGENCY,
}

export const useRebateRate = (chainId: number, address: string | undefined, referrerRole: ReferrerRoleE) => {
  const [baseRebate, setBaseRebate] = useState(0);

  const getBaseRebateAsync = useCallback(async () => {
    if (address) {
      const baseRebateResponse =
        referrerRole === ReferrerRoleE.NORMAL
          ? await getReferralRebate(chainId, address)
          : await getAgencyRebate(chainId);
      return baseRebateResponse.data.percentageCut;
    }

    return 0;
  }, [address, chainId, referrerRole]);

  useEffect(() => {
    getBaseRebateAsync().then((percentageCut: number) => {
      setBaseRebate(percentageCut);
      //   setKickbackRateInputValue(`${0.25 * percentageCut}`);
    });
  }, [getBaseRebateAsync, baseRebate]);

  return baseRebate;
};

export enum CodeStateE {
  DEFAULT,
  CODE_TAKEN,
  CODE_AVAILABLE,
}

export const useCodeInput = (chainId: number) => {
  const [codeInputValue, setCodeInputValue] = useState('');
  const [codeState, setCodeState] = useState(CodeStateE.DEFAULT);

  const checkedCodesRef = useRef<string[]>([]);

  const codeInputDisabled = codeState !== CodeStateE.CODE_AVAILABLE;

  const handleCodeChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setCodeInputValue(value);

      // if user resets input reset code state to default
      if (value === '') {
        setCodeState(CodeStateE.DEFAULT);
        return;
      }

      // if input is filled

      let codeExists = false;

      // only check code on every keystroke if code has not been checked before (ref)
      if (!checkedCodesRef.current.find((element) => element === value)) {
        codeExists = await checkCodeExists(chainId, value);
        checkedCodesRef.current.push(value);
      }

      if (!codeExists) {
        setCodeState(CodeStateE.CODE_AVAILABLE);
        return;
      }

      setCodeState(CodeStateE.CODE_TAKEN);
    },
    [chainId]
  );

  return { codeInputValue, handleCodeChange, codeState, codeInputDisabled };
};
