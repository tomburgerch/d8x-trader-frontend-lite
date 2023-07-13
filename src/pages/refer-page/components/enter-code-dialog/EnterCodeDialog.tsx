import { useCallback, useState, type ChangeEvent, useRef } from 'react';
import { useAccount, useChainId, useSigner } from 'wagmi';

import { Box, Button, OutlinedInput, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';

import { getReferralCodeExists, postUseReferralCode } from 'network/referral';

import styles from './EnterCodeDialog.module.scss';

enum CodeStateE {
  DEFAULT,
  CODE_NOT_FOUND,
  CODE_USABLE,
}

interface EnterCodeDialogPropsI {
  onClose: () => void;
}

export const EnterCodeDialog = ({ onClose }: EnterCodeDialogPropsI) => {
  const [inputValue, setInputValue] = useState('');
  const [codeState, setCodeState] = useState(CodeStateE.DEFAULT);

  const checkedCodesRef = useRef<string[]>([]);

  const { data: signer } = useSigner();
  const { address } = useAccount();
  const chainId = useChainId();

  const inputDisabled = codeState !== CodeStateE.CODE_USABLE;

  const checkCodeExists = useCallback(
    async (value: string) => {
      const codeExistsResponse = await getReferralCodeExists(chainId, value);
      return !codeExistsResponse.data.length ? false : true;
    },
    [chainId]
  );

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setInputValue(value);

      // if user resets input reset code state to default
      if (value === '') {
        setCodeState(CodeStateE.DEFAULT);
        return;
      }

      // if input is filled

      let codeExists = false;

      // only check code on every keystroke if code has not been checked before (ref)
      if (!checkedCodesRef.current.find((element) => element === value)) {
        codeExists = await checkCodeExists(value);
        checkedCodesRef.current.push(value);
      }

      if (!codeExists) {
        setCodeState(CodeStateE.CODE_NOT_FOUND);
        return;
      }

      setCodeState(CodeStateE.CODE_USABLE);
    },
    [checkCodeExists]
  );

  const handleUseCode = async () => {
    /* Handle POST code used */
    if (!address || !signer) {
      return;
    }
    await postUseReferralCode(chainId, address, inputValue, signer);
  };

  return (
    <Dialog open onClose={onClose}>
      <Box className={styles.dialogRoot}>
        <Typography variant="h5" className={styles.title}>
          Enter Referral Code
        </Typography>
        <OutlinedInput placeholder="Enter a code" value={inputValue} onChange={handleChange} className={styles.input} />
        <Box className={styles.actionButtonsContainer}>
          <Button variant="secondary" className={styles.cancelButton} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={inputDisabled} onClick={handleUseCode} className={styles.enterCodeButton}>
            {codeState === CodeStateE.DEFAULT && 'Enter code'}
            {codeState === CodeStateE.CODE_NOT_FOUND && 'Code not found'}
            {codeState === CodeStateE.CODE_USABLE && 'Use code'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
