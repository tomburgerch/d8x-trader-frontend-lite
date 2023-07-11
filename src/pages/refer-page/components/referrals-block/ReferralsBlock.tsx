import { useAccount } from 'wagmi';

import { Box, Button, Typography } from '@mui/material';

import { WalletConnectButton } from 'components/wallet-connect-button/WalletConnectButton';

import styles from './ReferralsBlock.module.scss';
import { ReferralCodesTable } from 'components/referral-codes-table/ReferralCodesTable';

export const ReferralsBlock = () => {
  const { address } = useAccount();

  return (
    <Box className={styles.root}>
      <Box className={styles.buttonContainer}>
        {address ? (
          <Button variant="primary" className={styles.enterCodeButton}>
            Enter code
          </Button>
        ) : (
          <WalletConnectButton />
        )}
      </Box>
      <div className={styles.divider} />
      {address ? (
        <ReferralCodesTable />
      ) : (
        <>
          <Typography variant="bodySmall" component="p" className={styles.dataTitle}>
            Your codes
          </Typography>
          <Typography variant="bodyLarge" className={styles.dataValue}>
            N/A
          </Typography>
        </>
      )}
    </Box>
  );
};
