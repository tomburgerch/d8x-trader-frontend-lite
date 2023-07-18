import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useChainId, useSigner } from 'wagmi';

import { Box, Button, OutlinedInput, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { SidesRow } from 'components/sides-row/SidesRow';
import { ToastContent } from 'components/toast-content/ToastContent';

import { postUpsertReferralCode } from 'network/referral';

import { CodeStateE, ReferrerRoleE, useCodeInput, useRebateRate } from 'pages/refer-page/hooks';

import { replaceSymbols } from 'utils/replaceInvalidSymbols';

import { ReferralDialogActionE } from 'types/enums';

import styles from './NormalReferrerDialog.module.scss';

interface NormalReferrerDialogCreatePropsI {
  type: ReferralDialogActionE.CREATE;
  onClose: () => void;
}

interface NormalReferrerDialogModifyPropsI {
  type: ReferralDialogActionE.MODIFY;
  code: string;
  onClose: () => void;
}

type UpdatedNormalReferrerDialogPropsT = NormalReferrerDialogCreatePropsI | NormalReferrerDialogModifyPropsI;

export const NormalReferrerDialog = (props: UpdatedNormalReferrerDialogPropsT) => {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const chainId = useChainId();

  const { codeInputValue, handleCodeChange, codeState, codeInputDisabled } = useCodeInput(chainId);

  const baseRebate = useRebateRate(chainId, address, ReferrerRoleE.NORMAL);

  const [kickbackRateInputValue, setKickbackRateInputValue] = useState('0');
  useEffect(() => setKickbackRateInputValue((0.25 * baseRebate).toFixed(3)), [baseRebate]);

  const sidesRowValues = useMemo(() => {
    const traderRate = +kickbackRateInputValue;
    const userRate = baseRebate - traderRate;

    return { userRate: userRate.toFixed(3), traderRate: traderRate.toFixed(3) };
  }, [baseRebate, kickbackRateInputValue]);

  const handleKickbackRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (+value > baseRebate) {
      setKickbackRateInputValue(String(baseRebate));
      return;
    }
    setKickbackRateInputValue(replaceSymbols(value));
  };

  const handleUpsertCode = async () => {
    if (!address || !signer) {
      return;
    }

    const { userRate, traderRate } = sidesRowValues;

    const rateSum = Number(userRate) + Number(traderRate);

    const traderRebatePerc = (100 * Number(traderRate)) / rateSum;
    const referrerRebatePerc = (100 * Number(userRate)) / rateSum;

    const code = props.type === ReferralDialogActionE.MODIFY ? props.code : codeInputValue;

    await postUpsertReferralCode(
      chainId,
      address,
      '',
      code,
      traderRebatePerc,
      0,
      referrerRebatePerc,
      signer,
      props.onClose
    );
    toast.success(
      <ToastContent
        title={`Code ${props.type === ReferralDialogActionE.CREATE ? 'created' : 'modified'} successfully`}
        bodyLines={[]}
      />
    );
  };

  return (
    <Dialog open onClose={props.onClose}>
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
            rightSide={`${sidesRowValues.userRate}%`}
            rightSideStyles={styles.sidesRowValue}
          />
          <SidesRow
            leftSide="Trader receives"
            rightSide={`${sidesRowValues.traderRate}%`}
            rightSideStyles={styles.sidesRowValue}
          />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.kickbackRateInputContainer}>
          <Typography variant="bodySmall">Set Trader's Kickback Rate:</Typography>
          <OutlinedInput
            type="number"
            value={kickbackRateInputValue}
            inputProps={{ min: 0, max: baseRebate }}
            onChange={handleKickbackRateChange}
            className={styles.kickbackInput}
            endAdornment="%"
          />
        </Box>
        <div className={styles.divider} />
        {props.type === ReferralDialogActionE.CREATE && (
          <Box className={styles.codeInputContainer}>
            <OutlinedInput
              placeholder="Enter a code"
              value={codeInputValue}
              onChange={handleCodeChange}
              className={styles.codeInput}
            />
          </Box>
        )}
        {props.type === ReferralDialogActionE.MODIFY && (
          <Box className={styles.paddedContainer}>
            <SidesRow leftSide="Your code" rightSide={props.code} rightSideStyles={styles.sidesRowValue} />
          </Box>
        )}
        <Box className={styles.dialogActionsContainer}>
          <Button variant="secondary" onClick={props.onClose}>
            Cancel
          </Button>
          {props.type === ReferralDialogActionE.CREATE && (
            <Button
              variant="primary"
              disabled={codeInputDisabled}
              onClick={handleUpsertCode}
              className={styles.enterCodeButton}
            >
              {codeState === CodeStateE.DEFAULT && 'Enter a code'}
              {codeState === CodeStateE.CODE_TAKEN && 'Code already taken'}
              {codeState === CodeStateE.CODE_AVAILABLE && 'Create code'}
            </Button>
          )}
          {props.type === ReferralDialogActionE.MODIFY && (
            <Button variant="primary" onClick={handleUpsertCode} className={styles.enterCodeButton}>
              Modify
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};
