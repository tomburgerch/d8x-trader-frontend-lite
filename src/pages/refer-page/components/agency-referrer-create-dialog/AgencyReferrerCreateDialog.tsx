import { type ChangeEvent, useEffect, useMemo, useState } from 'react';

import { Box, Button, OutlinedInput, Typography } from '@mui/material';
import { useAccount, useChainId, useSigner } from 'wagmi';

import { Dialog } from 'components/dialog/Dialog';
import { SidesRow } from 'components/sides-row/SidesRow';

import { CodeStateE, ReferrerRoleE, useCodeInput, useRebateRate } from 'pages/refer-page/hooks';

import { postUpsertReferralCode } from 'network/referral';

import { isValidAddress } from 'utils/isValidAddress';

import styles from './AgencyReferrerCreateDialog.module.scss';

enum KickbackRateTypeE {
  REFERRER,
  TRADER,
}

interface AgencyReferrerCreateDialogPropsI {
  onClose: () => void;
}

export const AgencyReferrerCreateDialog = ({ onClose }: AgencyReferrerCreateDialogPropsI) => {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const chainId = useChainId();

  const { codeInputValue, handleCodeChange, codeState, codeInputDisabled } = useCodeInput(chainId);

  const baseRebate = useRebateRate(chainId, address, ReferrerRoleE.AGENCY);

  const [referrersKickbackRate, setReferrersKickbackRate] = useState('0');
  useEffect(() => setReferrersKickbackRate((0.33 * baseRebate).toFixed(3)), [baseRebate]);

  const [tradersKickbackRate, setTradersKickbackRate] = useState('0');
  useEffect(() => setTradersKickbackRate((0.33 * baseRebate).toFixed(3)), [baseRebate]);

  const [referrerAddressInputValue, setReferrerAddressInputValue] = useState('');

  const sidesRowValues = useMemo(() => {
    const agencyRate = baseRebate - Number(referrersKickbackRate) - Number(tradersKickbackRate);
    const referrerRate = baseRebate - agencyRate - Number(tradersKickbackRate);
    const traderRate = baseRebate - agencyRate - Number(referrersKickbackRate);

    return {
      agencyRate: agencyRate.toFixed(3),
      referrerRate: referrerRate.toFixed(3),
      traderRate: traderRate.toFixed(3),
    };
  }, [baseRebate, referrersKickbackRate, tradersKickbackRate]);

  const handleKickbackRateChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: KickbackRateTypeE
  ) => {
    const { value } = event.target;
    type === KickbackRateTypeE.REFERRER ? setReferrersKickbackRate(value) : setTradersKickbackRate(value);
  };

  const handleReferrerAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setReferrerAddressInputValue(value);
  };

  const handleCreateCode = async () => {
    const isValidAddressEntered = isValidAddress(referrerAddressInputValue);
    if (!address || !signer || !isValidAddressEntered) {
      return;
    }
    const { agencyRate, referrerRate, traderRate } = sidesRowValues;

    const rateSum = Number(agencyRate) + Number(referrerRate) + Number(traderRate);

    const traderRebatePerc = (100 * Number(traderRate)) / rateSum;

    const agencyRebatePerc = (100 * Number(agencyRate)) / rateSum;

    const referrerRebatePerc = (100 * Number(referrerRate)) / rateSum;

    // TODO: MJO: Check - What are the possible return types? What if `type` === 'error'?
    await postUpsertReferralCode(
      chainId,
      referrerAddressInputValue,
      address,
      codeInputValue,
      traderRebatePerc,
      agencyRebatePerc,
      referrerRebatePerc,
      signer
    );
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
            leftSide="Agency"
            rightSide={`${sidesRowValues.agencyRate}%`}
            rightSideStyles={styles.sidesRowValue}
          />
          <SidesRow
            leftSide="Referrer"
            rightSide={`${sidesRowValues.referrerRate}%`}
            rightSideStyles={styles.sidesRowValue}
          />
          <SidesRow
            leftSide="Trader"
            rightSide={`${sidesRowValues.traderRate}%`}
            rightSideStyles={styles.sidesRowValue}
          />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.referrerKickbackInputContainer}>
          <Typography variant="bodySmall">Set Referrer's Kickback Rate:</Typography>
          <OutlinedInput
            type="number"
            inputProps={{ min: 0 }}
            value={referrersKickbackRate}
            onChange={(event) => handleKickbackRateChange(event, KickbackRateTypeE.REFERRER)}
            className={styles.kickbackInput}
            endAdornment="%"
          />
        </Box>
        <Box className={styles.traderKickbackInputContainer}>
          <Typography variant="bodySmall">Set Trader's Kickback Rate:</Typography>
          <OutlinedInput
            type="number"
            inputProps={{ min: 0 }}
            value={tradersKickbackRate}
            onChange={(event) => handleKickbackRateChange(event, KickbackRateTypeE.TRADER)}
            className={styles.kickbackInput}
            endAdornment="%"
          />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.codeInputContainer}>
          <Typography variant="bodySmall" className={styles.codeInputLabel} component="p">
            Enter Referrer Address:
          </Typography>
          <OutlinedInput
            placeholder="Enter an address"
            value={referrerAddressInputValue}
            onChange={handleReferrerAddressChange}
            className={styles.codeInput}
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
