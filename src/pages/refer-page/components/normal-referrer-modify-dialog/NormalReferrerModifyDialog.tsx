import { Box, Button, Dialog, OutlinedInput, Typography } from '@mui/material';

import { SidesRow } from 'components/sides-row/SidesRow';

import styles from './NormalReferrerModifyDialog.module.scss';

interface NormalReferrerModifyDialogPropsI {
  onClose: () => void;
}

export const NormalReferrerModifyDialog = ({ onClose }: NormalReferrerModifyDialogPropsI) => {
  return (
    <Dialog open onClose={onClose}>
      <Box className={styles.dialogRoot}>
        <Typography variant="h5" className={styles.title}>
          Modify Referral Code
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
          <OutlinedInput disabled value={5} className={styles.kickbackInput} endAdornment="%" />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.paddedContainer}>
          <SidesRow leftSide="Your code" rightSide="MYCODE_1" rightSideStyles={styles.sidesRowValue} />
        </Box>
        <Box className={styles.dialogActionsContainer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary">Modify</Button>
        </Box>
      </Box>
    </Dialog>
  );
};
