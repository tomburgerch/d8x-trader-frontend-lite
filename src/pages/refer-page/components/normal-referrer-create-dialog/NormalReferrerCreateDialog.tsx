import { Box, Button, OutlinedInput, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';

import styles from './NormalReferrerCreateDialog.module.scss';

export const NormalReferrerCreateDialog = () => {
  return (
    <Dialog open>
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
        <Box className={styles.receivalContainer}>
          <Box className={styles.receivalRow}>
            <Typography variant="bodySmall">You receive</Typography>
            <Typography variant="bodyMedium" fontWeight={600}>
              15%
            </Typography>
          </Box>
          <Box className={styles.receivalRow}>
            <Typography variant="bodySmall">Trader receives</Typography>
            <Typography variant="bodyMedium" fontWeight={600}>
              5%
            </Typography>
          </Box>
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
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Enter a code</Button>
        </Box>
      </Box>
    </Dialog>
  );
};
