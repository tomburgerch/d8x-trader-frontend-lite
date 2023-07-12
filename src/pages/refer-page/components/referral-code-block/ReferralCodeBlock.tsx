import { useState } from 'react';
import { useAccount } from 'wagmi';

import { Box, Button, Typography } from '@mui/material';

import { WalletConnectButton } from 'components/wallet-connect-button/WalletConnectButton';

import { EnterCodeDialog } from '../enter-code-dialog/EnterCodeDialog';

import styles from './ReferralCodeBlock.module.scss';

interface ReferralCodeBlockPropsI {
  referralCode: string;
  traderRebatePercentage: number;
}

export const ReferralCodeBlock = ({ referralCode, traderRebatePercentage }: ReferralCodeBlockPropsI) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { address } = useAccount();

  return (
    <Box className={styles.root}>
      <Box className={styles.topSection}>
        <Box>
          <Typography variant="bodySmall" component="p" className={styles.dataTitle}>
            Your rebate rate
          </Typography>
          <Typography variant="bodyLarge" className={styles.dataValue}>
            {address && traderRebatePercentage ? `${traderRebatePercentage * 100}%` : 'N/A'}
          </Typography>
        </Box>
        {address ? (
          <Button variant="primary" onClick={() => setDialogOpen(true)} className={styles.newCodeButton}>
            Enter new code
          </Button>
        ) : (
          <WalletConnectButton />
        )}
      </Box>
      <div className={styles.divider} />
      <Typography variant="bodySmall" component="p" className={styles.dataTitle}>
        Your active code
      </Typography>
      <Typography variant="bodyLarge" className={styles.dataValue}>
        {address && referralCode ? referralCode : 'N/A'}
      </Typography>
      {dialogOpen && <EnterCodeDialog onClose={() => setDialogOpen(false)} />}
    </Box>
  );
};
