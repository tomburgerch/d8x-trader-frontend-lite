import { useState, type ChangeEvent } from 'react';

import { Box, Button, OutlinedInput, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';

import styles from './EnterCodeDialog.module.scss';

interface EnterCodeDialogPropsI {
  onClose: () => void;
}

export const EnterCodeDialog = ({ onClose }: EnterCodeDialogPropsI) => {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
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
          <Button variant="primary" disabled={!inputValue} className={styles.enterCodeButton}>
            Enter new code
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
