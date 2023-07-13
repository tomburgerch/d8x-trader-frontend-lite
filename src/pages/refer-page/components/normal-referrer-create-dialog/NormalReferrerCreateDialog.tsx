import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useChainId, useSigner } from 'wagmi';

import { Box, Button, OutlinedInput, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { SidesRow } from 'components/sides-row/SidesRow';

import { getReferralRebate, postUpsertReferralCodeNormal } from 'network/referral';

import { checkCodeExists } from 'pages/refer-page/helpers';

import styles from './NormalReferrerCreateDialog.module.scss';

enum CodeStateE {
  DEFAULT,
  CODE_TAKEN,
  CODE_AVAILABLE,
}

interface NormalReferrerCreateDialogPropsI {
  onClose: () => void;
}

export const NormalReferrerCreateDialog = ({ onClose }: NormalReferrerCreateDialogPropsI) => {
  const [kickbackRateInputValue, setKickbackRateInputValue] = useState('0');
  const [baseRebate, setBaseRebate] = useState(0);

  const [codeInputValue, setCodeInputValue] = useState('');
  const [codeState, setCodeState] = useState(CodeStateE.DEFAULT);

  const checkedCodesRef = useRef<string[]>([]);

  const codeInputDisabled = codeState !== CodeStateE.CODE_AVAILABLE;

  const { data: signer } = useSigner();
  const { address } = useAccount();
  const chainId = useChainId();

  const getBaseRebateAsync = useCallback(async () => {
    if (address) {
      const baseRebateResponse = await getReferralRebate(chainId, address);
      return baseRebateResponse.data.percentageCut;
    }

    return 0;
  }, [address, chainId]);

  useEffect(() => {
    getBaseRebateAsync().then((percentageCut: number) => {
      setBaseRebate(percentageCut);
      setKickbackRateInputValue(`${0.25 * percentageCut}`);
    });
  }, [getBaseRebateAsync, baseRebate]);

  const handleKickbackRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setKickbackRateInputValue(value);
  };

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

  const handleCreateCode = async () => {
    if (!address || !signer) {
      return;
    }
    const traderRebatePerc =
      (100 * Number(kickbackRateInputValue)) /
      (baseRebate - Number(kickbackRateInputValue) + Number(kickbackRateInputValue));
    const referrerRebatePerc =
      (100 * (baseRebate - Number(kickbackRateInputValue))) /
      (baseRebate - Number(kickbackRateInputValue) + Number(kickbackRateInputValue));

    await postUpsertReferralCodeNormal(chainId, address, codeInputValue, traderRebatePerc, referrerRebatePerc, signer);
  };

  return (
    <Dialog open onClose={onClose}>
      <Box className={styles.dialogRoot}>
        <Typography variant="h5" className={styles.title}>
          Create Referral Code
        </Typography>
        <Box className={styles.baseRebateContainer}>
          <Typography variant="bodyMedium" fontWeight={600}>
            Your Base Rebate Rate:
          </Typography>
          <Typography variant="bodyMedium" fontWeight={600}>
            {baseRebate}%
          </Typography>
        </Box>
        <Box className={styles.paddedContainer}>
          <SidesRow
            leftSide="You receive"
            rightSide={`${(baseRebate - Number(kickbackRateInputValue)).toFixed(3)}%`}
            rightSideStyles={styles.sidesRowValue}
          />
          <SidesRow
            leftSide="Trader receives"
            rightSide={`${kickbackRateInputValue}%`}
            rightSideStyles={styles.sidesRowValue}
          />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.kickbackRateInputContainer}>
          <Typography variant="bodySmall">Set Trader's Kickback Rate:</Typography>
          <OutlinedInput
            type="number"
            value={kickbackRateInputValue}
            inputProps={{ min: 0 }}
            onChange={handleKickbackRateChange}
            className={styles.kickbackInput}
            endAdornment="%"
          />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.codeInputContainer}>
          <OutlinedInput
            placeholder="Enter a code"
            value={codeInputValue}
            onChange={handleCodeChange}
            className={styles.codeInput}
          />
        </Box>
        <Box className={styles.dialogActionsContainer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={codeInputDisabled}
            onClick={handleCreateCode}
            className={styles.enterCodeButton}
          >
            {codeState === CodeStateE.DEFAULT && 'Enter a code'}
            {codeState === CodeStateE.CODE_TAKEN && 'Code already taken'}
            {codeState === CodeStateE.CODE_AVAILABLE && 'Create code'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
