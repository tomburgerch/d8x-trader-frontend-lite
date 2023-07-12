import { Box, Button, Checkbox, Dialog, OutlinedInput, Typography } from '@mui/material';

import { SidesRow } from 'components/sides-row/SidesRow';

import styles from './AgencyReferrerModifyDialog.module.scss';

interface AgencyReferrerModifyDialogPropsI {
  onClose: () => void;
}

export const AgencyReferrerModifyDialog = ({ onClose }: AgencyReferrerModifyDialogPropsI) => {
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
          <SidesRow leftSide="Agency" rightSide="15%" rightSideStyles={styles.sidesRowValue} />
          <SidesRow leftSide="Referrer" rightSide="40%" rightSideStyles={styles.sidesRowValue} />
          <SidesRow leftSide="Trader" rightSide="10%" rightSideStyles={styles.sidesRowValue} />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.referrerKickbackInputContainer}>
          <Typography variant="bodySmall">Set Referrer's Kickback Rate:</Typography>
          <OutlinedInput value={40} className={styles.kickbackInput} endAdornment="%" />
        </Box>
        <Box className={styles.traderKickbackInputContainer}>
          <Typography variant="bodySmall">Set Trader's Kickback Rate:</Typography>
          <OutlinedInput value={10} className={styles.kickbackInput} endAdornment="%" />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.referrerChangeContainer}>
          <Box className={styles.referrerChangeFlexWrapper}>
            <Typography variant="bodySmall" className={styles.codeInputLabel} component="p">
              Change Referrer Address?
            </Typography>
            <Checkbox checked />
          </Box>
          <OutlinedInput placeholder="Enter an address" value={''} className={styles.codeInput} />
        </Box>
        <div className={styles.divider} />
        <Box className={styles.paddedContainer}>
          <SidesRow leftSide="Your code" rightSide="MY_CODE_1" rightSideStyles={styles.sidesRowValue} />
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
