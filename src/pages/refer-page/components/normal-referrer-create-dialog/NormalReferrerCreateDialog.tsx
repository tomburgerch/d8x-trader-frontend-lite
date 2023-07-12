import { Box, Button, OutlinedInput, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { SidesRow } from 'components/sides-row/SidesRow';

import styles from './NormalReferrerCreateDialog.module.scss';

interface NormalReferrerCreateDialogPropsI {
  onClose: () => void;
}

export const NormalReferrerCreateDialog = ({ onClose }: NormalReferrerCreateDialogPropsI) => {
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
            20%
          </Typography>
        </Box>
        <Box className={styles.paddedContainer}>
          <SidesRow leftSide="You receive" rightSide="15%" rightSideStyles={styles.sidesRowValue} />
          <SidesRow leftSide="Trader receives" rightSide="5%" rightSideStyles={styles.sidesRowValue} />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.kickbackRateInputContainer}>
          <Typography variant="bodySmall">Set Trader's Kickback Rate:</Typography>
          <OutlinedInput value={5} className={styles.kickbackInput} endAdornment="%" />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.codeInputContainer}>
          <OutlinedInput placeholder="Enter a code" value={''} className={styles.codeInput} />
        </Box>
        <Box className={styles.dialogActionsContainer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className={styles.enterCodeButton}>
            Enter a code
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
