import { Box, Button, OutlinedInput, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';

import styles from './AgencyReferrerCreateDialog.module.scss';

interface AgencyReferrerCreateDialogPropsI {
  onClose: () => void;
}

export const AgencyReferrerCreateDialog = ({ onClose }: AgencyReferrerCreateDialogPropsI) => {
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
            75%
          </Typography>
        </Box>
        <Box className={styles.receivalContainer}>
          <Box className={styles.receivalRow}>
            <Typography variant="bodySmall">Agency</Typography>
            <Typography variant="bodyMedium" fontWeight={600}>
              15%
            </Typography>
          </Box>
          <Box className={styles.receivalRow}>
            <Typography variant="bodySmall">Referrer</Typography>
            <Typography variant="bodyMedium" fontWeight={600}>
              40%
            </Typography>
          </Box>
          <Box className={styles.receivalRow}>
            <Typography variant="bodySmall">Trader</Typography>
            <Typography variant="bodyMedium" fontWeight={600}>
              10%
            </Typography>
          </Box>
        </Box>
        <div className={styles.divider} />
        <Box className={styles.inputContainer}>
          <Typography variant="bodySmall">Set Referrer's Kickback Rate:</Typography>
          <OutlinedInput value={40} className={styles.kickbackInput} endAdornment="%" />
        </Box>
        <Box className={styles.traderKickbackInputContainer}>
          <Typography variant="bodySmall">Set Trader's Kickback Rate:</Typography>
          <OutlinedInput value={10} className={styles.kickbackInput} endAdornment="%" />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.codeInputContainer}>
          <Typography variant="bodySmall" className={styles.codeInputLabel} component="p">
            Enter Referrer Address:
          </Typography>
          <OutlinedInput placeholder="Enter an address" value={''} className={styles.codeInput} />
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
